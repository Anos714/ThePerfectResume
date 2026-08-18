import { resumes } from "@/db/schema";
import * as resumeRepo from "./resumes.repository";
import {
  CreateResumeInput,
  UpdateResumeInput,
  UpdateResumeNameInput,
  UpdateResumeTemplateInput,
  UpdateResumeVisibilityInput,
} from "./resumes.schema";
import { AppError } from "@/utils/AppError";
import { env } from "@/config/env";

export const getAllResumeService = async (userId: string) => {
  const resumes = await resumeRepo.fetchAllResumesByUserId(userId);
  return resumes;
};

export const getResumeByIdService = async (
  userId: string,
  resumeId: string,
) => {
  const resume = await resumeRepo.findResumeById(userId, resumeId);
  if (!resume) {
    throw AppError.NotFound("Resume not found");
  }
  return resume;
};

export const createResumeService = async (
  userId: string,
  data: CreateResumeInput,
) => {
  const profile = await resumeRepo.findProfileByUserId(userId);

  const newResumeData: typeof resumes.$inferInsert = {
    userId,
    resumeTitle: data.resumeTitle,
    template: data.template,

    // Agar profile mili toh uska data copy karo, nahi toh defaults
    fullName: profile?.fullName || "",
    headline: profile?.headline || "",
    phoneNumber: profile?.phoneNumber || "",
    location: profile?.location || "",
    websiteUrl: profile?.websiteUrl || "",
    linkedinUrl: profile?.linkedinUrl || "",
    githubUrl: profile?.githubUrl || "",
    summary: profile?.summary || "",

    skills: profile?.skills || [],
    experience: profile?.experience || [],
    education: profile?.education || [],
    projects: profile?.projects || [],
    certifications: profile?.certifications || [],
    languages: profile?.languages || [],

    isPublished: false,
    isPublic: false,
  };

  const resume = await resumeRepo.createResume(newResumeData);
  if (!resume) {
    throw AppError.InternalServerError("Failed to create resume");
  }
  return resume;
};

export const updateResumeService = async (
  userId: string,
  resumeId: string,
  data:
    | UpdateResumeInput
    | UpdateResumeNameInput
    | UpdateResumeTemplateInput
    | UpdateResumeVisibilityInput,
) => {
  const updatedResume = await resumeRepo.updateResumeById(
    userId,
    resumeId,
    data,
  );

  if (!updatedResume) {
    throw AppError.NotFound("Resume not found to update");
  }

  return updatedResume;
};

export const deleteResumeService = async (userId: string, resumeId: string) => {
  const resume = await resumeRepo.deleteResumeById(userId, resumeId);

  if (!resume) {
    throw AppError.NotFound("Resume not found to delete");
  }

  return resume;
};

export const getResumePublicLinkService = async (
  userId: string,
  resumeId: string,
) => {
  const resume = await resumeRepo.findResumeById(userId, resumeId);
  if (!resume) {
    throw AppError.NotFound("Resume not found");
  }
  if (!resume.isPublic && !resume.isPublished) {
    throw AppError.Forbidden(
      "Resume is not public, Please make it public to get a link",
    );
  }

  const baseUrl = env.FRONTEND_URL;
  const shareUrl = `${baseUrl}/public/resumes/${resumeId}`;
  return {
    resumeId,
    resumeTitle: resume.resumeTitle,
    shareUrl,
  };
};
