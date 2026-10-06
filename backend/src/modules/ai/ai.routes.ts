import { Hono } from "hono";
import { requireAuth } from "@/middlewares/requireAuth";
import { zValidator } from "@hono/zod-validator";
import {
  aiSuggestController,
  aiSummaryController,
  atsScoreController,
  coverLetterController,
  interviewController,
} from "./ai.controller";
import {
  aiSuggestSchema,
  aiSummarySchema,
  atsScoreSchema,
  coverLetterSchema,
  interviewSchema,
} from "./ai.schema";

const aiRoutes = new Hono();

aiRoutes.use("*", requireAuth);

// POST /api/v1/ai/suggest — AI copilot: turn rough notes into bullet points
aiRoutes.post(
  "/suggest",
  zValidator("json", aiSuggestSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  aiSuggestController,
);

// POST /api/v1/ai/summary — AI copilot: rewrite the professional summary
aiRoutes.post(
  "/summary",
  zValidator("json", aiSummarySchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  aiSummaryController,
);

// POST /api/v1/ai/ats-score — grade resume content against ATS best practices
aiRoutes.post(
  "/ats-score",
  zValidator("json", atsScoreSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  atsScoreController,
);

// POST /api/v1/ai/cover-letter — generate a tailored cover letter
aiRoutes.post(
  "/cover-letter",
  zValidator("json", coverLetterSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  coverLetterController,
);

// POST /api/v1/ai/interview — generate role-specific interview questions
aiRoutes.post(
  "/interview",
  zValidator("json", interviewSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  interviewController,
);

export default aiRoutes;
