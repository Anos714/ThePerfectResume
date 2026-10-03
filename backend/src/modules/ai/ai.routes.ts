import { Hono } from "hono";
import { requireAuth } from "@/middlewares/requireAuth";
import { zValidator } from "@hono/zod-validator";
import { aiSuggestController, aiSummaryController } from "./ai.controller";
import { aiSuggestSchema, aiSummarySchema } from "./ai.schema";

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

export default aiRoutes;
