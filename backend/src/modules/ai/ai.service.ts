import { getGeminiModel } from "@/config/gemini";
import { findResumeById } from "@/modules/resumes/resumes.repository";
import { AppError } from "@/utils/AppError";
import type { AiSuggestInput, AiSummaryInput } from "./ai.schema";

interface Suggestion {
  label: string;
  text: string;
}

interface ResumeSummary {
  headline?: string | null;
  skills?: unknown;
  experience?: unknown;
}

const skillsList = (resume: ResumeSummary): string => {
  if (!Array.isArray(resume.skills)) return "";
  return resume.skills.filter((s): s is string => typeof s === "string").join(", ");
};

const currentRoles = (resume: ResumeSummary): string => {
  if (!Array.isArray(resume.experience)) return "";
  return resume.experience
    .filter((exp): exp is Record<string, unknown> => typeof exp === "object" && exp !== null)
    .map((exp) => {
      const role = exp.role;
      const company = exp.company;
      return [typeof role === "string" ? role : "", typeof company === "string" ? company : ""]
        .filter(Boolean)
        .join(" @ ");
    })
    .filter(Boolean)
    .join(" | ");
};

const getOwnedResume = async (userId: string, resumeId: string) => {
  const resume = await findResumeById(userId, resumeId);
  if (!resume) throw AppError.NotFound("Resume not found");
  return resume;
};

const parseJsonArray = <T>(raw: string): T[] => {
  const trimmed = raw.trim();
  const parsed: unknown = JSON.parse(trimmed);
  if (!Array.isArray(parsed)) {
    throw AppError.InternalServerError("AI returned an unexpected (non-array) response");
  }
  return parsed as T[];
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Gemini returns transient 503s under load; retry with backoff before giving up.
const generateWithRetry = async (prompt: string): Promise<string> => {
  const model = getGeminiModel();
  const MAX_ATTEMPTS = 3;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await sleep(1500 * attempt);
      }
    }
  }

  console.error("Gemini failed after retries:", lastError);
  throw AppError.InternalServerError("AI service is busy. Please try again.");
};

export const aiSuggestService = async (
  userId: string,
  data: AiSuggestInput,
): Promise<{ suggestions: Suggestion[] }> => {
  const resume = await getOwnedResume(userId, data.resumeId);

  const prompt = `You are an expert resume writer and career coach.

A user is writing bullet points for their resume. Their rough notes are below. Turn each note into sharp, achievement-focused bullet points.

User's rough notes:
"""
${data.context}
"""

Context about the user:
- Headline: ${resume.headline || "not provided"}
- Target/current roles: ${currentRoles(resume) || "not provided"}
- Skills: ${skillsList(resume) || "not provided"}

Rules:
- Return a JSON array of objects, each with "label" (a short 2-4 word category like "Sharpen impact" or "Quantify outcome") and "text" (the improved bullet point).
- Bullet points must start with a strong action verb (e.g. Led, Shipped, Spearheaded, Reduced, Automated).
- Quantify outcomes wherever the notes hint at a metric; invent nothing. If no metric is implied, keep it concrete and specific without numbers.
- Each bullet must be a single sentence under 30 words.
- Return between 3 and 5 suggestions. Never more than 5.
- Do not wrap the JSON in markdown fences. Return raw JSON only.`;

  let raw: string;
  try {
    raw = await generateWithRetry(prompt);
  } catch {
    throw AppError.InternalServerError("AI suggestion failed. Please try again.");
  }

  let suggestions: Suggestion[];
  try {
    suggestions = parseJsonArray<Suggestion>(raw);
  } catch {
    throw AppError.InternalServerError("AI returned malformed suggestions. Please try again.");
  }

  const cleaned = suggestions
    .filter(
      (s): s is Suggestion =>
        typeof s === "object" &&
        s !== null &&
        typeof s.label === "string" &&
        typeof s.text === "string",
    )
    .map((s) => ({ label: s.label.trim(), text: s.text.trim() }))
    .filter((s) => s.label && s.text)
    .slice(0, 5);

  return { suggestions: cleaned };
};

export const aiSummaryService = async (
  userId: string,
  data: AiSummaryInput,
): Promise<{ summary: string }> => {
  const resume = await getOwnedResume(userId, data.resumeId);

  const prompt = `You are an expert resume writer.

Rewrite the user's professional summary to be sharper, more confident, and easier for recruiters to skim.

User's current summary:
"""
${data.summary}
"""

Context about the user:
- Headline: ${resume.headline || "not provided"}
- Skills: ${skillsList(resume) || "not provided"}

Tone: ${data.tone}

Rules:
- Return a JSON object: {"summary": "<rewritten summary>"}
- Length: 40 to 80 words.
- Write in the first person, no "I believe" or "I think" filler.
- Do not invent skills, employers, metrics, or years of experience that are not in the input.
- Keep it as one paragraph, no bullet points or line breaks.
- Do not wrap the JSON in markdown fences. Return raw JSON only.`;

  let raw: string;
  try {
    raw = await generateWithRetry(prompt);
  } catch {
    throw AppError.InternalServerError("AI summary rewrite failed. Please try again.");
  }

  let parsed: { summary?: unknown };
  try {
    parsed = JSON.parse(raw.trim());
  } catch {
    throw AppError.InternalServerError("AI returned a malformed summary. Please try again.");
  }

  const summary =
    typeof parsed.summary === "string" ? parsed.summary.trim() : "";

  if (!summary) {
    throw AppError.InternalServerError("AI returned an empty summary. Please try again.");
  }

  return { summary };
};
