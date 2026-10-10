import { geminiModelChain, getGeminiModel } from "@/config/gemini";
import { resumes } from "@/db/schema";
import { findResumeById } from "@/modules/resumes/resumes.repository";
import { AppError } from "@/utils/AppError";
import type {
  AiSuggestInput,
  AiSummaryInput,
  AtsScoreInput,
  CoverLetterInput,
  InterviewInput,
} from "./ai.schema";

type Resume = typeof resumes.$inferSelect;

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

// The SDK surfaces the HTTP status on the thrown error. 503 (model overloaded)
// and 429 (rate limited) are worth another go — either on the same model or the
// next one in the chain. A 404 means the model is gone for this key, so
// retrying it is pointless and the chain should move on immediately.
const errorStatus = (error: unknown): number | undefined => {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }
  return undefined;
};

const isRetryableStatus = (status: number | undefined): boolean =>
  status === 503 || status === 429 || status === 500;

// Try each model in the fallback chain with a short backoff between attempts on
// the same model. A persistent 503 on the configured primary no longer fails
// the whole request — a sibling model serves it instead.
const MAX_ATTEMPTS_PER_MODEL = 2;

const generateWithRetry = async (prompt: string): Promise<string> => {
  const models = geminiModelChain();
  let lastError: unknown = null;

  for (const modelName of models) {
    const model = getGeminiModel(modelName);

    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        lastError = error;
        const status = errorStatus(error);

        // A missing model (404) or a hard client error (400) won't be fixed by
        // retrying this model; jump straight to the next one.
        if (!isRetryableStatus(status)) break;

        if (attempt < MAX_ATTEMPTS_PER_MODEL) {
          await sleep(800 * attempt);
        }
      }
    }
  }

  console.error("Gemini failed across fallback chain:", lastError);
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

// ---------------------------------------------------------------------------
// ATS score — grade resume content against ATS best practices + a job desc
// ---------------------------------------------------------------------------

