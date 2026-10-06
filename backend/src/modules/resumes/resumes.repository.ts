import { db } from "@/db";
import { profiles, resumes } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import {
  UpdateResumeAtsScoreInput,
  UpdateResumeInput,
  UpdateResumeNameInput,
  UpdateResumeTemplateInput,
  UpdateResumeVisibilityInput,
} from "./resumes.schema";

export const findProfileByUserId = async (userId: string) => {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId));
  return profile;
};

export const createResume = async (data: typeof resumes.$inferInsert) => {
  const [resume] = await db
    .insert(resumes)
    .values(data)
    .returning({ id: resumes.id });
  return resume;
};

export const fetchAllResumesByUserId = async (userId: string) => {
  const data = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId));
  return data;
};

export const findResumeById = async (userId: string, resumeId: string) => {
  const [resume] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.userId, userId), eq(resumes.id, resumeId)));
  return resume;
};

// fetch a resume by id alone, but only if it is publicly shareable
export const findPublicResumeById = async (resumeId: string) => {
  const [resume] = await db
    .select()
    .from(resumes)
    .where(
      and(
        eq(resumes.id, resumeId),
        eq(resumes.isPublic, true),
        eq(resumes.isPublished, true),
      ),
    );
  return resume;
};

export const deleteResumeById = async (userId: string, resumeId: string) => {
  const [resume] = await db
    .delete(resumes)
    .where(and(eq(resumes.userId, userId), eq(resumes.id, resumeId)))
    .returning({ id: resumes.id });
  return resume;
};

export const updateResumeById = async (
  userId: string,
  resumeId: string,
  data:
    | UpdateResumeInput
    | UpdateResumeNameInput
    | UpdateResumeTemplateInput
    | UpdateResumeVisibilityInput,
) => {
  const [resume] = await db
    .update(resumes)
    .set(data)
    .where(and(eq(resumes.userId, userId), eq(resumes.id, resumeId)))
    .returning();
  return resume;
};

// record the ATS score produced by the AI check
export const updateResumeAtsScore = async (
  userId: string,
  resumeId: string,
  data: UpdateResumeAtsScoreInput,
) => {
  const [resume] = await db
    .update(resumes)
    .set({ atsScore: data.atsScore })
    .where(and(eq(resumes.userId, userId), eq(resumes.id, resumeId)))
    .returning();
  return resume;
};

// bump the view counter on a public share — keyed by resume id alone since
// the public route has no authenticated user
export const incrementResumeViews = async (resumeId: string) => {
  await db
    .update(resumes)
    .set({ views: sql`${resumes.views} + 1` })
    .where(eq(resumes.id, resumeId));
};
