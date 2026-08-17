import { z } from "zod";

const experienceSchema = z.object({
  company: z.string().trim().min(1, "Company name required"),
  role: z.string().trim().min(1, "Role/Designation required"),
  location: z.string().trim().optional(),
  startDate: z.string().trim().min(1, "Start date required"),
  endDate: z.string().trim().optional(),
  currentlyWorking: z.boolean().default(false),
  description: z.string().trim().optional(),
  workLink: z
    .string()
    .trim()
    .url("Valid URL required")
    .optional()
    .or(z.literal("")),
});

const educationSchema = z.object({
  school: z.string().trim().min(1, "School/College name required"),
  degree: z.string().trim().min(1, "Degree name required"),
  fieldOfStudy: z.string().trim().optional(),
  location: z.string().trim().optional(),
  startYear: z.string().trim().optional(),
  endYear: z.string().trim().min(1, "Passing year required"),
  grade: z.string().trim().optional(),
});

const projectSchema = z.object({
  title: z.string().trim().min(1, "Project title required"),
  description: z.string().trim().optional(),
  techStack: z
    .array(z.string())
    .default([])
    .transform((val) => {
      const trimmedTechStack = val.map((ts) => ts.trim()).filter(Boolean);
      const uniqueTechStack = [...new Set(trimmedTechStack)];
      return uniqueTechStack;
    }),
  liveLink: z
    .string()
    .trim()
    .url("Valid URL required")
    .optional()
    .or(z.literal("")),
  githubLink: z
    .string()
    .trim()
    .url("Valid URL required")
    .optional()
    .or(z.literal("")),
});

const certificationSchema = z.object({
  name: z.string().trim().min(1, "Certificate name required"),
  issuer: z.string().trim().min(1, "Issuing organization required"),
  issueDate: z.string().trim().optional(),
  credentialUrl: z
    .string()
    .trim()
    .url("Valid URL required")
    .optional()
    .or(z.literal("")),
});

const languageSchema = z.object({
  name: z.string().trim().min(1, "Language name required"),
  proficiency: z.string().trim().min(1, "Proficiency level required"),
});

export const updateResumeSchema = z.object({
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
    .url()
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .trim()
    .max(255, "LinkedIn URL must be 255 characters or less")
    .url()
    .optional()
    .or(z.literal("")),
  githubUrl: z
    .string()
    .trim()
    .max(255, "GitHub URL must be 255 characters or less")
    .url()
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
    .default([])
    .transform((val) => {
      const trimmedSkills = val.map((skill) => skill.trim()).filter(Boolean);
      const uniqueSkills = [...new Set(trimmedSkills)];
      return uniqueSkills;
    }),

  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  projects: z.array(projectSchema).default([]),

  certifications: z.array(certificationSchema).default([]),
  languages: z.array(languageSchema).default([]),

  isPublished: z.boolean().default(false),
  isPublic: z.boolean().default(false),
});

export const resumeIdSchema = z.object({
  resumeId: z
    .string({ error: "Resume ID is required" })
    .trim()
    .min(1, "Resume ID is required"),
});

export const createResumeSchema = z.object({
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
});

export const updateResumeNameSchema = z.object({
  resumeTitle: z
    .string({ error: "Resume title is required" })
    .trim()
    .min(1, "Resume title is required"),
});

export const updateResumeTemplateSchema = z.object({
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
});

// types
export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type ResumeIdInput = z.infer<typeof resumeIdSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
export type UpdateResumeNameInput = z.infer<typeof updateResumeNameSchema>;
export type UpdateResumeTemplateInput = z.infer<
  typeof updateResumeTemplateSchema
>;
