import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  ProjectItem,
  ResumeData,
  TemplateId,
} from "@/data/types";
import type { ResumeListItem, UpdateResumePayload } from "@/lib/resumes";

/**
 * Bridge between the nullable Drizzle columns the API hands back and the
 * non-optional shapes the editor and preview work in. Rows created before the
 * editor existed can have missing or half-filled jsonb entries, so every field
 * is coerced and list items without an `id` get one so React keys stay stable.
 */

const asString = (value: unknown): string =>
  typeof value === "string" ? value : "";

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};

// Rows written before ids existed in the schema arrive without one; a
// monotonic counter keeps them unique within the document.
const ensureId = (entry: Record<string, unknown>, index: number): string =>
  typeof entry.id === "string" && entry.id.length > 0
    ? entry.id
    : `row_${Date.now().toString(36)}_${index}`;

export function normalizeResumeData(resume: ResumeListItem): ResumeData {
  const rawExperience = Array.isArray(resume.experience) ? resume.experience : [];
  const rawEducation = Array.isArray(resume.education) ? resume.education : [];
  const rawProjects = Array.isArray(resume.projects) ? resume.projects : [];
  const rawCerts = Array.isArray(resume.certifications)
    ? resume.certifications
    : [];
  const rawLanguages = Array.isArray(resume.languages) ? resume.languages : [];

  const experience: ExperienceItem[] = rawExperience.map((entry, index) => {
    const item = asRecord(entry);
    return {
      id: ensureId(item, index),
      company: asString(item.company),
      role: asString(item.role),
      location: asString(item.location),
      startDate: asString(item.startDate),
      endDate: asString(item.endDate),
      currentlyWorking: item.currentlyWorking === true,
      description: asString(item.description),
      workLink: asString(item.workLink),
    };
  });

  const education: EducationItem[] = rawEducation.map((entry, index) => {
    const item = asRecord(entry);
    return {
      id: ensureId(item, index),
      school: asString(item.school),
      degree: asString(item.degree),
      fieldOfStudy: asString(item.fieldOfStudy),
      location: asString(item.location),
      startYear: asString(item.startYear),
      endYear: asString(item.endYear),
      grade: asString(item.grade),
    };
  });

  const projects: ProjectItem[] = rawProjects.map((entry, index) => {
    const item = asRecord(entry);
    return {
      id: ensureId(item, index),
      title: asString(item.title),
      description: asString(item.description),
      techStack: asStringArray(item.techStack),
      liveLink: asString(item.liveLink),
      githubLink: asString(item.githubLink),
    };
  });

  const certifications: CertificationItem[] = rawCerts.map((entry, index) => {
    const item = asRecord(entry);
    return {
      id: ensureId(item, index),
      name: asString(item.name),
      issuer: asString(item.issuer),
      issueDate: asString(item.issueDate),
      credentialUrl: asString(item.credentialUrl),
    };
  });

  const languages: LanguageItem[] = rawLanguages.map((entry, index) => {
    const item = asRecord(entry);
    return {
      id: ensureId(item, index),
      name: asString(item.name),
      proficiency: asString(item.proficiency),
    };
  });

  return {
    fullName: asString(resume.fullName),
    headline: asString(resume.headline),
    // There is no email column on the resumes table, so this is always empty
    // from the API; the editor no longer shows a field for it.
    email: "",
    phoneNumber: asString(resume.phoneNumber),
    location: asString(resume.location),
    websiteUrl: asString(resume.websiteUrl),
    linkedinUrl: asString(resume.linkedinUrl),
    githubUrl: asString(resume.githubUrl),
    summary: asString(resume.summary),
    skills: asStringArray(resume.skills),
    experience,
    education,
    projects,
    certifications,
    languages,
  };
}

export function normalizeTemplate(resume: ResumeListItem): TemplateId {
  return resume.template ?? "classic";
}

export interface BuildPayloadOptions {
  resumeTitle: string;
  template: TemplateId;
  published: boolean;
}

/**
 * Produce the exact body `PUT /api/v1/resumes/:id` accepts — the schema is
 * strict about unknown keys, so nothing the API cannot store (email, ids at the
 * document level, analytics columns) may sneak in. Both visibility flags ride
 * along on every write because the schema defaults them to false.
 */
export function buildResumePayload(
  data: ResumeData,
  { resumeTitle, template, published }: BuildPayloadOptions,
): UpdateResumePayload {
  return {
    resumeTitle,
    template,
    fullName: data.fullName,
    headline: data.headline,
    phoneNumber: data.phoneNumber,
    location: data.location,
    websiteUrl: data.websiteUrl,
    linkedinUrl: data.linkedinUrl,
    githubUrl: data.githubUrl,
    summary: data.summary,
    skills: data.skills,
    experience: data.experience,
    education: data.education,
    projects: data.projects,
    certifications: data.certifications,
    languages: data.languages,
    isPublished: published,
    isPublic: published,
  };
}
