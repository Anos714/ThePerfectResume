import { resumes } from "@/db/schema";
import * as resumeRepo from "./resumes.repository";import {
  CreateResumeInput,
  UpdateResumeAtsScoreInput,
  UpdateResumeInput,
  UpdateResumeNameInput,
  UpdateResumeTemplateInput,
  UpdateResumeVisibilityInput,
} from "./resumes.schema";
import { AppError } from "@/utils/AppError";
import { env } from "@/config/env";

type ResumeRow = typeof resumes.$inferSelect;

// Derive a 0-100 profile-completion score from how many key sections the user
// has filled in. Weighted so that identity + experience matter most.
export const computeCompletion = (resume: ResumeRow): number => {
  const checks: { weight: number; filled: boolean }[] = [
    { weight: 15, filled: Boolean(resume.fullName?.trim()) },
    { weight: 10, filled: Boolean(resume.headline?.trim()) },
    { weight: 10, filled: Boolean(resume.summary?.trim()) },
    {
      weight: 15,
      filled: Array.isArray(resume.skills) && resume.skills.length > 0,
    },
    {
      weight: 15,
      filled:
        Array.isArray(resume.experience) && resume.experience.length > 0,
    },
    {
      weight: 10,
      filled: Array.isArray(resume.education) && resume.education.length > 0,
    },
    {
      weight: 10,
      filled: Array.isArray(resume.projects) && resume.projects.length > 0,
    },
    {
      weight: 5,
      filled:
        Array.isArray(resume.certifications) &&
        resume.certifications.length > 0,
    },
    {
      weight: 5,
      filled: Boolean(resume.phoneNumber?.trim() || resume.location?.trim()),
    },
    {
      weight: 5,
      filled: Boolean(
        resume.websiteUrl?.trim() ||
          resume.linkedinUrl?.trim() ||
          resume.githubUrl?.trim(),
      ),
    },
  ];

  const earned = checks.reduce((sum, c) => sum + (c.filled ? c.weight : 0), 0);
  return Math.min(100, earned);
};

export const getAllResumeService = async (userId: string) => {
  const resumes = await resumeRepo.fetchAllResumesByUserId(userId);
  return resumes.map((resume) => ({
    ...resume,
    completion: computeCompletion(resume),
  }));
};

export const getResumeByIdService = async (
  userId: string,
  resumeId: string,
) => {
  const resume = await resumeRepo.findResumeById(userId, resumeId);
  if (!resume) {
    throw AppError.NotFound("Resume not found");
  }
  return { ...resume, completion: computeCompletion(resume) };
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

  return { ...updatedResume, completion: computeCompletion(updatedResume) };
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

// fetch a resume for the public share page — no auth required, but the
// resume must be both published and public. Bumps the view counter.
export const getPublicResumeService = async (resumeId: string) => {
  const resume = await resumeRepo.findPublicResumeById(resumeId);
  if (!resume) {
    throw AppError.NotFound("Resume not found or not publicly shared");
  }

  // fire-and-forget: a failed counter must never break the share page. The
  // rejection is handled here because an unhandled rejection terminates the
  // whole Bun process, which would take the API down for every other user.
  resumeRepo
    .incrementResumeViews(resumeId)
    .catch((error) =>
      console.error(`Failed to increment views for resume ${resumeId}:`, error),
    );

  const { userId, isPublic, isPublished, ...publicData } = resume;
  return { ...publicData, completion: computeCompletion(resume) };
};

// store the ATS score produced by the AI check
export const updateResumeAtsScoreService = async (
  userId: string,
  resumeId: string,
  data: UpdateResumeAtsScoreInput,
) => {
  const updatedResume = await resumeRepo.updateResumeAtsScore(
    userId,
    resumeId,
    data,
  );
  if (!updatedResume) {
    throw AppError.NotFound("Resume not found to update");
  }
  return { ...updatedResume, completion: computeCompletion(updatedResume) };
};
