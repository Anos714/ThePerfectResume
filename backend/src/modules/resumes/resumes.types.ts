interface ResumeResponseData {
  id: string;
  userId?: string | null;
  resumeTitle?: string | null;
  template?:
    | "classic"
    | "modern"
    | "ats_professional"
    | "minimalist"
    | "creative"
    | "executive"
    | null;
  fullName?: string | null;
  headline?: string | null;
  phoneNumber?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  summary?: string | null;
  skills?: unknown | null;
  experience?: unknown | null;
  education?: unknown | null;
  projects?: unknown | null;
  certifications?: unknown | null;
  languages?: unknown | null;
  isPublished?: boolean | null;
  isPublic?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface ResumeSuccessResponse {
  success: boolean;
  message?: string;
  data?: ResumeResponseData | ResumeResponseData[] | null;
}
