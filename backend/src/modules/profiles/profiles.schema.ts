import { z } from "zod";

const experienceSchema = z.object({
  company: z.string().min(1, "Company name required"),
  role: z.string().min(1, "Role/Designation required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().optional(),
  currentlyWorking: z.boolean().default(false),
  description: z.string().optional(),
  workLink: z.string().url("Valid URL required").optional().or(z.literal("")),
});

const educationSchema = z.object({
  school: z.string().min(1, "School/College name required"),
  degree: z.string().min(1, "Degree name required"),
  fieldOfStudy: z.string().optional(),
  location: z.string().optional(),
  startYear: z.string().optional(),
  endYear: z.string().min(1, "Passing year required"),
  grade: z.string().optional(),
});

const projectSchema = z.object({
  title: z.string().min(1, "Project title required"),
  description: z.string().optional(),
  techStack: z.array(z.string()).default([]),
  liveLink: z.string().url("Valid URL required").optional().or(z.literal("")),
  githubLink: z.string().url("Valid URL required").optional().or(z.literal("")),
});

const certificationSchema = z.object({
  name: z.string().min(1, "Certificate name required"),
  issuer: z.string().min(1, "Issuing organization required"),
  issueDate: z.string().optional(),
  credentialUrl: z
    .string()
    .url("Valid URL required")
    .optional()
    .or(z.literal("")),
});

const languageSchema = z.object({
  name: z.string().min(1, "Language name required"),
  proficiency: z.string().min(1, "Proficiency level required"),
});

export const createProfileSchema = z.object({
  fullName: z.string().optional().or(z.literal("")),
  headline: z
    .string()
    .max(255, "Headline must be 255 characters or less")
    .optional(),
  phoneNumber: z
    .string()
    .max(20, "Phone number must be 20 characters or less")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .max(255, "Location must be 255 characters or less")
    .optional()
    .or(z.literal("")),
  websiteUrl: z
    .string()
    .max(255, "Website URL must be 255 characters or less")
    .url()
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .max(255, "LinkedIn URL must be 255 characters or less")
    .url()
    .optional()
    .or(z.literal("")),
  githubUrl: z
    .string()
    .max(255, "GitHub URL must be 255 characters or less")
    .url()
    .optional()
    .or(z.literal("")),
  summary: z
    .string()
    .max(750, "Summary must be 750 characters or less")
    .optional(),
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
});

export type ProfileInput = z.infer<typeof createProfileSchema>;
