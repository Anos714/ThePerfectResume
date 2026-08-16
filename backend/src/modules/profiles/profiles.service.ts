import { AppError } from "@/utils/AppError";
import * as profileRepo from "./profiles.repository";

export const getProfileService = async (userId: string) => {
  const profile = await profileRepo.findProfileByUserId(userId);
  if (!profile)
    throw AppError.NotFound("Profile not found. Please create one.");
  return profile;
};

export const saveProfileService = async (userId: string, data: any) => {
  return await profileRepo.upsertProfile(userId, data);
};

export const deleteProfileService = async (userId: string) => {
  const profile = await profileRepo.findProfileByUserId(userId);
  if (!profile) throw AppError.NotFound("No profile found to delete");

  await profileRepo.deleteProfileByUserId(userId);

  return { success: true };
};
