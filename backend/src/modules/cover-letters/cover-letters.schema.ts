import { z } from "zod";

export const toneSchema = z.enum(["professional", "friendly", "confident"]);

export const createCoverLetterSchema = z
  .object({
    title: z
      .string({ error: "Title is required" })
      .trim()
      .min(1, "Title is required")
      .max(255, "Title must be 255 characters or less"),
    companyName: z
      .string()
      .trim()
      .max(255, "Company name must be 255 characters or less")
      .optional()
      .or(z.literal("")),
    role: z
      .string()
      .trim()
      .max(255, "Role must be 255 characters or less")
      .optional()
      .or(z.literal("")),
    tone: toneSchema.default("professional"),
    content: z
      .string()
      .trim()
      .max(20000, "Cover letter too long")
      .optional()
      .or(z.literal("")),
    jobDescription: z
      .string()
      .trim()
      .max(10000, "Job description too long")
      .optional()
      .or(z.literal("")),
  })
  .strict();

export const updateCoverLetterSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title cannot be empty")
      .max(255, "Title must be 255 characters or less")
      .optional(),
    companyName: z
      .string()
      .trim()
      .max(255, "Company name must be 255 characters or less")
      .optional()
      .or(z.literal("")),
    role: z
      .string()
      .trim()
      .max(255, "Role must be 255 characters or less")
      .optional()
      .or(z.literal("")),
    tone: toneSchema.optional(),
    status: z.enum(["draft", "final"]).optional(),
    content: z
      .string()
      .trim()
      .max(20000, "Cover letter too long")
      .optional()
      .or(z.literal("")),
    jobDescription: z
      .string()
      .trim()
      .max(10000, "Job description too long")
      .optional()
      .or(z.literal("")),
  })
  .strict();

export type CreateCoverLetterInput = z.infer<typeof createCoverLetterSchema>;
export type UpdateCoverLetterInput = z.infer<typeof updateCoverLetterSchema>;
