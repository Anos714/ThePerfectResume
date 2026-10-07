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
  // The envelope unwrapper falls back to the whole body when `data` is null,
  // so guard on the shape rather than trusting the cast.
  return Array.isArray(resumes) ? resumes : [];
}

/** What `POST /api/v1/resumes` hands back — just the new row's id. */
export interface CreatedResume {
  id: string;
}

export async function createResume(input: {
  resumeTitle?: string;
  template?: TemplateId;
}): Promise<CreatedResume> {
  return api.post<CreatedResume>("/api/v1/resumes", input);
}

export async function deleteResume(resumeId: string): Promise<void> {
  await api.delete(`/api/v1/resumes/${resumeId}`);
}

export async function renameResume(
  resumeId: string,
  resumeTitle: string,
): Promise<ResumeListItem> {
  return api.patch<ResumeListItem>(
    `/api/v1/resumes/${resumeId}/rename`,
    { resumeTitle },
  );
}

export async function updateResumeTemplate(
  resumeId: string,
  template: TemplateId,
): Promise<ResumeListItem> {
  return api.patch<ResumeListItem>(
    `/api/v1/resumes/${resumeId}/template`,
    { template },
  );
}

// The backend schema requires isPublished and isPublic to move together, so a
// single boolean drives both.
export async function setResumePublished(
  resumeId: string,
  published: boolean,
): Promise<ResumeListItem> {
  return api.patch<ResumeListItem>(
    `/api/v1/resumes/${resumeId}/visibility`,
    { isPublished: published, isPublic: published },
  );
}

export interface ResumePublicLink {
  resumeId: string;
  resumeTitle?: string | null;
  shareUrl: string;
}

export async function fetchResumePublicLink(
  resumeId: string,
): Promise<ResumePublicLink> {
  return api.get<ResumePublicLink>(
    `/api/v1/resumes/${resumeId}/public-link`,
  );
}

/**
 * Fallback share URL for the rare case the backend cannot be reached. Mirrors
 * `getResumePublicLinkService` on the server: `${FRONTEND_URL}/public/resumes/:id`.
 */
export function buildShareUrl(resumeId: string, origin: string): string {
  return `${origin}/public/resumes/${resumeId}`;
}

/** Most recently touched resumes first. */
export function sortRecentResumes(resumes: ResumeListItem[]): ResumeListItem[] {
  return [...resumes].sort((a, b) => {
    const left = a.updatedAt ?? a.createdAt ?? "";
    const right = b.updatedAt ?? b.createdAt ?? "";
    return right.localeCompare(left);
  });
}
