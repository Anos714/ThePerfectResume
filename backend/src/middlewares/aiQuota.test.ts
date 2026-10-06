import { describe, expect, test } from "bun:test";
import {
  PLAN_AI_LIMITS,
  aiLimitFor,
  planFor,
} from "@/config/planLimits";
import { createCoverLetterSchema } from "@/modules/cover-letters/cover-letters.schema";
import { createInterviewQuestionsBulkSchema } from "@/modules/interview-questions/interview-questions.schema";

describe("PLAN_AI_LIMITS", () => {
  test("every plan has a finite daily limit", () => {
    expect(PLAN_AI_LIMITS.free).toBe(10);
    expect(PLAN_AI_LIMITS.pro).toBe(50);
    expect(PLAN_AI_LIMITS.career).toBe(200);
  });

  test("paid plans allow strictly more than free", () => {
    expect(PLAN_AI_LIMITS.pro).toBeGreaterThan(PLAN_AI_LIMITS.free);
    expect(PLAN_AI_LIMITS.career).toBeGreaterThan(PLAN_AI_LIMITS.pro);
  });

  test("unknown plans fall back to the free quota", () => {
    expect(planFor("pro")).toBe("pro");
    expect(planFor("nonexistent")).toBe("free");
    expect(aiLimitFor("nonexistent")).toBe(PLAN_AI_LIMITS.free);
  });
});

describe("createCoverLetterSchema", () => {
  test("tone defaults to professional", () => {
    const parsed = createCoverLetterSchema.parse({
      title: "Lumina — Designer",
    });
    expect(parsed.tone).toBe("professional");
  });

  test("optional fields accept empty strings", () => {
    const parsed = createCoverLetterSchema.parse({
      title: "Lumina — Designer",
      companyName: "",
      role: "",
      content: "",
    });
    expect(parsed.companyName).toBe("");
    expect(parsed.role).toBe("");
  });

  test("rejects a missing title", () => {
    expect(createCoverLetterSchema.safeParse({}).success).toBeFalse();
  });

  test("rejects an unknown tone", () => {
    expect(
      createCoverLetterSchema.safeParse({
        title: "Lumina",
        tone: "sarcastic",
      }).success,
    ).toBeFalse();
  });
});

describe("createInterviewQuestionsBulkSchema", () => {
  test("accepts a valid generated set", () => {
    const parsed = createInterviewQuestionsBulkSchema.parse({
      role: "Senior Backend Engineer",
      questions: [
        { question: "Tell me about a time you scaled a service." },
        { question: "How do you handle incidents?" },
      ],
    });
    expect(parsed.questions).toHaveLength(2);
    expect(parsed.questions[0].category).toBe("role-specific");
    expect(parsed.questions[0].difficulty).toBe("medium");
  });

  test("rejects an empty question array", () => {
    expect(
      createInterviewQuestionsBulkSchema.safeParse({
        role: "Backend Engineer",
        questions: [],
      }).success,
    ).toBeFalse();
  });

  test("rejects more than 20 questions", () => {
    const questions = Array.from({ length: 21 }, (_, i) => ({
      question: `Question ${i + 1}?`,
    }));
    expect(
      createInterviewQuestionsBulkSchema.safeParse({
        role: "Backend Engineer",
        questions,
      }).success,
    ).toBeFalse();
  });
});
