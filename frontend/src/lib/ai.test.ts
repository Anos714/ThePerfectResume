import { afterEach, describe, expect, mock, test } from "bun:test";
import { clearAccessToken, setAccessToken } from "@/lib/api";
import {
  ApiError,
} from "@/lib/api";
import {
  buildAtsContext,
  buildSuggestContext,
  MIN_ATS_CONTENT_LENGTH,
  MIN_SUGGEST_CONTEXT_LENGTH,
  MIN_SUMMARY_LENGTH,
  remainingAiSuggestions,
  rewriteSummary,
  scoreAts,
  suggestImprovements,
} from "@/lib/ai";
import type { ResumeData } from "@/data/types";

const BASE = "http://localhost:8080";

const jsonResponse = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
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

const emptyResume = (): ResumeData => ({
  fullName: "",
  headline: "",
  email: "",
  phoneNumber: "",
  location: "",
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
});

afterEach(() => {
  clearAccessToken();
  calls = [];
  responder = async () =>
    jsonResponse({ success: true, message: "ok", data: null });
});

setAccessToken("test-token");

describe("ai client — /suggest", () => {
  test("POSTs the resume id and context to the copilot endpoint", async () => {
    respondWith(async () =>
      jsonResponse({
        success: true,
        message: "ok",
        data: {
          suggestions: [
            { label: "Sharpen impact", text: "Led the redesign, lifting conversion 27%." },
          ],
        },
      }),
    );

    const result = await suggestImprovements("res_abc", "Led the redesign");

    expect(result.suggestions).toEqual([
      {
        id: "ai_0",
        label: "Sharpen impact",
        text: "Led the redesign, lifting conversion 27%.",
      },
    ]);
    expect(lastCall().url).toBe(`${BASE}/api/v1/ai/suggest`);
    expect(lastCall().init?.method).toBe("POST");
    expect(bodyOf()).toEqual({
      resumeId: "res_abc",
      context: "Led the redesign",
    });
  });

  test("reads the plan-gated quota counters off the response headers", async () => {
    respondWith(async () =>
      jsonResponse(
        { success: true, message: "ok", data: { suggestions: [] } },
        200,
        {
          "x-ai-usage-used": "4",
          "x-ai-usage-limit": "10",
          "x-ai-plan": "free",
        },
      ),
    );

    const { usage } = await suggestImprovements("res_abc", "Some context");

    expect(usage).toEqual({ used: 4, limit: 10, plan: "free" });
  });

  test("usage is null when the backend sends no quota headers", async () => {
    respondWith(async () =>
      jsonResponse({ success: true, message: "ok", data: { suggestions: [] } }),
    );

    const { usage } = await suggestImprovements("res_abc", "Some context");

    expect(usage).toBeNull();
  });

  test("drops malformed suggestions instead of crashing the panel", async () => {
    respondWith(async () =>
      jsonResponse({
        success: true,
        message: "ok",
        data: {
          suggestions: [
            { label: "Good label", text: "A sharp, quantified bullet." },
            { label: "No text" },
            { text: "No label" },
            null,
            "not an object",
            { label: "  ", text: "   " },
          ],
        },
      }),
    );

    const { suggestions } = await suggestImprovements("res_abc", "Context");

    expect(suggestions).toEqual([
      {
        id: "ai_0",
        label: "Good label",
        text: "A sharp, quantified bullet.",
      },
    ]);
  });

  test("a non-array payload degrades to an empty list", async () => {
    respondWith(async () =>
      jsonResponse({ success: true, message: "ok", data: { suggestions: null } }),
    );

    const { suggestions } = await suggestImprovements("res_abc", "Context");

    expect(suggestions).toEqual([]);
  });

  test("an exhausted quota surfaces as the backend's message", async () => {
    respondWith(async () =>
      jsonResponse(
        {
          success: false,
          message: "Daily AI suggestion limit reached (10).",
        },
        429,
      ),
    );

    expect(
      suggestImprovements("res_abc", "Context"),
    ).rejects.toMatchObject({
      name: "ApiError",
      status: 429,
      message: "Daily AI suggestion limit reached (10).",
    });
  });
});

describe("ai client — /summary", () => {
  test("POSTs the resume id, summary and tone", async () => {
    respondWith(async () =>
      jsonResponse({
        success: true,
        message: "ok",
        data: { summary: "Product designer who ships." },
      }),
    );

    const result = await rewriteSummary("res_abc", "I am a designer");

    expect(result.summary).toBe("Product designer who ships.");
    expect(lastCall().url).toBe(`${BASE}/api/v1/ai/summary`);
    expect(lastCall().init?.method).toBe("POST");
    expect(bodyOf()).toEqual({
      resumeId: "res_abc",
      summary: "I am a designer",
      tone: "professional",
    });
  });

  test("an explicit tone rides along", async () => {
    respondWith(async () =>
      jsonResponse({ success: true, message: "ok", data: { summary: "Hey." } }),
    );

    await rewriteSummary("res_abc", "I am a designer", "friendly");

    expect(bodyOf()).toEqual({
      resumeId: "res_abc",
      summary: "I am a designer",
      tone: "friendly",
    });
  });

  test("rejects an empty rewrite on a 200", async () => {
    respondWith(async () =>
      jsonResponse({ success: true, message: "ok", data: { summary: "   " } }),
    );

    expect(rewriteSummary("res_abc", "I am a designer")).rejects.toThrow(
      "AI returned an empty summary. Please try again.",
    );
  });
});

