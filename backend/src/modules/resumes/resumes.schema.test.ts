import { describe, expect, test } from "bun:test";
import {
  createResumeSchema,
  updateResumeAtsScoreSchema,
  updateResumeVisibilitySchema,
} from "./resumes.schema";

describe("updateResumeAtsScoreSchema", () => {
  test("accepts a score in range", () => {
    const parsed = updateResumeAtsScoreSchema.parse({ atsScore: 87 });
    expect(parsed.atsScore).toBe(87);
  });

  test("accepts the boundaries 0 and 100", () => {
    expect(updateResumeAtsScoreSchema.parse({ atsScore: 0 }).atsScore).toBe(0);
    expect(updateResumeAtsScoreSchema.parse({ atsScore: 100 }).atsScore).toBe(100);
  });

  test("rejects a score above 100", () => {
    expect(
      updateResumeAtsScoreSchema.safeParse({ atsScore: 101 }).success,
    ).toBeFalse();
  });

  test("rejects a negative score", () => {
    expect(
      updateResumeAtsScoreSchema.safeParse({ atsScore: -1 }).success,
    ).toBeFalse();
  });

  test("rejects a non-integer score", () => {
    expect(
      updateResumeAtsScoreSchema.safeParse({ atsScore: 87.5 }).success,
    ).toBeFalse();
  });

  test("rejects a missing score", () => {
    expect(updateResumeAtsScoreSchema.safeParse({}).success).toBeFalse();
  });
});

describe("updateResumeVisibilitySchema", () => {
  test("accepts both flags true", () => {
    const parsed = updateResumeVisibilitySchema.parse({
      isPublished: true,
      isPublic: true,
    });
    expect(parsed).toEqual({ isPublished: true, isPublic: true });
  });

  test("accepts both flags false", () => {
    const parsed = updateResumeVisibilitySchema.parse({
      isPublished: false,
      isPublic: false,
    });
    expect(parsed).toEqual({ isPublished: false, isPublic: false });
  });

  test("rejects mismatched flags", () => {
    expect(
      updateResumeVisibilitySchema.safeParse({
        isPublished: true,
        isPublic: false,
      }).success,
    ).toBeFalse();
  });
});

describe("createResumeSchema", () => {
  test("applies defaults for an empty body", () => {
    const parsed = createResumeSchema.parse({});
    expect(parsed.resumeTitle).toBe("Untitled");
    expect(parsed.template).toBe("classic");
  });

  test("rejects an unknown template", () => {
    expect(
      createResumeSchema.safeParse({ template: "fancy" }).success,
    ).toBeFalse();
  });
});
