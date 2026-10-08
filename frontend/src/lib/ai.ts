/**
 * Typed client for the `/api/v1/ai` module.
 *
 * The backend wraps every AI response in `{ success, message, data }` and
 * reports the caller's plan-gated daily quota out of band through
 * `X-AI-Usage-Used` / `X-AI-Usage-Limit` / `X-AI-Plan`, so these calls go
 * through `apiFetchWithMeta` and surface both.
 */

import { apiFetchWithMeta } from "@/lib/api";
import type { ResumeData } from "@/data/types";

export interface AiSuggestion {
  // Assigned client-side: Gemini returns label/text pairs with no id, and the
  // panel needs a stable React key plus a handle for the "added" affordance.
  id: string;
  label: string;
  text: string;
}

export interface AiUsage {
  used: number;
  limit: number;
  plan: string;
}

export interface AiSuggestResult {
  suggestions: AiSuggestion[];
  usage: AiUsage | null;
}

export interface AiSummaryResult {
  summary: string;
  usage: AiUsage | null;
}

// Mirrors the zod rules in backend/src/modules/ai/ai.schema.ts so a request
// that passes here is not rejected there.
export const MIN_SUGGEST_CONTEXT_LENGTH = 10;
export const MAX_SUGGEST_CONTEXT_LENGTH = 2000;
export const MIN_SUMMARY_LENGTH = 10;

const USAGE_USED_HEADER = "x-ai-usage-used";
const USAGE_LIMIT_HEADER = "x-ai-usage-limit";
const PLAN_HEADER = "x-ai-plan";

function readAiUsage(response: Response): AiUsage | null {
  const usedRaw = response.headers.get(USAGE_USED_HEADER);
  const limitRaw = response.headers.get(USAGE_LIMIT_HEADER);
  const plan = response.headers.get(PLAN_HEADER);

  if (usedRaw === null || limitRaw === null || plan === null) return null;

  const used = Number(usedRaw);
  const limit = Number(limitRaw);

  if (!Number.isFinite(used) || !Number.isFinite(limit)) return null;

  return { used, limit, plan };
}

/** Suggestions left after the call these counters describe. Never negative. */
export function remainingAiSuggestions(usage: AiUsage): number {
  return Math.max(0, usage.limit - usage.used);
}

/**
 * Assemble the "rough notes" `/ai/suggest` grades, from what the user has
 * already written. Empty sections contribute nothing, so a blank resume
 * yields an empty string the caller can gate on rather than firing a request
 * the backend is guaranteed to reject.
 */
export function buildSuggestContext(data: ResumeData): string {
  const lines: string[] = [];

  const push = (label: string, value: string) => {
    const trimmed = value.trim();
    if (trimmed) lines.push(`${label}: ${trimmed}`);
  };

  push("Headline", data.headline);
  push("Summary", data.summary);

  data.experience.forEach((entry) => {
    const heading =
      [entry.role, entry.company]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" @ ") || "Experience";
    push(heading, entry.description ?? "");
  });

  data.projects.forEach((project) => {
    push(`Project ${project.title.trim()}`.trim(), project.description ?? "");
  });

  push("Skills", data.skills.join(", "));

  return lines.join("\n").slice(0, MAX_SUGGEST_CONTEXT_LENGTH);
}

// Gemini's output is shaped but not typed: a malformed response must degrade to
// "no suggestions" rather than crash the panel.
function normalizeSuggestions(raw: unknown): AiSuggestion[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item): item is Record<string, unknown> => {
      return typeof item === "object" && item !== null;
    })
    .map((item, index) => {
      const label = typeof item.label === "string" ? item.label.trim() : "";
      const text = typeof item.text === "string" ? item.text.trim() : "";
      return { id: `ai_${index}`, label, text };
    })
    .filter((suggestion) => suggestion.label && suggestion.text);
}

export async function suggestImprovements(
  resumeId: string,
  context: string,
): Promise<AiSuggestResult> {
  const { data, response } = await apiFetchWithMeta<{ suggestions?: unknown }>(
    "/api/v1/ai/suggest",
    { method: "POST", body: { resumeId, context } },
  );

  return {
    suggestions: normalizeSuggestions(data.suggestions),
    usage: readAiUsage(response),
  };
}

export async function rewriteSummary(
  resumeId: string,
  summary: string,
  tone: "professional" | "friendly" | "confident" = "professional",
): Promise<AiSummaryResult> {
  const { data, response } = await apiFetchWithMeta<{ summary?: unknown }>(
    "/api/v1/ai/summary",
    { method: "POST", body: { resumeId, summary, tone } },
  );

  const rewritten = typeof data.summary === "string" ? data.summary.trim() : "";

  if (!rewritten) {
    throw new Error("AI returned an empty summary. Please try again.");
  }

  return { summary: rewritten, usage: readAiUsage(response) };
}
