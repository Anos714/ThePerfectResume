export type TemplateId =
  | "classic"
  | "modern"
  | "ats_professional"
  | "minimalist"
  | "creative"
  | "executive";

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  currentlyWorking: boolean;
  description?: string;
  workLink?: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy?: string;
  location?: string;
  startYear?: string;
  endYear: string;
  grade?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description?: string;
  techStack: string[];
  liveLink?: string;
  githubLink?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency: string;
}

export interface ResumeData {
  fullName: string;
  headline: string;
  email: string;
  phoneNumber: string;
  location: string;
  websiteUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  summary: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
}

export interface Resume extends ResumeData {
  id: string;
  resumeTitle: string;
  template: TemplateId;
  isPublished: boolean;
  isPublic: boolean;
  atsScore: number;
  views: number;
  completion: number;
  createdAt: string;
  updatedAt: string;
}
