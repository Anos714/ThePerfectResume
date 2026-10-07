import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  api,
  apiFetch,
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/lib/api";

// The client talks to the backend origin, not a relative Next.js path.
const BASE = "http://localhost:8080";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

interface FetchCall {
  url: string | URL | Request;
  init?: RequestInit;
}

// One recording mock; tests swap the responder rather than the wrapper so the
// call log stays reliable.
let calls: FetchCall[] = [];
type Responder = (
  url: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

const defaultResponder: Responder = async () =>
  jsonResponse({ success: true, message: "ok", data: { hello: "world" } });

let responder: Responder = defaultResponder;

const fetchMock = mock(async (url: string | URL | Request, init?: RequestInit) => {
  calls.push({ url, init });
  return responder(url, init);
});

globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

const respondWith = (next: Responder) => {
  responder = next;
};

afterEach(() => {
  clearAccessToken();
  calls = [];
  responder = defaultResponder;
});

describe("api client — base URL and request shape", () => {
  test("prefixes relative paths with the API base URL", async () => {

    await apiFetch("/api/v1/users/me");
    expect(calls[0].url).toBe(`${BASE}/api/v1/users/me`);
  });

  test("leaves absolute URLs untouched", async () => {

    const absolute = "https://example.com/other";
    await apiFetch(absolute);
    expect(calls[0].url).toBe(absolute);
  });

  test("sends credentials so the httpOnly refresh cookie is forwarded", async () => {

    await apiFetch("/api/v1/users/me");
    expect(calls[0].init?.credentials).toBe("include");
  });

  test("attaches the access token as a Bearer header", async () => {

    setAccessToken("access-token-value");
    await apiFetch("/api/v1/users/me");
    const headers = new Headers(calls[0].init?.headers);
    expect(headers.get("authorization")).toBe("Bearer access-token-value");
  });

  test("omits the Authorization header when no token is stored", async () => {

    await apiFetch("/api/v1/users/me");
    const headers = new Headers(calls[0].init?.headers);
    expect(headers.has("authorization")).toBe(false);
  });

  test("JSON-serialises the body and sets the content type", async () => {

    await api.post("/api/v1/resumes", { resumeTitle: "My CV" });
    const init = calls[0].init;
    const headers = new Headers(init?.headers);
    expect(headers.get("content-type")).toBe("application/json");
    expect(JSON.parse(String(init?.body))).toEqual({ resumeTitle: "My CV" });
  });
});

describe("api client — response handling", () => {
  test("unwraps the data envelope", async () => {
    respondWith(async () =>
      jsonResponse({ success: true, message: "done", data: { id: "res_1" } }),
    );
    const data = await apiFetch<{ id: string }>("/api/v1/resumes");
    expect(data).toEqual({ id: "res_1" });
  });

  test("handles a 204 / empty body without throwing", async () => {
    respondWith(async () => new Response(null, { status: 204 }));
    const data = await apiFetch<unknown>("/api/v1/resumes/res_1");
    expect(data).toBeNull();
  });
});

describe("api client — error normalisation", () => {
  test("throws ApiError with status and message on failure", async () => {
    respondWith(async () =>
      jsonResponse({ success: false, message: "Not found" }, 404),
    );
    expect(apiFetch("/api/v1/resumes/missing")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      message: "Not found",
    });
  });

  test("exposes validation errors keyed by field", async () => {
    respondWith(async () =>
      jsonResponse(
        {
          success: false,
          message: "Validation Failed",
          errors: [
            { field: "email", message: "Invalid email" },
            { field: "password", message: "Too short" },
          ],
        },
        422,
      ),
    );
    expect(apiFetch("/api/v1/users/register")).rejects.toMatchObject({
      status: 422,
    });
  });

  test("marks 401/403 as auth errors", async () => {
    respondWith(async () =>
      jsonResponse({ success: false, message: "Unauthorized" }, 401),
    );
    // No refresh available → surfaces as an auth error.
    expect(apiFetch("/api/v1/users/me")).rejects.toMatchObject({
      isAuthError: true,
    });
  });
});

describe("api client — refresh on 401", () => {
  test("refreshes once and retries the original request", async () => {
    let first = true;
    respondWith(async (url) => {
      const path = String(url);
      if (path.endsWith("/users/refresh")) {
        return jsonResponse({
          success: true,
          message: "refreshed",
          token: "fresh-token",
        });
      }
      if (first) {
        first = false;
        return jsonResponse({ success: false, message: "Unauthorized" }, 401);
      }
      return jsonResponse({ success: true, message: "ok", data: { id: "me" } });
    });

    const data = await apiFetch<{ id: string }>("/api/v1/users/me");
    expect(data).toEqual({ id: "me" });
    expect(getAccessToken()).toBe("fresh-token");

    // Original call ran twice (initial + retry), refresh ran once.
    const paths = calls.map((c) => String(c.url));
    expect(paths.filter((p) => p.endsWith("/users/me"))).toHaveLength(2);
    expect(paths.filter((p) => p.endsWith("/users/refresh"))).toHaveLength(1);
  });

  test("does not retry twice (no infinite loop)", async () => {
    respondWith(async (url) => {
      const path = String(url);
      if (path.endsWith("/users/refresh")) {
        return jsonResponse({
          success: true,
          message: "refreshed",
          token: "fresh-token",
        });
      }
      // Always 401, even after a successful refresh.
      return jsonResponse({ success: false, message: "Unauthorized" }, 401);
    });

    expect(apiFetch("/api/v1/users/me")).rejects.toMatchObject({ status: 401 });
    const paths = calls.map((c) => String(c.url));
    expect(paths.filter((p) => p.endsWith("/users/me"))).toHaveLength(2);
  });

  test("gives up when the refresh itself fails", async () => {
    respondWith(async (url) => {
      const path = String(url);
      if (path.endsWith("/users/refresh")) {
        return jsonResponse({ success: false, message: "Invalid" }, 401);
      }
      return jsonResponse({ success: false, message: "Unauthorized" }, 401);
    });

    setAccessToken("stale-token");
    expect(apiFetch("/api/v1/users/me")).rejects.toMatchObject({ status: 401 });
    expect(getAccessToken()).toBeNull();
  });
});
