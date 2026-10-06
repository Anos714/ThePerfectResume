import { z } from "zod";

export const aiSuggestSchema = z
  .object({
    resumeId: z.string({ error: "resumeId is required" }).trim().min(1),
    context: z
      .string({ error: "Context is required" })
      .trim()
      .min(10, "Please provide a little more detail (at least 10 characters)")
      .max(2000, "Context too long"),
  })
  .strict();

export const aiSummarySchema = z
  .object({
    resumeId: z.string({ error: "resumeId is required" }).trim().min(1),
    summary: z
      .string({ error: "Summary is required" })
      .trim()
      .min(10, "Please provide a little more detail (at least 10 characters)")
      .max(2000, "Summary too long"),
    tone: z
      .enum(["professional", "friendly", "confident"])
      .default("professional"),
  })
  .strict();

export const atsScoreSchema = z.object({
  resumeId: z.string({ error: "resumeId is required" }).trim().min(1),
  content: z
    .string({ error: "Content is required" })
    .trim()
    .min(50, "Please provide more resume content (at least 50 characters)")
    .max(50000, "Content too long"),
});

export const coverLetterSchema = z.object({
  resumeId: z.string({ error: "resumeId is required" }).trim().min(1),
  resumeData: z
    .string({ error: "Resume data is required" })
    .trim()
    .min(50, "Please provide more resume detail (at least 50 characters)")
    .max(20000, "Resume data too long"),
  jobDescription: z
    .string({ error: "Job description is required" })
    .trim()
    .min(10, "Please provide a little more detail (at least 10 characters)")
    .max(10000, "Job description too long"),
  tone: z.enum(["professional", "friendly", "confident"]).default("professional"),
});

export const interviewSchema = z.object({
  role: z
    .string({ error: "Role is required" })
    .trim()
    .min(2, "Role must be at least 2 characters")
    .max(200, "Role too long"),
  count: z.number().int().min(1).max(20).default(5),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

export type AiSuggestInput = z.infer<typeof aiSuggestSchema>;
export type AiSummaryInput = z.infer<typeof aiSummarySchema>;
export type AtsScoreInput = z.infer<typeof atsScoreSchema>;
export type CoverLetterInput = z.infer<typeof coverLetterSchema>;
export type InterviewInput = z.infer<typeof interviewSchema>;
