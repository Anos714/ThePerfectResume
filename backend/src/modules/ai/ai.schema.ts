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
  resumeId: z.string().trim(),
  content: z.string().trim().max(50000, "Content too long"),
});

export const coverLetterSchema = z.object({
  resumeData: z.string().trim().max(20000),
  jobDescription: z.string().trim().max(10000),
  tone: z.enum(["professional", "friendly", "confident"]).default("professional"),
});

export const interviewSchema = z.object({
  role: z.string().trim().max(200),
  count: z.number().int().min(1).max(20).default(5),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

export type AiSuggestInput = z.infer<typeof aiSuggestSchema>;
export type AiSummaryInput = z.infer<typeof aiSummarySchema>;
export type AtsScoreInput = z.infer<typeof atsScoreSchema>;
export type CoverLetterInput = z.infer<typeof coverLetterSchema>;
export type InterviewInput = z.infer<typeof interviewSchema>;
