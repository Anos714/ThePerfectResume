import type { ResumeListItem } from "@/lib/resumes";

export interface DashboardStats {
  count: number;
  published: number;
  drafts: number;
  scored: number;
  totalViews: number;
  avgAtsScore: number;
  avgCompletion: number;
}

export type ActivityType =
  | "created"
  | "updated"
  | "published"
  | "shared"
  | "exported"
  | "scored";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  /** Preformatted relative label, e.g. "2 hours ago". */
  timestamp: string;
  /** Raw ISO timestamp used for sorting. */
  at: string;
}

const count = (resumes: ResumeListItem[], picked: boolean) =>
  resumes.filter((resume) => picked === !!resume.isPublished).length;

const average = (resumes: ResumeListItem[], pick: (r: ResumeListItem) => number) => {
  const scored = resumes.filter((resume) => pick(resume) > 0);
  if (scored.length === 0) return 0;
  return Math.round(
    scored.reduce((sum, resume) => sum + pick(resume), 0) / scored.length,
  );
};

/**
 * Roll the resume list up into the four stat cards on the dashboard home.
 * Averages skip resumes that have no score yet so a fresh draft does not drag
 * the numbers down.
 */
export function computeDashboardStats(resumes: ResumeListItem[]): DashboardStats {
  return {
    count: resumes.length,
    published: count(resumes, true),
    drafts: count(resumes, false),
    scored: resumes.filter((resume) => (resume.atsScore ?? 0) > 0).length,
    totalViews: resumes.reduce((sum, resume) => sum + (resume.views ?? 0), 0),
    avgAtsScore: average(resumes, (resume) => resume.atsScore ?? 0),
    avgCompletion: average(resumes, (resume) => resume.completion ?? 0),
  };
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Relative-time formatter for the activity feed: "Just now", "5 minutes ago",
 * "3 hours ago", "Yesterday", "4 days ago", then an absolute date once the
 * event is older than a week.
 */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Some time ago";

  const elapsed = now.getTime() - then;
  if (elapsed < 0) return "Just now";

  const minutes = Math.floor(elapsed / MINUTE);
  const hours = Math.floor(elapsed / HOUR);
  const days = Math.floor(elapsed / DAY);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const titleOf = (resume: ResumeListItem): string =>
  resume.resumeTitle?.trim() || "Untitled resume";

/**
 * Build the recent-activity feed from the resume timestamps. The backend has no
 * activity log, so the feed is derived from what is knowable: a resume was
 * created at `createdAt` and last edited at `updatedAt` (an edit that landed in
 * the same request as the create is not reported as a second event).
 */
export function deriveRecentActivity(
  resumes: ResumeListItem[],
  limit = 5,
  now: Date = new Date(),
): ActivityItem[] {
  const events: ActivityItem[] = [];

  for (const resume of resumes) {
    const title = titleOf(resume);
    const createdAt = resume.createdAt ?? null;
    const updatedAt = resume.updatedAt ?? null;

    if (createdAt) {
      events.push({
        id: `${resume.id}:created`,
        type: "created",
        message: `Created “${title}”`,
        timestamp: formatRelativeTime(createdAt, now),
        at: createdAt,
      });
    }

    if (updatedAt && updatedAt !== createdAt) {
      events.push({
        id: `${resume.id}:updated`,
        type: resume.isPublished ? "published" : "updated",
        message: resume.isPublished
          ? `Published “${title}”`
          : `Updated “${title}”`,
        timestamp: formatRelativeTime(updatedAt, now),
        at: updatedAt,
      });
    }
  }

  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

/** Most recently touched resumes first, for the "Recent resumes" list. */
export function sortRecentResumes(resumes: ResumeListItem[]): ResumeListItem[] {
  return [...resumes].sort((a, b) => {
    const left = a.updatedAt ?? a.createdAt ?? "";
    const right = b.updatedAt ?? b.createdAt ?? "";
    return right.localeCompare(left);
  });
}
