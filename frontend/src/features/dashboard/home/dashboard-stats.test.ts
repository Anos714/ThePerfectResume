import { describe, expect, test } from "bun:test";
import type { ResumeListItem } from "@/lib/resumes";
import {
  computeDashboardStats,
  deriveRecentActivity,
  formatRelativeTime,
  sortRecentResumes,
} from "./dashboard-stats";

const NOW = new Date("2026-10-07T12:00:00Z");

const makeResume = (
  overrides: Partial<ResumeListItem> = {},
): ResumeListItem => ({
  id: "res_1",
  resumeTitle: "Senior Product Designer",
  template: "ats_professional",
  isPublished: true,
  atsScore: 90,
  views: 10,
  completion: 80,
  createdAt: "2026-09-01T00:00:00Z",
  updatedAt: "2026-10-01T00:00:00Z",
  ...overrides,
});

describe("computeDashboardStats", () => {
  test("counts resumes, published and drafts", () => {
    const stats = computeDashboardStats([
      makeResume({ id: "a", isPublished: true }),
      makeResume({ id: "b", isPublished: true }),
      makeResume({ id: "c", isPublished: false }),
    ]);

    expect(stats.count).toBe(3);
    expect(stats.published).toBe(2);
    expect(stats.drafts).toBe(1);
  });

  test("sums views across resumes", () => {
    const stats = computeDashboardStats([
      makeResume({ id: "a", views: 142 }),
      makeResume({ id: "b", views: 38 }),
      makeResume({ id: "c", views: undefined }),
    ]);

    expect(stats.totalViews).toBe(180);
  });

  test("averages ats score and completion, ignoring unscored resumes", () => {
    const stats = computeDashboardStats([
      makeResume({ id: "a", atsScore: 98, completion: 96 }),
      makeResume({ id: "b", atsScore: 82, completion: 70 }),
      makeResume({ id: "c", atsScore: null, completion: null }),
    ]);

    expect(stats.avgAtsScore).toBe(90);
    expect(stats.avgCompletion).toBe(83);
  });

  test("returns zeros for an empty list", () => {
    const stats = computeDashboardStats([]);

    expect(stats).toEqual({
      count: 0,
      published: 0,
      drafts: 0,
      scored: 0,
      totalViews: 0,
      avgAtsScore: 0,
      avgCompletion: 0,
    });
  });

  test("counts scored resumes separately from the average", () => {
    const stats = computeDashboardStats([
      makeResume({ id: "a", atsScore: 98 }),
      makeResume({ id: "b", atsScore: null }),
    ]);

    expect(stats.scored).toBe(1);
  });
});

describe("formatRelativeTime", () => {
  test("formats recent deltas relatively", () => {
    expect(formatRelativeTime("2026-10-07T12:00:00Z", NOW)).toBe("Just now");
    expect(formatRelativeTime("2026-10-07T11:58:00Z", NOW)).toBe(
      "2 minutes ago",
    );
    expect(formatRelativeTime("2026-10-07T10:00:00Z", NOW)).toBe("2 hours ago");
    expect(formatRelativeTime("2026-10-06T12:00:00Z", NOW)).toBe("Yesterday");
    expect(formatRelativeTime("2026-10-04T12:00:00Z", NOW)).toBe("3 days ago");
  });

  test("falls back to an absolute date past a week", () => {
    expect(formatRelativeTime("2026-09-20T12:00:00Z", NOW)).toBe(
      "Sep 20, 2026",
    );
  });

  test("handles an unparseable timestamp", () => {
    expect(formatRelativeTime("not-a-date", NOW)).toBe("Some time ago");
  });

  test("treats future timestamps as just now", () => {
    expect(formatRelativeTime("2027-01-01T00:00:00Z", NOW)).toBe("Just now");
  });
});

describe("deriveRecentActivity", () => {
  test("emits a created event per resume and an updated event when timestamps differ", () => {
    const activity = deriveRecentActivity(
      [makeResume({ id: "res_1" })],
      10,
      NOW,
    );

    expect(activity).toEqual([
      {
        id: "res_1:updated",
        type: "published",
        message: "Published “Senior Product Designer”",
        timestamp: "6 days ago",
        at: "2026-10-01T00:00:00Z",
      },
      {
        id: "res_1:created",
        type: "created",
        message: "Created “Senior Product Designer”",
        timestamp: "Sep 1, 2026",
        at: "2026-09-01T00:00:00Z",
      },
    ]);
  });

  test("reports a draft edit as an update, not a publish", () => {
    const activity = deriveRecentActivity(
      [makeResume({ id: "res_1", isPublished: false })],
      10,
      NOW,
    );

    expect(activity[0].type).toBe("updated");
    expect(activity[0].message).toBe("Updated “Senior Product Designer”");
  });

  test("skips the updated event when it matches the created timestamp", () => {
    const activity = deriveRecentActivity(
      [makeResume({ id: "res_1", createdAt: "2026-10-01T00:00:00Z", updatedAt: "2026-10-01T00:00:00Z" })],
      10,
      NOW,
    );

    expect(activity).toHaveLength(1);
    expect(activity[0].type).toBe("created");
  });

  test("sorts newest first and honours the limit", () => {
    const activity = deriveRecentActivity(
      [
        makeResume({ id: "old", updatedAt: "2026-08-01T00:00:00Z" }),
        makeResume({ id: "new", updatedAt: "2026-10-05T00:00:00Z" }),
      ],
      1,
      NOW,
    );

    expect(activity).toHaveLength(1);
    expect(activity[0].id).toBe("new:updated");
  });

  test("falls back to an untitled label", () => {
    const activity = deriveRecentActivity(
      [makeResume({ id: "res_1", resumeTitle: "  " })],
      10,
      NOW,
    );

    expect(activity[0].message).toContain("Untitled resume");
  });

  test("returns nothing for an empty list", () => {
    expect(deriveRecentActivity([], 10, NOW)).toEqual([]);
  });
});

describe("sortRecentResumes", () => {
  test("orders by updatedAt descending without mutating the input", () => {
    const input = [
      makeResume({ id: "old", updatedAt: "2026-08-01T00:00:00Z" }),
      makeResume({ id: "new", updatedAt: "2026-10-05T00:00:00Z" }),
    ];

    const sorted = sortRecentResumes(input);

    expect(sorted.map((resume) => resume.id)).toEqual(["new", "old"]);
    expect(input.map((resume) => resume.id)).toEqual(["old", "new"]);
  });

  test("falls back to createdAt when updatedAt is missing", () => {
    const sorted = sortRecentResumes([
      makeResume({ id: "a", updatedAt: null, createdAt: "2026-09-01T00:00:00Z" }),
      makeResume({ id: "b", updatedAt: "2026-10-01T00:00:00Z" }),
    ]);

    expect(sorted.map((resume) => resume.id)).toEqual(["b", "a"]);
  });
});
