import { describe, expect, test } from "bun:test";
import { getResumeById, mockResumes } from "./resumes";

describe("getResumeById", () => {
  test("returns the resume matching the id", () => {
    const first = mockResumes[0];
    expect(getResumeById(first.id)).toEqual(first);
  });

  test("returns undefined for an unknown id", () => {
    expect(getResumeById("does-not-exist")).toBeUndefined();
  });
});

describe("mockResumes", () => {
  test("every resume has an email and a template", () => {
    for (const resume of mockResumes) {
      expect(typeof resume.email).toBe("string");
      expect(resume.email.length).toBeGreaterThan(0);
      expect(resume.template).toBeTruthy();
    }
  });

  test("ats scores are within 0-100", () => {
    for (const resume of mockResumes) {
      expect(resume.atsScore).toBeGreaterThanOrEqual(0);
      expect(resume.atsScore).toBeLessThanOrEqual(100);
    }
  });
});
