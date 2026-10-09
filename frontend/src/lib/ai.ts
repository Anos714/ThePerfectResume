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

export type AtsStatus = "pass" | "warn" | "fail";

export interface AtsCheck {
  // Assigned client-side: Gemini returns label/status/detail with no id, and
  // the panel needs a stable React key.
  id: string;
  label: string;
  status: AtsStatus;
  detail: string;
}

export interface AtsScoreResult {
  score: number;
  checks: AtsCheck[];
  usage: AiUsage | null;
}

export interface AiCoverLetterResult {
  coverLetter: string;
  usage: AiUsage | null;
}

export type CoverLetterTone = "professional" | "friendly" | "confident";

// Mirrors the zod rules in backend/src/modules/ai/ai.schema.ts so a request
// that passes here is not rejected there.
export const MIN_SUGGEST_CONTEXT_LENGTH = 10;
export const MAX_SUGGEST_CONTEXT_LENGTH = 2000;
export const MIN_SUMMARY_LENGTH = 10;
export const MIN_ATS_CONTENT_LENGTH = 50;
export const MAX_ATS_CONTENT_LENGTH = 50000;
export const MIN_COVER_LETTER_RESUME_LENGTH = 50;
export const MAX_COVER_LETTER_RESUME_LENGTH = 20000;
export const MIN_JOB_DESCRIPTION_LENGTH = 10;
export const MAX_JOB_DESCRIPTION_LENGTH = 10000;

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

/**
 * Flatten the whole document into the plain text the AI module expects: the
 * contact block, summary, experience with bullet descriptions, education,
 * projects, skills, certifications and languages. Rows are kept even when only
 * partly filled so a grader can flag the gaps. `maxLength` is applied last so
 * the caller can match the target endpoint's schema cap.
 */
function buildResumeText(data: ResumeData, maxLength: number): string {
  const lines: string[] = [];

  const push = (label: string, value: string) => {
    const trimmed = value.trim();
    if (trimmed) lines.push(`${label}: ${trimmed}`);
  };

  const name = data.fullName.trim();
  if (name) lines.push(name);

  const contact = [
    data.email,
    data.phoneNumber,
    data.location,
    data.websiteUrl,
    data.linkedinUrl,
    data.githubUrl,
  ]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" | ");
  if (contact) lines.push(contact);

  push("Headline", data.headline);
  push("Summary", data.summary);

  data.experience.forEach((entry) => {
    const heading =
      [entry.role, entry.company]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" @ ") || "Experience";

    const dates = [entry.startDate, entry.currentlyWorking ? "Present" : entry.endDate]
      .map((value) => (value ?? "").trim())
      .filter(Boolean)
      .join(" - ");

    lines.push(dates ? `${heading} (${dates})` : heading);
    push("  Location", entry.location ?? "");
    push("  Details", entry.description ?? "");
    push("  Link", entry.workLink ?? "");
  });

  data.education.forEach((entry) => {
    const heading =
      [entry.degree, entry.fieldOfStudy]
        .map((value) => (value ?? "").trim())
        .filter(Boolean)
        .join(", ") || "Education";

    const dates = [entry.startYear, entry.endYear]
      .map((value) => (value ?? "").trim())
      .filter(Boolean)
      .join(" - ");
    const school = [entry.school, entry.location]
      .map((value) => (value ?? "").trim())
      .filter(Boolean)
      .join(", ");

    push(
      `${heading}${school ? ` @ ${school}` : ""}`,
      dates || (entry.grade ?? ""),
    );
  });

  data.projects.forEach((project) => {
    push(`Project ${project.title.trim()}`.trim(), project.description ?? "");
    push("  Tech", project.techStack.join(", "));
    push("  Live", project.liveLink ?? "");
    push("  Code", project.githubLink ?? "");
  });

  push("Skills", data.skills.join(", "));

  data.certifications.forEach((cert) => {
    const heading = [cert.name, cert.issuer]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(" @ ");
    push(`Certification ${heading}`.trim(), cert.issueDate ?? "");
  });

  data.languages.forEach((language) => {
    push(
      `Language ${language.name.trim()}`.trim(),
      language.proficiency,
    );
  });

  return lines.join("\n").slice(0, maxLength);
}

/**
 * The whole document as plain text, capped at the ATS endpoint's schema limit.
 */
export function buildAtsContext(data: ResumeData): string {
  return buildResumeText(data, MAX_ATS_CONTENT_LENGTH);
}

/**
 * The whole document as plain text, capped at the cover-letter endpoint's
 * schema limit.
 */
export function buildCoverLetterResumeData(data: ResumeData): string {
  return buildResumeText(data, MAX_COVER_LETTER_RESUME_LENGTH);
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

function isValidAtsStatus(status: unknown): status is AtsStatus {
  return status === "pass" || status === "warn" || status === "fail";
}

// Gemini's checks are shaped but not typed: a malformed response must degrade
// to "no checks" rather than crash the panel.
function normalizeAtsChecks(raw: unknown): AtsCheck[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item): item is Record<string, unknown> => {
      return typeof item === "object" && item !== null;
    })
    .map((item, index) => {
      const label = typeof item.label === "string" ? item.label.trim() : "";
      const detail = typeof item.detail === "string" ? item.detail.trim() : "";
      return {
        id: `ats_${index}`,
        label,
        detail,
        status: isValidAtsStatus(item.status) ? item.status : "warn",
      };
    })
    .filter((check) => check.label && check.detail);
}

function normalizeAtsScore(raw: unknown): number {
  const value = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export async function scoreAts(
  resumeId: string,
  content: string,
): Promise<AtsScoreResult> {
  const { data, response } = await apiFetchWithMeta<{
    score?: unknown;
    checks?: unknown;
  }>("/api/v1/ai/ats-score", {
    method: "POST",
    body: { resumeId, content },
  });

  return {
    score: normalizeAtsScore(data.score),
    checks: normalizeAtsChecks(data.checks),
    usage: readAiUsage(response),
  };
}

export async function generateCoverLetter(
  resumeId: string,
  resumeData: string,
  jobDescription: string,
  tone: CoverLetterTone = "professional",
): Promise<AiCoverLetterResult> {
  const { data, response } = await apiFetchWithMeta<{ coverLetter?: unknown }>(
    "/api/v1/ai/cover-letter",
    { method: "POST", body: { resumeId, resumeData, jobDescription, tone } },
  );

  const coverLetter =
    typeof data.coverLetter === "string" ? data.coverLetter.trim() : "";

  if (!coverLetter) {
    throw new Error("AI returned an empty cover letter. Please try again.");
  }

  return { coverLetter, usage: readAiUsage(response) };
}
