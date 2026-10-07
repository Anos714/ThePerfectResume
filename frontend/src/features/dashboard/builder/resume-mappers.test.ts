import { describe, expect, test } from "bun:test";
import type { ResumeListItem } from "@/lib/resumes";
import { buildResumePayload, normalizeResumeData, normalizeTemplate } from "./resume-mappers";
import type { ResumeData, TemplateId } from "@/data/types";

const makeResume = (overrides: Partial<ResumeListItem> = {}): ResumeListItem => ({
  id: "res_1",
  resumeTitle: "Senior Product Designer",
  template: "ats_professional",
  isPublished: true,
  atsScore: 90,
  views: 10,
  completion: 80,
  createdAt: "2026-09-01T00:00:00Z",
  updatedAt: "2026-10-01T00:00:00Z",
  ...overrides,
});

const sampleData: ResumeData = {
  fullName: "Alexandra Carter",
  headline: "Senior Product Designer",
  email: "",
  phoneNumber: "+1 555",
  location: "San Francisco",
  websiteUrl: "https://alex.cv",
  linkedinUrl: "",
  githubUrl: "",
  summary: "Designer.",
  skills: ["Figma", "Prototyping"],
  experience: [
    {
      id: "exp_1",
      company: "Lumina",
      role: "Senior Product Designer",
      location: "SF",
      startDate: "2021-06",
      endDate: undefined,
      currentlyWorking: true,
      description: "Led redesign.",
      workLink: "https://lumina.com",
    },
  ],
  education: [
    {
      id: "edu_1",
      school: "RISD",
      degree: "BFA",
      fieldOfStudy: "Interaction Design",
      location: "Providence",
      startYear: "2010",
      endYear: "2014",
      grade: "",
    },
  ],
  projects: [
    {
      id: "prj_1",
      title: "Design Tokens",
      description: "Token pipeline.",
      techStack: ["TypeScript", "Figma API"],
      liveLink: "",
      githubLink: "https://github.com/alex/tokens",
    },
  ],
  certifications: [
    { id: "cer_1", name: "NN/g UX", issuer: "NN/g", issueDate: "2022-09", credentialUrl: "" },
  ],
  languages: [{ id: "lng_1", name: "English", proficiency: "Native" }],
};

describe("normalizeResumeData", () => {
  test("fills every scalar with an empty string when the row is blank", () => {
    const data = normalizeResumeData(
      makeResume({
        fullName: null,
        headline: null,
        phoneNumber: null,
        location: null,
        websiteUrl: null,
        linkedinUrl: null,
        githubUrl: null,
        summary: null,
      }),
    );

    expect(data.fullName).toBe("");
    expect(data.headline).toBe("");
    expect(data.phoneNumber).toBe("");
    expect(data.location).toBe("");
    expect(data.websiteUrl).toBe("");
    expect(data.linkedinUrl).toBe("");
    expect(data.githubUrl).toBe("");
    expect(data.summary).toBe("");
  });

  test("email is always empty — there is no column for it", () => {
    expect(normalizeResumeData(makeResume()).email).toBe("");
  });

  test("defaults missing arrays to empty and coerces skill entries", () => {
    const data = normalizeResumeData(
      makeResume({
        skills: ["Figma", 42, null, "Prototyping"] as unknown as string[],
        experience: null,
        education: null,
        projects: null,
        certifications: null,
        languages: null,
      }),
    );

    expect(data.skills).toEqual(["Figma", "Prototyping"]);
    expect(data.experience).toEqual([]);
    expect(data.education).toEqual([]);
    expect(data.projects).toEqual([]);
    expect(data.certifications).toEqual([]);
    expect(data.languages).toEqual([]);
  });

  test("maps a well-formed experience entry through unchanged", () => {
    const row = makeResume({
      experience: [
        {
          id: "exp_1",
          company: "Lumina",
          role: "Senior Product Designer",
          location: "SF",
          startDate: "2021-06",
          endDate: null,
          currentlyWorking: true,
          description: "Led redesign.",
          workLink: "https://lumina.com",
        },
      ],
    });

    expect(normalizeResumeData(row).experience).toEqual([
      {
        id: "exp_1",
        company: "Lumina",
        role: "Senior Product Designer",
        location: "SF",
        startDate: "2021-06",
        endDate: "",
        currentlyWorking: true,
        description: "Led redesign.",
        workLink: "https://lumina.com",
      },
    ]);
  });

  test("assigns ids to entries written before ids existed", () => {
    const row = makeResume({
      languages: [
        { name: "English", proficiency: "Native" },
        { name: "Spanish", proficiency: "Professional" },
      ] as unknown as ResumeListItem["languages"],
    });

    const languages = normalizeResumeData(row).languages;

    expect(languages).toHaveLength(2);
    expect(languages[0].id.startsWith("row_")).toBeTrue();
    expect(languages[1].id.startsWith("row_")).toBeTrue();
    expect(languages[0].id).not.toBe(languages[1].id);
    expect(languages[0]).toMatchObject({ name: "English", proficiency: "Native" });
  });

  test("keeps existing ids and treats non-object junk as an empty entry", () => {
    const row = makeResume({
      projects: [
        { id: "prj_1", title: "Tokens", techStack: ["TS"] },
        "garbage",
        null,
      ] as unknown as ResumeListItem["projects"],
    });

    const projects = normalizeResumeData(row).projects;

    expect(projects).toHaveLength(3);
    expect(projects[0].id).toBe("prj_1");
    expect(projects[0].title).toBe("Tokens");
    expect(projects[0].techStack).toEqual(["TS"]);
    expect(projects[1]).toMatchObject({ title: "", techStack: [] });
    expect(projects[1].id.startsWith("row_")).toBeTrue();
    expect(projects[2].title).toBe("");
  });

  test("currentlyWorking is only true when the server said so", () => {
    const row = makeResume({
      experience: [
        { currentlyWorking: true },
        { currentlyWorking: "yes" },
        {},
      ] as unknown as ResumeListItem["experience"],
    });

    const flags = normalizeResumeData(row).experience.map((e) => e.currentlyWorking);
    expect(flags).toEqual([true, false, false]);
  });
});

