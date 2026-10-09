import { api } from "@/lib/api";

/**
 * A cover letter as returned by `GET /api/v1/cover-letters`.
 *
 * Every column on the `cover_letters` table is nullable apart from the id and
 * title, and the Drizzle row is echoed straight back by the controller, so the
 * frontend types mirror that with `null` wherever the column allows it. Dates
 * arrive as ISO strings (Hono serialises the Drizzle `Date` objects).
 */
export interface CoverLetterItem {
  id: string;
  userId?: string | null;
  title?: string | null;
  companyName?: string | null;
  role?: string | null;
  tone?: CoverLetterTone | null;
  status?: "draft" | "final" | null;
  content?: string | null;
  jobDescription?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type CoverLetterTone = "professional" | "friendly" | "confident";
export type CoverLetterStatus = "draft" | "final";

export const COVER_LETTERS_QUERY_KEY = ["cover-letters", "list"] as const;

export const coverLetterQueryKey = (letterId: string) =>
  ["cover-letters", "detail", letterId] as const;

export async function fetchCoverLetters(): Promise<CoverLetterItem[]> {
  const letters = await api.get<CoverLetterItem[] | null>(
    "/api/v1/cover-letters",
  );
  // The envelope unwrapper falls back to the whole body when `data` is null,
  // so guard on the shape rather than trusting the cast.
  return Array.isArray(letters) ? letters : [];
}

export async function fetchCoverLetter(
  letterId: string,
): Promise<CoverLetterItem> {
  return api.get<CoverLetterItem>(`/api/v1/cover-letters/${letterId}`);
}

/** The body of `POST /api/v1/cover-letters` — mirrors `createCoverLetterSchema`. */
export interface CreateCoverLetterPayload {
  title: string;
  companyName?: string;
  role?: string;
  tone: CoverLetterTone;
  content?: string;
  jobDescription?: string;
}

export async function createCoverLetter(
  payload: CreateCoverLetterPayload,
): Promise<{ id: string }> {
  return api.post<{ id: string }>("/api/v1/cover-letters", payload);
}

/**
 * The body of `PUT /api/v1/cover-letters/:id` — mirrors
 * `updateCoverLetterSchema`. Every field is optional so a partial edit (just
 * the status, say) is valid; the schema is strict about unknown keys.
 */
export interface UpdateCoverLetterPayload {
  title?: string;
  companyName?: string;
  role?: string;
  tone?: CoverLetterTone;
  status?: CoverLetterStatus;
  content?: string;
  jobDescription?: string;
}

export async function updateCoverLetter(
  letterId: string,
  payload: UpdateCoverLetterPayload,
): Promise<CoverLetterItem> {
  return api.put<CoverLetterItem>(
    `/api/v1/cover-letters/${letterId}`,
    payload,
  );
}

export async function deleteCoverLetter(letterId: string): Promise<void> {
  await api.delete(`/api/v1/cover-letters/${letterId}`);
}

/** Most recently updated first; ties broken by creation time. */
export function sortRecentCoverLetters(
  letters: CoverLetterItem[],
): CoverLetterItem[] {
  return [...letters].sort((a, b) => {
    const left = a.updatedAt ?? a.createdAt ?? "";
    const right = b.updatedAt ?? b.createdAt ?? "";
    return right.localeCompare(left);
  });
}

/** A short, single-line preview of the letter body for the card. */
export function coverLetterExcerpt(
  content: string | null | undefined,
  length = 180,
): string {
  const collapsed = (content ?? "").replace(/\s+/g, " ").trim();
  if (collapsed.length <= length) return collapsed;
  return `${collapsed.slice(0, length).trimEnd()}…`;
}