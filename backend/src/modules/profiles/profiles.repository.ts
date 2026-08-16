import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProfileInput } from "./profiles.schema";

export const findProfileByUserId = async (userId: string) => {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId));
  return profile || null;
};

export const upsertProfile = async (userId: string, data: ProfileInput) => {
  const [profile] = await db
    .insert(profiles)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: { ...data, updatedAt: new Date() },
    })
    .returning();
  return profile || null;
};

export const deleteProfileByUserId = async (userId: string) => {
  return await db.delete(profiles).where(eq(profiles.userId, userId));
};