describe("ai client — /ats-score", () => {
  test("POSTs the resume id and whole-document content", async () => {
    respondWith(async () =>
      jsonResponse({
        success: true,
        message: "ok",
        data: {
          score: 78,
          checks: [
            { label: "Contact section parseable", status: "pass", detail: "All found." },
          ],
        },
      }),
    );

    const result = await scoreAts("res_abc", "Alexandra Carter\nSenior Designer");

    expect(result.score).toBe(78);
    expect(result.checks).toEqual([
      {
        id: "ats_0",
        label: "Contact section parseable",
        status: "pass",
        detail: "All found.",
      },
    ]);
    expect(lastCall().url).toBe(`${BASE}/api/v1/ai/ats-score`);
    expect(lastCall().init?.method).toBe("POST");
    expect(bodyOf()).toEqual({
      resumeId: "res_abc",
      content: "Alexandra Carter\nSenior Designer",
    });
  });

  test("reads the plan-gated quota counters off the response headers", async () => {
    respondWith(async () =>
      jsonResponse(
        { success: true, message: "ok", data: { score: 50, checks: [] } },
        200,
        {
          "x-ai-usage-used": "2",
          "x-ai-usage-limit": "10",
          "x-ai-plan": "free",
        },
      ),
    );

    const { usage } = await scoreAts("res_abc", "content");

    expect(usage).toEqual({ used: 2, limit: 10, plan: "free" });
  });

  test("clamps and rounds an out-of-range score", async () => {
    respondWith(async () =>
      jsonResponse({
        success: true,
        message: "ok",
        data: { score: 140.6, checks: [] },
      }),
    );

    expect((await scoreAts("res_abc", "content")).score).toBe(100);
  });

  test("a non-numeric score degrades to zero", async () => {
    respondWith(async () =>
      jsonResponse({
        success: true,
        message: "ok",
        data: { score: "not a number", checks: [] },
      }),
    );

    expect((await scoreAts("res_abc", "content")).score).toBe(0);
  });

  test("drops malformed checks and defaults unknown statuses to warn", async () => {
    respondWith(async () =>
      jsonResponse({
        success: true,
        message: "ok",
        data: {
          score: 60,
          checks: [
            { label: "Good", detail: "Fine.", status: "pass" },
            { label: "No detail", status: "pass" },
            { label: "", detail: "No label", status: "fail" },
            { label: "Odd status", detail: "Hmm.", status: "weird" },
            null,
            "nope",
          ],
        },
      }),
    );

    const { checks } = await scoreAts("res_abc", "content");

    expect(checks).toEqual([
      { id: "ats_0", label: "Good", status: "pass", detail: "Fine." },
      { id: "ats_3", label: "Odd status", status: "warn", detail: "Hmm." },
    ]);
  });

  test("a non-array checks payload degrades to an empty list", async () => {
    respondWith(async () =>
      jsonResponse({
        success: true,
        message: "ok",
        data: { score: 0, checks: null },
      }),
    );

    expect((await scoreAts("res_abc", "content")).checks).toEqual([]);
  });

  test("an exhausted quota surfaces as the backend's message", async () => {
    respondWith(async () =>
      jsonResponse(
        { success: false, message: "Daily AI suggestion limit reached (10)." },
        429,
      ),
    );

    expect(scoreAts("res_abc", "content")).rejects.toMatchObject({
      name: "ApiError",
      status: 429,
    });
  });
});

describe("buildSuggestContext", () => {
  test("empty resume yields nothing to grade", () => {
    expect(buildSuggestContext(emptyResume())).toBe("");
  });

  test("assembles headline, summary, roles, projects and skills", () => {
    const data = emptyResume();
    data.headline = "Senior Product Designer";
    data.summary = "Designer of systems.";
    data.experience = [
      {
        id: "exp_1",
        role: "Product Designer",
        company: "Acme",
        location: "",
        startDate: "2023-01",
        endDate: undefined,
        currentlyWorking: true,
        description: "Redesigned the onboarding flow.",
      },
    ];
    data.projects = [
      {
        id: "proj_1",
        title: "Design system",
        description: "Built a component library.",
        techStack: ["React"],
      },
    ];
    data.skills = ["Figma", "Prototyping"];

    expect(buildSuggestContext(data)).toEqual(
      [
        "Headline: Senior Product Designer",
        "Summary: Designer of systems.",
        "Product Designer @ Acme: Redesigned the onboarding flow.",
        "Project Design system: Built a component library.",
        "Skills: Figma, Prototyping",
      ].join("\n"),
    );
  });

  test("skips sections the user left blank", () => {
    const data = emptyResume();
    data.headline = "";
    data.summary = "   ";
    data.experience = [
      {
        id: "exp_1",
        role: "Engineer",
        company: "",
        startDate: "",
        currentlyWorking: false,
        description: "",
      },
    ];
    data.skills = [];

    expect(buildSuggestContext(data)).toBe("");
  });

  test("falls back to a generic heading for a description with no role or company", () => {
    const data = emptyResume();
    data.experience = [
      {
        id: "exp_1",
        role: "",
        company: "",
        startDate: "",
        currentlyWorking: false,
        description: "Shipped a thing.",
      },
    ];

    expect(buildSuggestContext(data)).toBe("Experience: Shipped a thing.");
  });

  test("never exceeds the backend's context cap", () => {
    const data = emptyResume();
    data.summary = "x".repeat(5000);

    expect(buildSuggestContext(data).length).toBe(2000);
  });

  test("the minimum length matches the backend schema", () => {
    expect(MIN_SUGGEST_CONTEXT_LENGTH).toBe(10);
    expect(MIN_SUMMARY_LENGTH).toBe(10);
  });
});

