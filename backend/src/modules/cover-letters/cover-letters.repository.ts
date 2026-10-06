import { db } from "@/db";
import { coverLetters } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { CreateCoverLetterInput, UpdateCoverLetterInput } from "./cover-letters.schema";

export const createCoverLetter = async (
  data: typeof coverLetters.$inferInsert,
) => {
  const [letter] = await db
    .insert(coverLetters)
    .values(data)
    .returning({ id: coverLetters.id });
  return letter;
};

// newest first — matches how the dashboard lists letters
export const fetchAllCoverLettersByUserId = async (userId: string) => {
  const data = await db
    .select()
    .from(coverLetters)
    .where(eq(coverLetters.userId, userId))
    .orderBy(desc(coverLetters.updatedAt));
  return data;
};

export const findCoverLetterById = async (
  userId: string,
  letterId: string,
) => {
  const [letter] = await db
    .select()
    .from(coverLetters)
    .where(and(eq(coverLetters.userId, userId), eq(coverLetters.id, letterId)));
  return letter;
};

export const deleteCoverLetterById = async (
  userId: string,
  letterId: string,
) => {
  const [letter] = await db
    .delete(coverLetters)
    .where(and(eq(coverLetters.userId, userId), eq(coverLetters.id, letterId)))
    .returning({ id: coverLetters.id });
  return letter;
};

export const updateCoverLetterById = async (
  userId: string,
  letterId: string,
  data: UpdateCoverLetterInput,
) => {
  const [letter] = await db
    .update(coverLetters)
    .set(data)
    .where(and(eq(coverLetters.userId, userId), eq(coverLetters.id, letterId)))
    .returning();
  return letter;
};

export const buildCoverLetterInsert = (
  userId: string,
  data: CreateCoverLetterInput,
): typeof coverLetters.$inferInsert => ({
  userId,
  title: data.title,
  companyName: data.companyName || null,
  role: data.role || null,
  tone: data.tone,
  content: data.content || null,
  jobDescription: data.jobDescription || null,
});
