import { resumes } from "@/db/schema";
import * as resumeRepo from "./resumes.repository";
import {
  CreateResumeInput,
  UpdateResumeInput,
  UpdateResumeNameInput,
  UpdateResumeTemplateInput,
} from "./resumes.schema";

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
    return null;
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
  return resume;
};
export const updateResumeService = async (
  userId: string,
  resumeId: string,
  data: UpdateResumeInput,
) => {
  const updatedResume = await resumeRepo.updateResumeById(
    userId,
    resumeId,
    data,
  );

  if (!updatedResume) {
    return null;
  }

  return updatedResume;
};

export const deleteResumeService = async (userId: string, resumeId: string) => {
  const resume = await resumeRepo.deleteResumeById(userId, resumeId);
  if (!resume) {
    return null;
  }
  return resume;
};

export const updateResumeNameService = async (
  userId: string,
  resumeId: string,
  data: UpdateResumeNameInput,
) => {
  const updatedResume = await resumeRepo.updateResumeById(
    userId,
    resumeId,
    data,
  );

  if (!updatedResume) {
    return null;
  }

  return updatedResume;
};

export const updateResumeTemplateService = async (
  userId: string,
  resumeId: string,
  data: UpdateResumeTemplateInput,
) => {
  const updatedResume = await resumeRepo.updateResumeById(
    userId,
    resumeId,
    data,
  );

  if (!updatedResume) {
    return null;
  }

  return updatedResume;
};