describe("normalizeTemplate", () => {
  test("passes a known template through", () => {
    expect(normalizeTemplate(makeResume({ template: "creative" }))).toBe(
      "creative",
    );
  });

  test("falls back to classic when the column is null", () => {
    expect(normalizeTemplate(makeResume({ template: null }))).toBe("classic");
  });
});

describe("buildResumePayload", () => {
  test("carries every persisted field", () => {
    const payload = buildResumePayload(sampleData, {
      resumeTitle: "Senior Product Designer",
      template: "modern",
      published: false,
    });

    expect(payload).toEqual({
      resumeTitle: "Senior Product Designer",
      template: "modern",
      fullName: sampleData.fullName,
      headline: sampleData.headline,
      phoneNumber: sampleData.phoneNumber,
      location: sampleData.location,
      websiteUrl: sampleData.websiteUrl,
      linkedinUrl: sampleData.linkedinUrl,
      githubUrl: sampleData.githubUrl,
      summary: sampleData.summary,
      skills: sampleData.skills,
      experience: sampleData.experience,
      education: sampleData.education,
      projects: sampleData.projects,
      certifications: sampleData.certifications,
      languages: sampleData.languages,
      isPublished: false,
      isPublic: false,
    });
  });

  test("publishing sends both visibility flags together", () => {
    const payload = buildResumePayload(sampleData, {
      resumeTitle: "T",
      template: "classic",
      published: true,
    });

    expect(payload.isPublished).toBeTrue();
    expect(payload.isPublic).toBeTrue();
  });

  test("leaves out everything the schema rejects", () => {
    const payload = buildResumePayload(sampleData, {
      resumeTitle: "T",
      template: "classic",
      published: false,
    });

    expect(payload).not.toHaveProperty("email");
    expect(payload).not.toHaveProperty("id");
    expect(payload).not.toHaveProperty("atsScore");
    expect(payload).not.toHaveProperty("views");
    expect(payload).not.toHaveProperty("completion");
    expect(payload).not.toHaveProperty("updatedAt");
  });

  test("the payload type accepts every template literal", () => {
    const templates: TemplateId[] = [
      "classic",
      "modern",
      "ats_professional",
      "minimalist",
      "creative",
      "executive",
    ];

    for (const template of templates) {
      expect(
        buildResumePayload(sampleData, {
          resumeTitle: "T",
          template,
          published: false,
        }).template,
      ).toBe(template);
    }
  });
});
