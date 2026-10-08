import { afterEach, describe, expect, mock, test } from "bun:test";
import { clearAccessToken, setAccessToken } from "@/lib/api";
import {
  ApiError,
} from "@/lib/api";
import {
  buildSuggestContext,
  MIN_SUGGEST_CONTEXT_LENGTH,
  MIN_SUMMARY_LENGTH,
  remainingAiSuggestions,
  rewriteSummary,
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

    expect(suggestions.map(({ id, ...rest }) => rest)).toEqual([
      { label: "Good label", text: "A sharp, quantified bullet." },
    ]);
    expect(suggestions[0].id).toBe("ai_0");
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