describe("buildAtsContext", () => {
  test("empty resume yields nothing to grade", () => {
    expect(buildAtsContext(emptyResume())).toBe("");
  });

  test("assembles the contact block, summary, roles, projects and skills", () => {
    const data = emptyResume();
    data.fullName = "Alex Carter";
    data.email = "alex@example.com";
    data.location = "San Francisco";
    data.headline = "Senior Product Designer";
    data.summary = "Designer of systems.";
    data.experience = [
      {
        id: "exp_1",
        role: "Product Designer",
        company: "Acme",
        location: "Remote",
        startDate: "2023-01",
        currentlyWorking: true,
        description: "Redesigned the onboarding flow.",
      },
    ];
    data.projects = [
      {
        id: "proj_1",
        title: "Design system",
        description: "Built a component library.",
        techStack: ["React", "Figma"],
      },
    ];
    data.skills = ["Figma", "Prototyping"];

    const lines = buildAtsContext(data).split("\n");

    expect(lines[0]).toBe("Alex Carter");
    expect(lines[1]).toBe("alex@example.com | San Francisco");
    expect(lines).toContain("Headline: Senior Product Designer");
    expect(lines).toContain("Summary: Designer of systems.");
    expect(lines).toContain("Product Designer @ Acme (2023-01 - Present)");
    expect(lines).toContain("  Details: Redesigned the onboarding flow.");
    expect(lines).toContain("Project Design system: Built a component library.");
    expect(lines).toContain("  Tech: React, Figma");
    expect(lines).toContain("Skills: Figma, Prototyping");
  });

  test("marks an ongoing role as Present and skips blank optional fields", () => {
    const data = emptyResume();
    data.experience = [
      {
        id: "exp_1",
        role: "Engineer",
        company: "",
        startDate: "2022",
        currentlyWorking: false,
        endDate: "2024",
        description: "",
      },
    ];

    const lines = buildAtsContext(data).split("\n");

    expect(lines).toContain("Engineer (2022 - 2024)");
    expect(lines.some((line) => line.startsWith("  Details"))).toBe(false);
  });

  test("includes education, certifications and languages", () => {
    const data = emptyResume();
    data.education = [
      {
        id: "edu_1",
        school: "State University",
        degree: "B.Sc",
        fieldOfStudy: "Computer Science",
        startYear: "2016",
        endYear: "2020",
      },
    ];
    data.certifications = [
      {
        id: "cert_1",
        name: "AWS Solutions Architect",
        issuer: "Amazon",
        issueDate: "2023",
      },
    ];
    data.languages = [{ id: "lang_1", name: "English", proficiency: "Native" }];

    const lines = buildAtsContext(data).split("\n");

    expect(lines).toContain(
      "B.Sc, Computer Science @ State University: 2016 - 2020",
    );
    expect(lines).toContain(
      "Certification AWS Solutions Architect @ Amazon: 2023",
    );
    expect(lines).toContain("Language English: Native");
  });

  test("never exceeds the backend's content cap", () => {
    const data = emptyResume();
    data.experience = [
      {
        id: "exp_1",
        role: "Engineer",
        company: "Acme",
        startDate: "",
        currentlyWorking: false,
        description: "x".repeat(60000),
      },
    ];

    expect(buildAtsContext(data).length).toBe(50000);
  });

  test("the minimum length matches the backend schema", () => {
    expect(MIN_ATS_CONTENT_LENGTH).toBe(50);
  });
});

describe("remainingAiSuggestions", () => {
  test("counts down from the limit", () => {
    expect(
      remainingAiSuggestions({ used: 3, limit: 10, plan: "free" }),
    ).toBe(7);
  });

  test("never goes negative at the limit", () => {
    expect(
      remainingAiSuggestions({ used: 12, limit: 10, plan: "free" }),
    ).toBe(0);
  });
});

describe("ApiError", () => {
  test("is the shape the panel switches on for a spent quota", () => {
    const error = new ApiError(429, "Daily AI suggestion limit reached (10).");

    expect(error.status).toBe(429);
    expect(error.isAuthError).toBe(false);
  });
});
