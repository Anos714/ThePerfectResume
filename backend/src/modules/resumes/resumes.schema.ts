import { z } from "zod";

const experienceSchema = z
  .object({
    id: z.string().trim().optional(),
    company: z.string().trim(),
    role: z.string().trim(),
    location: z.string().trim().optional(),
    startDate: z.string().trim(),
    endDate: z.string().trim().optional(),
    currentlyWorking: z.boolean().default(false),
    description: z.string().trim().optional(),
    workLink: z.string().trim().optional(),
  })
  .strict();

const educationSchema = z
  .object({
    id: z.string().trim().optional(),
    school: z.string().trim(),
    degree: z.string().trim(),
    fieldOfStudy: z.string().trim().optional(),
    location: z.string().trim().optional(),
    startYear: z.string().trim().optional(),
    endYear: z.string().trim(),
    grade: z.string().trim().optional(),
  })
  .strict();

const projectSchema = z
  .object({
    id: z.string().trim().optional(),
    title: z.string().trim(),
    description: z.string().trim().optional(),
    techStack: z
      .array(z.string())
      .max(50, "Too many technologies (max 50)")
      .default([])
      .transform((val) => {
        const trimmedTechStack = val.map((ts) => ts.trim()).filter(Boolean);
        const uniqueTechStack = [...new Set(trimmedTechStack)];
        return uniqueTechStack;
      }),
    liveLink: z.string().trim().optional(),
    githubLink: z.string().trim().optional(),
  })
  .strict();

const certificationSchema = z
  .object({
    id: z.string().trim().optional(),
    name: z.string().trim(),
    issuer: z.string().trim(),
    issueDate: z.string().trim().optional(),
    credentialUrl: z.string().trim().optional(),
  })
  .strict();

const languageSchema = z
  .object({
    id: z.string().trim().optional(),
    name: z.string().trim(),
    proficiency: z.string().trim(),
  })
  .strict();

export const updateResumeSchema = z
  .object({
    fullName: z.string().trim().optional().or(z.literal("")),
    headline: z
      .string()
      .trim()
      .max(255, "Headline must be 255 characters or less")
      .optional()
      .or(z.literal("")),
    phoneNumber: z
      .string()
      .trim()
      .max(20, "Phone number must be 20 characters or less")
      .optional()
      .or(z.literal("")),
    location: z
      .string()
      .trim()
      .max(255, "Location must be 255 characters or less")
      .optional()
      .or(z.literal("")),
    websiteUrl: z
      .string()
      .trim()
      .max(255, "Website URL must be 255 characters or less")
      .optional()
      .or(z.literal("")),
    linkedinUrl: z
      .string()
      .trim()
      .max(255, "LinkedIn URL must be 255 characters or less")
      .optional()
      .or(z.literal("")),
    githubUrl: z
      .string()
      .trim()
      .max(255, "GitHub URL must be 255 characters or less")
      .optional()
      .or(z.literal("")),
    summary: z
      .string()
      .trim()
      .max(750, "Summary must be 750 characters or less")
      .optional()
      .or(z.literal("")),

    resumeTitle: z.string().trim().default("Untitled"),
    template: z
      .enum([
        "classic",
        "modern",
        "ats_professional",
        "minimalist",
        "creative",
        "executive",
      ])
      .default("classic"),

    skills: z
      .array(z.string())
      .max(100, "Too many skills (max 100)")
      .default([])
      .transform((val) => {
        const trimmedSkills = val.map((skill) => skill.trim()).filter(Boolean);
        const uniqueSkills = [...new Set(trimmedSkills)];
        return uniqueSkills;
      }),

    experience: z
      .array(experienceSchema)
      .max(50, "Too many experience entries (max 50)")
      .default([]),
    education: z
      .array(educationSchema)
      .max(50, "Too many education entries (max 50)")
      .default([]),
    projects: z
      .array(projectSchema)
      .max(50, "Too many project entries (max 50)")
      .default([]),

    certifications: z
      .array(certificationSchema)
      .max(50, "Too many certifications (max 50)")
      .default([]),
    languages: z
      .array(languageSchema)
      .max(50, "Too many languages (max 50)")
      .default([]),

    isPublished: z.boolean().default(false),
    isPublic: z.boolean().default(false),
  })
  .strict();

export const createResumeSchema = z
  .object({
    resumeTitle: z.string().default("Untitled"),
    template: z
      .enum([
        "classic",
        "modern",
        "ats_professional",
        "minimalist",
        "creative",
        "executive",
      ])
      .default("classic"),
  })
  .strict();

export const updateResumeNameSchema = z
  .object({
    resumeTitle: z
      .string({ error: "Resume title is required" })
      .trim()
      .min(1, "Resume title is required"),
  })
  .strict();

export const updateResumeTemplateSchema = z
  .object({
    template: z.enum(
      [
        "classic",
        "modern",
        "ats_professional",
        "minimalist",
        "creative",
        "executive",
      ],
      { error: "Invalid template" },
    ),
  })
  .strict();

export const updateResumeVisibilitySchema = z
  .object({
    isPublished: z.boolean(),
    isPublic: z.boolean(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.isPublished !== data.isPublic) {
      ctx.addIssue({
        code: "custom",
        message: "Both isPublished and isPublic must be true or false",
        path: ["isPublic"],
      });
    }
  });

export const updateResumeAtsScoreSchema = z
  .object({
    atsScore: z
      .number({ error: "ATS score is required" })
      .int()
      .min(0, "ATS score must be 0 or higher")
      .max(100, "ATS score must be 100 or lower"),
  })
  .strict();

// types
export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
export type UpdateResumeNameInput = z.infer<typeof updateResumeNameSchema>;
export type UpdateResumeTemplateInput = z.infer<
  typeof updateResumeTemplateSchema
>;
export type UpdateResumeVisibilityInput = z.infer<
  typeof updateResumeVisibilitySchema
>;
export type UpdateResumeAtsScoreInput = z.infer<typeof updateResumeAtsScoreSchema>;
