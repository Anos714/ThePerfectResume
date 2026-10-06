import { db } from "@/db";
import { interviewQuestions } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import type {
  CreateInterviewQuestionInput,
  CreateInterviewQuestionsBulkInput,
  UpdateInterviewQuestionInput,
} from "./interview-questions.schema";

export const createInterviewQuestion = async (
  data: typeof interviewQuestions.$inferInsert,
) => {
  const [question] = await db
    .insert(interviewQuestions)
    .values(data)
    .returning({ id: interviewQuestions.id });
  return question;
};

export const createInterviewQuestionsBulk = async (
  data: (typeof interviewQuestions.$inferInsert)[],
) => {
  const created = await db
    .insert(interviewQuestions)
    .values(data)
    .returning({ id: interviewQuestions.id });
  return created;
};

// newest first — matches how the dashboard lists the prep set
export const fetchAllInterviewQuestionsByUserId = async (userId: string) => {
  const data = await db
    .select()
    .from(interviewQuestions)
    .where(eq(interviewQuestions.userId, userId))
    .orderBy(desc(interviewQuestions.updatedAt));
  return data;
};

export const findInterviewQuestionById = async (
  userId: string,
  questionId: string,
) => {
  const [question] = await db
    .select()
    .from(interviewQuestions)
    .where(
      and(
        eq(interviewQuestions.userId, userId),
        eq(interviewQuestions.id, questionId),
      ),
    );
  return question;
};

export const deleteInterviewQuestionById = async (
  userId: string,
  questionId: string,
) => {
  const [question] = await db
    .delete(interviewQuestions)
    .where(
      and(
        eq(interviewQuestions.userId, userId),
        eq(interviewQuestions.id, questionId),
      ),
    )
    .returning({ id: interviewQuestions.id });
  return question;
};

export const updateInterviewQuestionById = async (
  userId: string,
  questionId: string,
  data: UpdateInterviewQuestionInput,
) => {
  const [question] = await db
    .update(interviewQuestions)
    .set(data)
    .where(
      and(
        eq(interviewQuestions.userId, userId),
        eq(interviewQuestions.id, questionId),
      ),
    )
    .returning();
  return question;
};

export const buildInterviewQuestionInsert = (
  userId: string,
  data: CreateInterviewQuestionInput,
): typeof interviewQuestions.$inferInsert => ({
  userId,
  role: data.role,
  question: data.question,
  category: data.category,
  difficulty: data.difficulty,
});

export const buildInterviewQuestionsBulkInsert = (
  userId: string,
  data: CreateInterviewQuestionsBulkInput,
): (typeof interviewQuestions.$inferInsert)[] =>
  data.questions.map((q) => ({
    userId,
    role: data.role,
    question: q.question,
    category: q.category,
    difficulty: q.difficulty,
  }));
