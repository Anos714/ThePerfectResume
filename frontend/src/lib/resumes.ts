import { api } from "@/lib/api";
import type { TemplateId } from "@/data/types";

/**
 * A resume as returned by `GET /api/v1/resumes`.
 *
 * Every column on the `resumes` table is nullable apart from the id, and the
 * Drizzle row is echoed straight back by the controller, so the frontend types
 * mirror that with `null` everywhere the column allows it. `completion` is the
 * one derived field — the service computes it on read, so it is always a
 * number on a 200 response.
 *
 * Dates arrive as ISO strings (Hono serialises the Drizzle `Date` objects).
 */
export interface ResumeListItem {
  id: string;
  userId?: string | null;
  resumeTitle?: string | null;
  template?: TemplateId | null;
  fullName?: string | null;
  headline?: string | null;
  phoneNumber?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  summary?: string | null;
  skills?: string[] | null;
  experience?: unknown[] | null;
  education?: unknown[] | null;
  projects?: unknown[] | null;
  certifications?: unknown[] | null;
  languages?: unknown[] | null;
  isPublished?: boolean | null;
  isPublic?: boolean | null;
  atsScore?: number | null;
  views?: number | null;
  completion?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export const RESUMES_QUERY_KEY = ["resumes", "list"] as const;

export async function fetchResumes(): Promise<ResumeListItem[]> {
  const resumes = await api.get<ResumeListItem[] | null>("/api/v1/resumes");
  return resumes ?? [];
}
