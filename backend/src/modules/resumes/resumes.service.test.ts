import { describe, expect, test } from "bun:test";
import { computeCompletion } from "./resumes.service";

// A minimal stand-in for a resume row: computeCompletion only reads a handful
// of fields, so the rest can be absent.
const baseRow = {
  id: "res_1",
  userId: "usr_1",
  resumeTitle: "Test",
  template: "classic" as const,
  fullName: null,
  headline: null,
  phoneNumber: null,
  location: null,
  websiteUrl: null,
  linkedinUrl: null,
  githubUrl: null,
  summary: null,
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  languages: [],
  isPublished: false,
  isPublic: false,
  atsScore: 0,
  views: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("computeCompletion", () => {
  test("an empty resume scores 0", () => {
    expect(computeCompletion(baseRow)).toBe(0);
  });

  test("a fully filled resume scores 100", () => {
    expect(
      computeCompletion({
        ...baseRow,
        fullName: "Alexandra Carter",
        headline: "Senior Product Designer",
        summary: "Seven years of product design experience.",
        skills: ["Figma", "Design Systems"],
        experience: [{ company: "Lumina", role: "Designer" }],
        education: [{ school: "RISD", degree: "BFA" }],
        projects: [{ title: "Design System" }],
        certifications: [{ name: "Certified" }],
        phoneNumber: "+1 555 0100",
        location: "San Francisco",
        websiteUrl: "https://alex.cv",
      }),
    ).toBe(100);
  });

  test("identity-only fields contribute their weight", () => {
    // fullName 15 + headline 10 + summary 10 = 35
    expect(
      computeCompletion({
        ...baseRow,
        fullName: "Alexandra Carter",
        headline: "Senior Product Designer",
        summary: "Seven years of product design experience.",
      }),
    ).toBe(35);
  });

  test("sections contribute their weight", () => {
    // skills 15 + experience 15 + education 10 + projects 10 + certs 5 = 55
    expect(
      computeCompletion({
        ...baseRow,
        skills: ["Figma"],
        experience: [{ company: "Lumina", role: "Designer" }],
        education: [{ school: "RISD", degree: "BFA" }],
        projects: [{ title: "Design System" }],
        certifications: [{ name: "Certified" }],
      }),
    ).toBe(55);
  });

  test("contact fields contribute their weight", () => {
    // phone/location 5 + any link 5 = 10
    expect(
      computeCompletion({
        ...baseRow,
        phoneNumber: "+1 555 0100",
        linkedinUrl: "https://linkedin.com/in/alex",
      }),
    ).toBe(10);
  });

  test("a single link still counts", () => {
    expect(
      computeCompletion({
        ...baseRow,
        githubUrl: "https://github.com/alex",
      }),
    ).toBe(5);
  });

  test("whitespace-only values do not count as filled", () => {
    expect(
      computeCompletion({
        ...baseRow,
        fullName: "   ",
        headline: "",
        summary: "\t",
      }),
    ).toBe(0);
  });

  test("never exceeds 100", () => {
    expect(computeCompletion({ ...baseRow, fullName: "Alex" })).toBeLessThanOrEqual(100);
  });
});
