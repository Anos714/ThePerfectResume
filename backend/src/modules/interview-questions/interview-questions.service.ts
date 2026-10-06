import * as questionRepo from "./interview-questions.repository";
import {
  CreateInterviewQuestionInput,
  CreateInterviewQuestionsBulkInput,
  UpdateInterviewQuestionInput,
} from "./interview-questions.schema";
import { AppError } from "@/utils/AppError";

export const getAllInterviewQuestionsService = async (userId: string) => {
  return await questionRepo.fetchAllInterviewQuestionsByUserId(userId);
};

export const getInterviewQuestionByIdService = async (
  userId: string,
  questionId: string,
) => {
  const question = await questionRepo.findInterviewQuestionById(
    userId,
    questionId,
  );
  if (!question) {
    throw AppError.NotFound("Interview question not found");
  }
  return question;
};

export const createInterviewQuestionService = async (
  userId: string,
  data: CreateInterviewQuestionInput,
) => {
  const newQuestion = questionRepo.buildInterviewQuestionInsert(userId, data);
  const question = await questionRepo.createInterviewQuestion(newQuestion);
  if (!question) {
    throw AppError.InternalServerError("Failed to create interview question");
  }
  return question;
};

export const createInterviewQuestionsBulkService = async (
  userId: string,
  data: CreateInterviewQuestionsBulkInput,
) => {
  const rows = questionRepo.buildInterviewQuestionsBulkInsert(userId, data);
  const created = await questionRepo.createInterviewQuestionsBulk(rows);
  if (!created.length) {
    throw AppError.InternalServerError(
      "Failed to create interview questions",
    );
  }
  return created;
};

export const updateInterviewQuestionService = async (
  userId: string,
  questionId: string,
  data: UpdateInterviewQuestionInput,
) => {
  const updatedQuestion = await questionRepo.updateInterviewQuestionById(
    userId,
    questionId,
    data,
  );
  if (!updatedQuestion) {
    throw AppError.NotFound("Interview question not found to update");
  }
  return updatedQuestion;
};

export const deleteInterviewQuestionService = async (
  userId: string,
  questionId: string,
) => {
  const question = await questionRepo.deleteInterviewQuestionById(
    userId,
    questionId,
  );
  if (!question) {
    throw AppError.NotFound("Interview question not found to delete");
  }
  return question;
};
