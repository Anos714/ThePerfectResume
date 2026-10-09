import { afterEach, describe, expect, mock, test } from "bun:test";
import { clearAccessToken, setAccessToken } from "@/lib/api";
import {
  coverLetterExcerpt,
  createCoverLetter,
  deleteCoverLetter,
  fetchCoverLetter,
  fetchCoverLetters,
  sortRecentCoverLetters,
  updateCoverLetter,
} from "@/lib/cover-letters";
import type { CoverLetterItem } from "@/lib/cover-letters";

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

let calls: FetchCall[] = [];
type Responder = (
  url: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

let responder: Responder = async () =>
  jsonResponse({ success: true, message: "ok", data: null });

const fetchMock = mock(async (url: string | URL | Request, init?: RequestInit) => {
  calls.push({ url, init });
  return responder(url, init);
});

globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

const respondWith = (next: Responder) => {
  responder = next;
};

const lastCall = () => calls[calls.length - 1];

const bodyOf = () => JSON.parse(lastCall().init?.body as string);

afterEach(() => {
  clearAccessToken();
  calls = [];
  responder = async () =>
    jsonResponse({ success: true, message: "ok", data: null });
});

setAccessToken("test-token");

describe("cover-letters client", () => {
  test("GET /api/v1/cover-letters unwraps the data array", async () => {
    const rows: CoverLetterItem[] = [
      {
        id: "cl_a",
        title: "Lumina — Senior Product Designer",
        companyName: "Lumina",
        role: "Senior Product Designer",
        tone: "confident",
        status: "final",
        content: "Hello there.",
        updatedAt: "2026-10-01T00:00:00Z",
      },
    ];

    respondWith(async () =>
      jsonResponse({ success: true, message: "ok", data: rows }),
    );

    const letters = await fetchCoverLetters();

    expect(letters).toEqual(rows);
    expect(lastCall().url).toBe(`${BASE}/api/v1/cover-letters`);
    expect(lastCall().init?.method).toBe("GET");
  });

  test("GET tolerates a null payload", async () => {
    respondWith(async () =>
      jsonResponse({ success: true, message: "ok", data: null }),
    );

    expect(await fetchCoverLetters()).toEqual([]);
  });

  test("GET a single letter by id", async () => {
    respondWith(async () =>
      jsonResponse({
        success: true,
        message: "ok",
        data: { id: "cl_a", title: "Lumina" },
      }),
    );

    const letter = await fetchCoverLetter("cl_a");

    expect(letter.title).toBe("Lumina");
    expect(lastCall().url).toBe(`${BASE}/api/v1/cover-letters/cl_a`);
    expect(lastCall().init?.method).toBe("GET");
  });

  test("POST creates with the generated body", async () => {
    respondWith(async () =>
      jsonResponse({ success: true, message: "created", data: { id: "cl_new" } }),
    );

    const created = await createCoverLetter({
      title: "Lumina — Designer",
      companyName: "Lumina",
      role: "Designer",
      tone: "professional",
      content: "Dear hiring manager...",
      jobDescription: "We are hiring a designer.",
    });

    expect(created.id).toBe("cl_new");
    expect(lastCall().url).toBe(`${BASE}/api/v1/cover-letters`);
    expect(lastCall().init?.method).toBe("POST");
    expect(bodyOf()).toEqual({
      title: "Lumina — Designer",
      companyName: "Lumina",
      role: "Designer",
      tone: "professional",
      content: "Dear hiring manager...",
      jobDescription: "We are hiring a designer.",
    });
  });

  test("PUT sends only the provided fields", async () => {
    respondWith(async () =>
      jsonResponse({
        success: true,
        message: "ok",
        data: { id: "cl_a", status: "final" },
      }),
    );

    await updateCoverLetter("cl_a", { status: "final" });

    expect(lastCall().url).toBe(`${BASE}/api/v1/cover-letters/cl_a`);
    expect(lastCall().init?.method).toBe("PUT");
    expect(bodyOf()).toEqual({ status: "final" });
  });

  test("DELETE targets the letter id", async () => {
    await deleteCoverLetter("cl_a");

    expect(lastCall().url).toBe(`${BASE}/api/v1/cover-letters/cl_a`);
    expect(lastCall().init?.method).toBe("DELETE");
  });
});

describe("sortRecentCoverLetters", () => {
  const make = (id: string, updatedAt?: string, createdAt?: string) => ({
    id,
    updatedAt,
    createdAt,
  });

  test("orders by updatedAt descending without mutating the input", () => {
    const input = [
      make("old", "2026-08-01T00:00:00Z"),
      make("new", "2026-10-05T00:00:00Z"),
    ];

    const sorted = sortRecentCoverLetters(input);

    expect(sorted.map((letter) => letter.id)).toEqual(["new", "old"]);
    expect(input.map((letter) => letter.id)).toEqual(["old", "new"]);
  });

  test("falls back to createdAt when updatedAt is missing", () => {
    const sorted = sortRecentCoverLetters([
      make("a", undefined, "2026-09-01T00:00:00Z"),
      make("b", "2026-10-01T00:00:00Z"),
    ]);

    expect(sorted.map((letter) => letter.id)).toEqual(["b", "a"]);
  });
});

describe("coverLetterExcerpt", () => {
  test("collapses whitespace and trims", () => {
    expect(coverLetterExcerpt("  Hello   world \n\n again  ")).toBe(
      "Hello world again",
    );
  });

  test("truncates long content with an ellipsis", () => {
    const excerpt = coverLetterExcerpt("x".repeat(200), 50);

    expect(excerpt.endsWith("…")).toBe(true);
    expect(excerpt.length).toBeLessThanOrEqual(51);
  });

  test("handles null content", () => {
    expect(coverLetterExcerpt(null)).toBe("");
    expect(coverLetterExcerpt(undefined)).toBe("");
  });
});