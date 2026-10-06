import { z } from "zod";

export const categorySchema = z.enum([
  "behavioral",
  "technical",
  "role-specific",
]);

export const difficultySchema = z.enum(["easy", "medium", "hard"]);

const questionFields = {
  role: z
    .string({ error: "Role is required" })
    .trim()
    .min(2, "Role must be at least 2 characters")
    .max(255, "Role must be 255 characters or less"),
  question: z
    .string({ error: "Question is required" })
    .trim()
    .min(5, "Question must be at least 5 characters")
    .max(1000, "Question too long"),
  category: categorySchema.default("role-specific"),
  difficulty: difficultySchema.default("medium"),
};

// POST /api/v1/interview-questions — save a single (e.g. user-written) question
export const createInterviewQuestionSchema = z
  .object(questionFields)
  .strict();

// POST /api/v1/interview-questions/bulk — save a whole AI-generated set at once
export const createInterviewQuestionsBulkSchema = z
  .object({
    role: questionFields.role,
    questions: z
      .array(
        z
          .object({
            question: questionFields.question,
            category: categorySchema.default("role-specific"),
            difficulty: difficultySchema.default("medium"),
          })
          .strict(),
      )
      .min(1, "At least one question is required")
      .max(20, "A set cannot have more than 20 questions"),
  })
  .strict();

// PUT /api/v1/interview-questions/:questionId — edit a question
export const updateInterviewQuestionSchema = z
  .object({
    role: questionFields.role.optional(),
    question: questionFields.question.optional(),
    category: categorySchema.optional(),
    difficulty: difficultySchema.optional(),
    starred: z.boolean().optional(),
  })
  .strict();

export type CreateInterviewQuestionInput = z.infer<
  typeof createInterviewQuestionSchema
>;
export type CreateInterviewQuestionsBulkInput = z.infer<
  typeof createInterviewQuestionsBulkSchema
>;
export type UpdateInterviewQuestionInput = z.infer<
  typeof updateInterviewQuestionSchema
>;