interface AtsCheck {
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

const isValidAtsStatus = (s: unknown): s is AtsCheck["status"] =>
  s === "pass" || s === "warn" || s === "fail";

const atsChecksFromJson = (raw: string): AtsCheck[] => {
  const parsed: unknown = JSON.parse(raw.trim());
  if (!Array.isArray(parsed)) {
    throw AppError.InternalServerError("AI returned an unexpected (non-array) ATS response");
  }
  return parsed
    .filter(
      (c): c is Record<string, unknown> =>
        typeof c === "object" && c !== null,
    )
    .map((c): AtsCheck => {
      const label = typeof c.label === "string" ? c.label.trim() : "";
      const detail = typeof c.detail === "string" ? c.detail.trim() : "";
      return {
        label,
        detail,
        status: isValidAtsStatus(c.status) ? c.status : "warn",
      };
    })
    .filter((c) => c.label && c.detail);
};

export const atsScoreService = async (
  userId: string,
  data: AtsScoreInput,
): Promise<{ score: number; checks: AtsCheck[] }> => {
  const resume = await getOwnedResume(userId, data.resumeId);

  const prompt = `You are an expert ATS (Applicant Tracking System) auditor and resume reviewer.

Grade the resume content below against ATS best practices.

Resume content:
"""
${data.content}
"""

Context about the owner:
- Headline: ${resume.headline || "not provided"}
- Target/current roles: ${currentRoles(resume) || "not provided"}
- Skills: ${skillsList(resume) || "not provided"}

Rules:
- Return a JSON array of objects, each with "label" (a short 2-5 word check name like "Contact section parseable" or "Keyword density"), "status" (one of "pass", "warn", "fail"), and "detail" (one sentence explaining the result and, if not a pass, how to fix it).
- Cover these areas: contact info parseable, standard section headings, keyword density vs the skills/target roles, action verbs in bullets, quantified outcomes, dates machine-readable, no complex tables/columns, consistent formatting.
- Return between 5 and 8 checks. Never more than 8.
- Do not wrap the JSON in markdown fences. Return raw JSON only.`;

  let raw: string;
  try {
    raw = await generateWithRetry(prompt);
  } catch {
    throw AppError.InternalServerError("ATS scoring failed. Please try again.");
  }

  let checks: AtsCheck[];
  try {
    checks = atsChecksFromJson(raw);
  } catch {
    throw AppError.InternalServerError("AI returned malformed ATS checks. Please try again.");
  }

  if (!checks.length) {
    throw AppError.InternalServerError("AI returned no ATS checks. Please try again.");
  }

  // Derive a 0-100 score from the check statuses: pass = full, warn = half, fail = 0.
  const weight = (s: AtsCheck["status"]) =>
    s === "pass" ? 1 : s === "warn" ? 0.5 : 0;
  const score = Math.round(
    (checks.reduce((sum, c) => sum + weight(c.status), 0) / checks.length) * 100,
  );

  return { score, checks };
};

// ---------------------------------------------------------------------------
// Cover letter — generate a tailored cover letter from resume + job posting
// ---------------------------------------------------------------------------

export const coverLetterService = async (
  userId: string,
  data: CoverLetterInput,
): Promise<{ coverLetter: string }> => {
  const resume = await getOwnedResume(userId, data.resumeId);

  const prompt = `You are an expert cover letter writer.

Write a tailored, persuasive cover letter for the user based on their resume and the job description.

User's resume data:
"""
${data.resumeData}
"""

Job description:
"""
${data.jobDescription}
"""

Context about the user:
- Headline: ${resume.headline || "not provided"}
- Skills: ${skillsList(resume) || "not provided"}
- Target/current roles: ${currentRoles(resume) || "not provided"}

Tone: ${data.tone}

Rules:
- Return a JSON object: {"coverLetter": "<the cover letter>"}
- Length: 250 to 400 words, split into 3-4 paragraphs.
- Address the hiring manager's needs described in the job description, drawing only on experience that exists in the resume.
- Do not invent employers, metrics, or achievements that are not in the resume.
- Do not include placeholders like [Your Name] or [Company]; write it ready to send.
- Do not wrap the JSON in markdown fences. Return raw JSON only.`;

  let raw: string;
  try {
    raw = await generateWithRetry(prompt);
  } catch {
    throw AppError.InternalServerError("Cover letter generation failed. Please try again.");
  }

  let parsed: { coverLetter?: unknown };
  try {
    parsed = JSON.parse(raw.trim());
  } catch {
    throw AppError.InternalServerError("AI returned a malformed cover letter. Please try again.");
  }

  const coverLetter =
    typeof parsed.coverLetter === "string" ? parsed.coverLetter.trim() : "";

  if (!coverLetter) {
    throw AppError.InternalServerError("AI returned an empty cover letter. Please try again.");
  }

  return { coverLetter };
};

// ---------------------------------------------------------------------------
// Interview prep — generate role-specific interview questions
// ---------------------------------------------------------------------------

interface InterviewQuestion {
  question: string;
  category: "behavioral" | "technical" | "role-specific";
  difficulty: "easy" | "medium" | "hard";
}

const isValidCategory = (c: unknown): c is InterviewQuestion["category"] =>
  c === "behavioral" || c === "technical" || c === "role-specific";

const isValidDifficulty = (
  d: unknown,
): d is InterviewQuestion["difficulty"] =>
  d === "easy" || d === "medium" || d === "hard";

export const interviewService = async (
  data: InterviewInput,
): Promise<{ questions: InterviewQuestion[] }> => {
  const count = Math.min(Math.max(Math.trunc(data.count) || 5, 1), 20);
  const difficulty = isValidDifficulty(data.difficulty)
    ? data.difficulty
    : undefined;

  const prompt = `You are an expert technical recruiter and interview coach.

Generate ${count} interview questions for someone applying as a "${data.role}".

Rules:
- Return a JSON array of objects, each with "question" (the question text), "category" (one of "behavioral", "technical", "role-specific"), and "difficulty" (one of "easy", "medium", "hard").
- Mix categories: mostly role-specific and behavioral, a few technical.
- Questions must be specific to the "${data.role}" role, not generic.
- Do not include answers, only questions.
- Do not wrap the JSON in markdown fences. Return raw JSON only.`;

  let raw: string;
  try {
    raw = await generateWithRetry(prompt);
  } catch {
    throw AppError.InternalServerError("Interview question generation failed. Please try again.");
  }

  let questions: InterviewQuestion[];
  try {
    const parsed: unknown = JSON.parse(raw.trim());
    if (!Array.isArray(parsed)) {
      throw AppError.InternalServerError("AI returned an unexpected (non-array) response");
    }
    questions = parsed
      .filter(
        (q): q is Record<string, unknown> =>
          typeof q === "object" && q !== null,
      )
      .map((q): InterviewQuestion => {
        const question =
          typeof q.question === "string" ? q.question.trim() : "";
        return {
          question,
          category: isValidCategory(q.category) ? q.category : "role-specific",
          difficulty: isValidDifficulty(q.difficulty)
            ? q.difficulty
            : (difficulty ?? "medium"),
        };
      })
      .filter((q) => q.question);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.InternalServerError("AI returned malformed interview questions. Please try again.");
  }

  if (!questions.length) {
    throw AppError.InternalServerError("AI returned no interview questions. Please try again.");
  }

  return { questions: questions.slice(0, count) };
};
