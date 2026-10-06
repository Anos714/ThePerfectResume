import { Context, Env } from "hono";
import * as questionService from "./interview-questions.service";
import {
  CreateInterviewQuestionInput,
  CreateInterviewQuestionsBulkInput,
  UpdateInterviewQuestionInput,
} from "./interview-questions.schema";
import { InterviewQuestionSuccessResponse } from "./interview-questions.types";
import { AppError } from "@/utils/AppError";

type CreateQuestionContext = Context<
  Env,
  string,
  {
    in: { json: CreateInterviewQuestionInput };
    out: { json: CreateInterviewQuestionInput };
  }
>;

type CreateQuestionsBulkContext = Context<
  Env,
  string,
  {
    in: { json: CreateInterviewQuestionsBulkInput };
    out: { json: CreateInterviewQuestionsBulkInput };
  }
>;

type UpdateQuestionContext = Context<
  Env,
  string,
  {
    in: { json: UpdateInterviewQuestionInput };
    out: { json: UpdateInterviewQuestionInput };
  }
>;

// GET /api/v1/interview-questions — list the current user's saved questions
export const getInterviewQuestionsController = async (c: Context) => {
  const user = c.get("user");
  const questions = await questionService.getAllInterviewQuestionsService(
    user.id,
  );
  return c.json<InterviewQuestionSuccessResponse>({
    success: true,
    data: questions,
  });
};

// GET /api/v1/interview-questions/:questionId — fetch a single question
export const getInterviewQuestionByIdController = async (c: Context) => {
  const user = c.get("user");
  const questionId = c.req.param("questionId");
  if (!questionId) {
    throw AppError.BadRequest("questionId is required");
  }
  const question = await questionService.getInterviewQuestionByIdService(
    user.id,
    questionId,
  );
  return c.json<InterviewQuestionSuccessResponse>({
    success: true,
    data: question,
  });
};

// POST /api/v1/interview-questions — save a single (user-written) question
export const createInterviewQuestionController = async (
  c: CreateQuestionContext,
) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  const question = await questionService.createInterviewQuestionService(
    user.id,
    data,
  );
  return c.json<InterviewQuestionSuccessResponse>({
    success: true,
    data: { id: question.id },
  });
};

// POST /api/v1/interview-questions/bulk — save a whole AI-generated set
export const createInterviewQuestionsBulkController = async (
  c: CreateQuestionsBulkContext,
) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  const created = await questionService.createInterviewQuestionsBulkService(
    user.id,
    data,
  );
  return c.json<InterviewQuestionSuccessResponse>({
    success: true,
    data: created,
  });
};

// PUT /api/v1/interview-questions/:questionId — edit or star/unstar a question
export const updateInterviewQuestionController = async (
  c: UpdateQuestionContext,
) => {
  const user = c.get("user");
  const questionId = c.req.param("questionId");
  if (!questionId) {
    throw AppError.BadRequest("questionId is required");
  }
  const data = c.req.valid("json");
  const updatedQuestion = await questionService.updateInterviewQuestionService(
    user.id,
    questionId,
    data,
  );
  return c.json<InterviewQuestionSuccessResponse>({
    success: true,
    data: updatedQuestion,
  });
};

// DELETE /api/v1/interview-questions/:questionId — delete a question
export const deleteInterviewQuestionController = async (c: Context) => {
  const user = c.get("user");
  const questionId = c.req.param("questionId");
  if (!questionId) {
    throw AppError.BadRequest("questionId is required");
  }
  await questionService.deleteInterviewQuestionService(user.id, questionId);
  return c.json<InterviewQuestionSuccessResponse>({
    success: true,
    message: "Interview question deleted successfully",
  });
};
