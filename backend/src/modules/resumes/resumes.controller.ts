import { Context, Env } from "hono";
import {
  CreateResumeInput,
  UpdateResumeInput,
  UpdateResumeNameInput,
  UpdateResumeTemplateInput,
  UpdateResumeVisibilityInput,
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

type UpdateResumeVisibilityContext = Context<
  Env,
  string,
  {
    in: { json: UpdateResumeVisibilityInput };
    out: { json: UpdateResumeVisibilityInput };
  }
>;

export const getResumesController = async (c: Context) => {
  const user = c.get("user");
  const resumes = await resumeService.getAllResumeService(user.id);
  return c.json<ResumeSuccessResponse>({
    success: true,
    data: resumes,
  });
};

export const getResumeByIdController = async (c: Context) => {
  const user = c.get("user");
  const resumeId = c.req.param("resumeId");

  if (!resumeId) {
    throw AppError.BadRequest("resumeId is required");
  }

  const resume = await resumeService.getResumeByIdService(user.id, resumeId);
  return c.json<ResumeSuccessResponse>({
    success: true,
    data: resume,
  });
};

export const createResumeController = async (c: CreateResumeContext) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  const resume = await resumeService.createResumeService(user.id, data);

  return c.json<ResumeSuccessResponse>({
    success: true,
    data: { id: resume.id },
  });
};

export const updateResumeByIdController = async (c: UpdateResumeContext) => {
  const user = c.get("user");
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

export const deleteResumeByIdController = async (c: Context) => {
  const user = c.get("user");
  const resumeId = c.req.param("resumeId");
  if (!resumeId) {
    throw AppError.BadRequest("resumeId is required");
  }
  await resumeService.deleteResumeService(user.id, resumeId);
  return c.json<ResumeSuccessResponse>({
    success: true,
    message: "Resume deleted successfully",
  });
};

export const updateResumeNameController = async (
  c: UpdateResumeNameContext,
) => {
  const user = c.get("user");
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

export const updateResumeTemplateController = async (
  c: UpdateResumeTemplateContext,
) => {
  const user = c.get("user");
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

export const updateResumeVisibilityController = async (
  c: UpdateResumeVisibilityContext,
) => {
  const user = c.get("user");
  const resumeId = c.req.param("resumeId")!;
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

export const getResumePublicLinkController = async (c: Context) => {
  const user = c.get("user");
  const resumeId = c.req.param("resumeId")!;
  const resume = await resumeService.getResumePublicLinkService(
    user.id,
    resumeId,
  );
  return c.json({
    success: true,
    data: resume,
  });
};
