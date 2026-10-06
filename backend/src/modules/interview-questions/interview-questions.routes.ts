import { requireAuth } from "@/middlewares/requireAuth";
import { Hono } from "hono";
import * as questionController from "./interview-questions.controller";
import { zValidator } from "@hono/zod-validator";
import {
  createInterviewQuestionSchema,
  createInterviewQuestionsBulkSchema,
  updateInterviewQuestionSchema,
} from "./interview-questions.schema";

const interviewQuestionsRoutes = new Hono();

interviewQuestionsRoutes.use("*", requireAuth);

interviewQuestionsRoutes.get(
  "/",
  questionController.getInterviewQuestionsController,
);

// /bulk must be registered before /:questionId so it isn't swallowed by the
// dynamic param
interviewQuestionsRoutes.post(
  "/bulk",
  zValidator("json", createInterviewQuestionsBulkSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  questionController.createInterviewQuestionsBulkController,
);

interviewQuestionsRoutes.get(
  "/:questionId",
  questionController.getInterviewQuestionByIdController,
);
interviewQuestionsRoutes.post(
  "/",
  zValidator("json", createInterviewQuestionSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  questionController.createInterviewQuestionController,
);
interviewQuestionsRoutes.put(
  "/:questionId",
  zValidator("json", updateInterviewQuestionSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  questionController.updateInterviewQuestionController,
);
interviewQuestionsRoutes.delete(
  "/:questionId",
  questionController.deleteInterviewQuestionController,
);

export default interviewQuestionsRoutes;
