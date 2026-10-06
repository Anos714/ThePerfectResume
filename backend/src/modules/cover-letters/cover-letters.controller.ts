import { Context, Env } from "hono";
import * as letterService from "./cover-letters.service";
import {
  CreateCoverLetterInput,
  UpdateCoverLetterInput,
} from "./cover-letters.schema";
import { CoverLetterSuccessResponse } from "./cover-letters.types";
import { AppError } from "@/utils/AppError";

type CreateCoverLetterContext = Context<
  Env,
  string,
  { in: { json: CreateCoverLetterInput }; out: { json: CreateCoverLetterInput } }
>;

type UpdateCoverLetterContext = Context<
  Env,
  string,
  { in: { json: UpdateCoverLetterInput }; out: { json: UpdateCoverLetterInput } }
>;

// GET /api/v1/cover-letters — list the current user's cover letters
export const getCoverLettersController = async (c: Context) => {
  const user = c.get("user");
  const letters = await letterService.getAllCoverLettersService(user.id);
  return c.json<CoverLetterSuccessResponse>({
    success: true,
    data: letters,
  });
};

// GET /api/v1/cover-letters/:letterId — fetch a single cover letter
export const getCoverLetterByIdController = async (c: Context) => {
  const user = c.get("user");
  const letterId = c.req.param("letterId");
  if (!letterId) {
    throw AppError.BadRequest("letterId is required");
  }
  const letter = await letterService.getCoverLetterByIdService(user.id, letterId);
  return c.json<CoverLetterSuccessResponse>({
    success: true,
    data: letter,
  });
};

// POST /api/v1/cover-letters — save a (generated or manual) cover letter
export const createCoverLetterController = async (
  c: CreateCoverLetterContext,
) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  const letter = await letterService.createCoverLetterService(user.id, data);
  return c.json<CoverLetterSuccessResponse>({
    success: true,
    data: { id: letter.id },
  });
};

// PUT /api/v1/cover-letters/:letterId — update a cover letter
export const updateCoverLetterController = async (
  c: UpdateCoverLetterContext,
) => {
  const user = c.get("user");
  const letterId = c.req.param("letterId");
  if (!letterId) {
    throw AppError.BadRequest("letterId is required");
  }
  const data = c.req.valid("json");
  const updatedLetter = await letterService.updateCoverLetterService(
    user.id,
    letterId,
    data,
  );
  return c.json<CoverLetterSuccessResponse>({
    success: true,
    data: updatedLetter,
  });
};

// DELETE /api/v1/cover-letters/:letterId — delete a cover letter
export const deleteCoverLetterController = async (c: Context) => {
  const user = c.get("user");
  const letterId = c.req.param("letterId");
  if (!letterId) {
    throw AppError.BadRequest("letterId is required");
  }
  await letterService.deleteCoverLetterService(user.id, letterId);
  return c.json<CoverLetterSuccessResponse>({
    success: true,
    message: "Cover letter deleted successfully",
  });
};
