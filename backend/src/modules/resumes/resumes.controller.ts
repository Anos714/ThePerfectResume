import { Context, Env } from "hono";
import {
  CreateResumeInput,
  ResumeIdInput,
  UpdateResumeInput,
  UpdateResumeNameInput,
  UpdateResumeTemplateInput,
} from "./resumes.schema";
import * as resumeService from "./resumes.service";
import { ResumeSuccessResponse } from "./resumes.types";
import { AppError } from "@/utils/AppError";

type CreateResumeContext = Context<
  Env,
  string,
  {
    in: { json: CreateResumeInput };
    out: { json: CreateResumeInput };
  }
>;

type ResumeIdContext = Context<
  Env,
  string,
  {
    in: { json: ResumeIdInput };
    out: { json: ResumeIdInput };
  }
>;

type UpdateResumeContext = Context<
  Env,
  string,
  {
    in: { json: UpdateResumeInput };
    out: { json: UpdateResumeInput };
  }
>;

type UpdateResumeNameContext = Context<
  Env,
  string,
  {
    in: { json: UpdateResumeNameInput };
    out: { json: UpdateResumeNameInput };
  }
>;

type UpdateResumeTemplateContext = Context<
  Env,
  string,
  {
    in: { json: UpdateResumeTemplateInput };
    out: { json: UpdateResumeTemplateInput };
  }
>;

export const getResumesController = async (c: Context) => {
  const user = c.get("user");
  const resumes = await resumeService.getAllResumeService(user.id);
  console.log("resumes: ", resumes);
  return c.json<ResumeSuccessResponse>({
    success: true,
    data: resumes,
  });
};

export const getResumeByIdController = async (c: ResumeIdContext) => {
  const user = c.get("user");
  if (!user.id) {
    throw AppError.Unauthorized("Unauthorized");
  }

  const resumeId = c.req.param("resumeId");

  if (!resumeId) {
    throw AppError.BadRequest("resumeId is required");
  }

  const resume = await resumeService.getResumeByIdService(user.id, resumeId);
  if (!resume) {
    throw AppError.NotFound("Resume not found");
  }
  return c.json<ResumeSuccessResponse>({
    success: true,
    data: resume,
  });
};

export const createResumeController = async (c: CreateResumeContext) => {
  const user = c.get("user");
  if (!user.id) {
    throw AppError.Unauthorized("Unauthorized");
  }
  const data = c.req.valid("json");
  const resume = await resumeService.createResumeService(user.id, data);
  return c.json<ResumeSuccessResponse>({
    success: true,
    data: { id: resume.id },
  });
};

export const updateResumeByIdController = async (c: UpdateResumeContext) => {
  const user = c.get("user");
  if (!user) {
    throw AppError.Unauthorized("Unauthorized");
  }
  const resumeId = c.req.param("resumeId");
  if (!resumeId) {
    throw AppError.BadRequest("resumeId is required");
  }
  const data = c.req.valid("json");

  const updatedResume = await resumeService.updateResumeService(
    user.id,
    resumeId,
    data,
  );
  return c.json<ResumeSuccessResponse>({
    success: true,
    data: updatedResume,
  });
};

export const deleteResumeByIdController = async (c: ResumeIdContext) => {
  const user = c.get("user");
  if (!user.id) {
    throw AppError.Unauthorized("Unauthorized");
  }
  const resumeId = c.req.param("resumeId");
  if (!resumeId) {
    throw AppError.BadRequest("resumeId is required");
  }
  const resume = await resumeService.deleteResumeService(user.id, resumeId);
  if (!resume) {
    throw AppError.NotFound("Resume not found");
  }
  return c.json<ResumeSuccessResponse>({
    success: true,
    message: "Resume deleted successfully",
  });
};

export const updateResumeNameController = async (
  c: UpdateResumeNameContext,
) => {
  const user = c.get("user");
  if (!user) {
    throw AppError.Unauthorized("Unauthorized");
  }
  const resumeId = c.req.param("resumeId");
  if (!resumeId) {
    throw AppError.BadRequest("resumeId is required");
  }
  const data = c.req.valid("json");
  const updatedResume = await resumeService.updateResumeNameService(
    user.id,
    resumeId,
    data,
  );
  return c.json<ResumeSuccessResponse>({
    success: true,
    data: updatedResume,
  });
};

export const updateResumeTemplateController = async (
  c: UpdateResumeTemplateContext,
) => {
  const user = c.get("user");
  if (!user) {
    throw AppError.Unauthorized("Unauthorized");
  }
  const resumeId = c.req.param("resumeId");
  if (!resumeId) {
    throw AppError.BadRequest("resumeId is required");
  }
  const data = c.req.valid("json");
  const updatedResume = await resumeService.updateResumeTemplateService(
    user.id,
    resumeId,
    data,
  );
  return c.json<ResumeSuccessResponse>({
    success: true,
    data: updatedResume,
  });
};

export const updateResumeVisibilityController = async (
  c: ResumeIdContext,
) => {};

export const getResumePublicLinkController = async (c: ResumeIdContext) => {};
