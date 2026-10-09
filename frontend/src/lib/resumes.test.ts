import { afterEach, describe, expect, mock, test } from "bun:test";
import { clearAccessToken, setAccessToken } from "@/lib/api";
import {
  buildShareUrl,
  createResume,
  deleteResume,
  fetchResume,
  fetchResumes,
  fetchResumePublicLink,
  renameResume,
  setResumePublished,
  sortRecentResumes,
  updateResume,
  updateResumeAtsScore,
  updateResumeTemplate,
} from "@/lib/resumes";
import type { ResumeListItem, UpdateResumePayload } from "@/lib/resumes";

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

afterEach(() => {
  clearAccessToken();
  calls = [];
  responder = async () =>
    jsonResponse({ success: true, message: "ok", data: null });
});

// An authenticated client is what the dashboard actually runs with; without a
// token the request still goes out, just without the Authorization header.
setAccessToken("test-token");

describe("resumes client", () => {
  test("GET /api/v1/resumes unwraps the data array", async () => {
    const rows: ResumeListItem[] = [
      {
        id: "res_a",
        resumeTitle: "Designer — Lumina",
        template: "ats_professional",
        isPublished: true,
        atsScore: 98,
        views: 12,
        completion: 90,
        createdAt: "2026-09-01T00:00:00Z",
        updatedAt: "2026-10-01T00:00:00Z",
      },
    ];

    respondWith(async () =>
      jsonResponse({ success: true, message: "ok", data: rows }),
    );

    const resumes = await fetchResumes();

    expect(resumes).toEqual(rows);
    expect(lastCall().url).toBe(`${BASE}/api/v1/resumes`);
    expect(lastCall().init?.method).toBe("GET");
  });

  test("GET /api/v1/resumes tolerates a null payload", async () => {
    respondWith(async () =>
      jsonResponse({ success: true, message: "ok", data: null }),
    );

    expect(await fetchResumes()).toEqual([]);
  });

  test("POST creates with a title and template", async () => {
    respondWith(async () =>
      jsonResponse({ success: true, message: "created", data: { id: "res_new" } }),
    );

    const created = await createResume({
      resumeTitle: "Startup Roles",
      template: "modern",
    });

    expect(created.id).toBe("res_new");
    expect(lastCall().url).toBe(`${BASE}/api/v1/resumes`);
    expect(lastCall().init?.method).toBe("POST");
    expect(JSON.parse(lastCall().init?.body as string)).toEqual({
      resumeTitle: "Startup Roles",
      template: "modern",
    });
  });

  test("DELETE targets the resume id", async () => {
    await deleteResume("res_abc");

    expect(lastCall().url).toBe(`${BASE}/api/v1/resumes/res_abc`);
    expect(lastCall().init?.method).toBe("DELETE");
  });

  test("PATCH /rename sends the new title", async () => {
    respondWith(async () =>
      jsonResponse({ success: true, message: "ok", data: { id: "res_abc" } }),
    );

    await renameResume("res_abc", "New title");

    expect(lastCall().url).toBe(`${BASE}/api/v1/resumes/res_abc/rename`);
    expect(lastCall().init?.method).toBe("PATCH");
    expect(JSON.parse(lastCall().init?.body as string)).toEqual({
      resumeTitle: "New title",
    });
  });

  test("PATCH /template sends the template", async () => {
    respondWith(async () =>
      jsonResponse({ success: true, message: "ok", data: { id: "res_abc" } }),
    );

    await updateResumeTemplate("res_abc", "creative");

    expect(lastCall().url).toBe(`${BASE}/api/v1/resumes/res_abc/template`);
    expect(JSON.parse(lastCall().init?.body as string)).toEqual({
      template: "creative",
    });
  });

  test("visibility flips isPublished and isPublic together", async () => {
    respondWith(async () =>
      jsonResponse({ success: true, message: "ok", data: { id: "res_abc" } }),
    );

    await setResumePublished("res_abc", true);

    expect(lastCall().url).toBe(`${BASE}/api/v1/resumes/res_abc/visibility`);
    expect(JSON.parse(lastCall().init?.body as string)).toEqual({
      isPublished: true,
      isPublic: true,
    });
  });

  test("PATCH /ats-score stores the freshly computed score", async () => {
    respondWith(async () =>
      jsonResponse({
        success: true,
        message: "ok",
        data: { id: "res_abc", atsScore: 82 },
      }),
    );

    const saved = await updateResumeAtsScore("res_abc", 82);

    expect(saved.atsScore).toBe(82);
    expect(lastCall().url).toBe(`${BASE}/api/v1/resumes/res_abc/ats-score`);
    expect(lastCall().init?.method).toBe("PATCH");
    expect(JSON.parse(lastCall().init?.body as string)).toEqual({ atsScore: 82 });
  });

  test("the public-link endpoint is reachable on its own path", async () => {
    respondWith(async () =>
      jsonResponse({
        success: true,
        message: "ok",
        data: {
          resumeId: "res_abc",
          resumeTitle: "Startup Roles",
          shareUrl: "http://localhost:3000/public/resumes/res_abc",
        },
      }),
    );

    const link = await fetchResumePublicLink("res_abc");

    expect(link.shareUrl).toBe("http://localhost:3000/public/resumes/res_abc");
    // Not /public/res_abc — that path is the unauthenticated public view.
    expect(lastCall().url).toBe(
      `${BASE}/api/v1/resumes/res_abc/public-link`,
    );
  });

  test("GET a single resume by id", async () => {
    respondWith(async () =>
      jsonResponse({
        success: true,
        message: "ok",
        data: { id: "res_abc", resumeTitle: "Startup Roles" },
      }),
    );

    const resume = await fetchResume("res_abc");

    expect(resume.resumeTitle).toBe("Startup Roles");
    expect(lastCall().url).toBe(`${BASE}/api/v1/resumes/res_abc`);
    expect(lastCall().init?.method).toBe("GET");
  });

  test("PUT sends the whole document with both visibility flags", async () => {
    respondWith(async () =>
      jsonResponse({
        success: true,
        message: "ok",
        data: { id: "res_abc", resumeTitle: "Startup Roles" },
      }),
    );

    const payload: UpdateResumePayload = {
      resumeTitle: "Startup Roles",
      template: "modern",
      fullName: "Alexandra Carter",
      headline: "Senior Product Designer",
      phoneNumber: "",
      location: "San Francisco",
      websiteUrl: "",
      linkedinUrl: "",
      githubUrl: "",
      summary: "",
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      languages: [],
      isPublished: true,
      isPublic: true,
    };

    const saved = await updateResume("res_abc", payload);

    expect(saved.id).toBe("res_abc");
    expect(lastCall().url).toBe(`${BASE}/api/v1/resumes/res_abc`);
    expect(lastCall().init?.method).toBe("PUT");
    // A strict-equality check also proves no stray fields (email, ids) snuck in.
    expect(JSON.parse(lastCall().init?.body as string)).toEqual(payload);
  });
});

describe("buildShareUrl", () => {
  test("mirrors the backend share path", () => {
    expect(buildShareUrl("res_abc", "http://localhost:3000")).toBe(
      "http://localhost:3000/public/resumes/res_abc",
    );
  });
});

describe("sortRecentResumes", () => {
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

    const sorted = sortRecentResumes(input);

    expect(sorted.map((r) => r.id)).toEqual(["new", "old"]);
    expect(input.map((r) => r.id)).toEqual(["old", "new"]);
  });

  test("falls back to createdAt when updatedAt is missing", () => {
    const sorted = sortRecentResumes([
      make("a", undefined, "2026-09-01T00:00:00Z"),
      make("b", "2026-10-01T00:00:00Z"),
    ]);

    expect(sorted.map((r) => r.id)).toEqual(["b", "a"]);
  });
});
