import * as letterRepo from "./cover-letters.repository";
import {
  CreateCoverLetterInput,
  UpdateCoverLetterInput,
} from "./cover-letters.schema";
import { AppError } from "@/utils/AppError";

export const getAllCoverLettersService = async (userId: string) => {
  return await letterRepo.fetchAllCoverLettersByUserId(userId);
};

export const getCoverLetterByIdService = async (
  userId: string,
  letterId: string,
) => {
  const letter = await letterRepo.findCoverLetterById(userId, letterId);
  if (!letter) {
    throw AppError.NotFound("Cover letter not found");
  }
  return letter;
};

export const createCoverLetterService = async (
  userId: string,
  data: CreateCoverLetterInput,
) => {
  const newLetter = letterRepo.buildCoverLetterInsert(userId, data);
  const letter = await letterRepo.createCoverLetter(newLetter);
  if (!letter) {
    throw AppError.InternalServerError("Failed to create cover letter");
  }
  return letter;
};

export const updateCoverLetterService = async (
  userId: string,
  letterId: string,
  data: UpdateCoverLetterInput,
) => {
  const updatedLetter = await letterRepo.updateCoverLetterById(
    userId,
    letterId,
    data,
  );
  if (!updatedLetter) {
    throw AppError.NotFound("Cover letter not found to update");
  }
  return updatedLetter;
};

export const deleteCoverLetterService = async (
  userId: string,
  letterId: string,
) => {
  const letter = await letterRepo.deleteCoverLetterById(userId, letterId);
  if (!letter) {
    throw AppError.NotFound("Cover letter not found to delete");
  }
  return letter;
};
