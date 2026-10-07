"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  FileText,
  Gauge,
  Plus,
  RefreshCw,
  Target,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import {
  fetchResumes,
  RESUMES_QUERY_KEY,
  type ResumeListItem,
} from "@/lib/resumes";
import { templateById } from "@/data/plans";
import {
  computeDashboardStats,
  deriveRecentActivity,
  sortRecentResumes,
} from "./dashboard-stats";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function useDashboardResumes() {
  return useQuery({
    queryKey: RESUMES_QUERY_KEY,
    queryFn: fetchResumes,
    staleTime: 30_000,
  });
}

function StatCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-8 w-8 animate-pulse rounded-lg bg-white/[0.06]" />
      </div>
      <div className="mt-4 h-8 w-16 animate-pulse rounded-lg bg-white/[0.06]" />
      <div className="mt-2 h-3 w-24 animate-pulse rounded-full bg-white/[0.04]" />
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <div className="h-5 w-24 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-10 w-72 animate-pulse rounded-lg bg-white/[0.06]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-3 lg:col-span-3">
          <div className="h-5 w-32 animate-pulse rounded-full bg-white/[0.06]" />
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="h-[72px] animate-pulse p-4">
              <div className="h-full w-full animate-pulse rounded-lg bg-white/[0.04]" />
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="h-5 w-32 animate-pulse rounded-full bg-white/[0.06]" />
          <Card className="h-64 animate-pulse bg-white/[0.02]" />
        </div>
      </div>
    </div>
  );
}

function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-4 p-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-rose-400/12 text-rose-300">
        <AlertCircle className="h-6 w-6" />
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          Couldn’t load your dashboard
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          Your resumes are one request away. Check your connection and try
          again.
        </p>
      </div>
      <Button variant="secondary" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="flex flex-col items-center gap-4 p-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/12 text-brand-300">
        <FileText className="h-6 w-6" />
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          No resumes yet
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          Create your first resume and your stats, ATS scores and view counts
          will show up here.
        </p>
      </div>
      <Link href="/dashboard/resumes">
        <Button>
          <Plus className="h-4 w-4" />
          Create a resume
        </Button>
      </Link>
    </Card>
  );
}

function StatCards({ resumes }: { resumes: ResumeListItem[] }) {
  const stats = computeDashboardStats(resumes);

  const cards = [
    {
      label: "Resumes",
      value: String(stats.count),
      hint:
        stats.count === 0
          ? "Nothing created yet"
          : `${stats.published} published · ${stats.drafts} draft${stats.drafts === 1 ? "" : "s"}`,
      icon: FileText,
    },
    {
      label: "Avg ATS score",
      value: stats.scored ? String(stats.avgAtsScore) : "—",
      hint: stats.scored ? `${stats.scored} scored` : "Run an ATS check",
      icon: Target,
    },
    {
      label: "Profile views",
      value: stats.totalViews.toLocaleString(),
      hint: stats.published ? "Across published resumes" : "Publish to get views",
      icon: Eye,
    },
    {
      label: "Avg completion",
      value: stats.count ? `${stats.avgCompletion}%` : "—",
      hint: stats.count ? "Across all resumes" : "Nothing to measure",
      icon: Gauge,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
                {card.label}
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/12 text-brand-300">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 font-display text-3xl font-semibold tracking-tight">
              {card.value}
            </div>
            <div className="mt-1 text-xs text-muted">{card.hint}</div>
          </Card>
        );
      })}
    </div>
  );
}

function RecentResumes({ resumes }: { resumes: ResumeListItem[] }) {
  const recent = sortRecentResumes(resumes).slice(0, 4);

  return (
    <div className="flex flex-col gap-4 lg:col-span-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Recent resumes</h2>
        <Link
          href="/dashboard/resumes"
          className="ring-focus inline-flex items-center gap-1.5 rounded-full text-sm text-muted transition-colors hover:text-white"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {recent.map((resume) => (
          <Link key={resume.id} href={`/dashboard/resumes/${resume.id}`}>
            <Card className="group flex cursor-pointer items-center gap-4 p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-brand-300">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {resume.resumeTitle?.trim() || "Untitled resume"}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                  <span>
                    {resume.template ? templateById[resume.template] : "Classic"}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-muted/50" />
                  <span>
                    {resume.completion != null
                      ? `${resume.completion}% complete`
                      : "Not scored yet"}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {resume.atsScore != null && (
                  <Badge
                    tone={resume.atsScore >= 90 ? "success" : "brand"}
                    className="tabular-nums"
                  >
                    ATS {resume.atsScore}
                  </Badge>
                )}
                {resume.isPublished ? (
                  <Badge tone="success">Live</Badge>
                ) : (
                  <Badge>Draft</Badge>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function RecentActivity({ resumes }: { resumes: ResumeListItem[] }) {
  const activity = deriveRecentActivity(resumes);

  return (
    <div className="flex flex-col gap-4 lg:col-span-2">
      <h2 className="text-lg font-semibold tracking-tight">Recent activity</h2>
      {activity.length === 0 ? (
        <Card className="p-5 text-sm text-muted">
          Your edits will appear here once you’ve touched a resume.
        </Card>
      ) : (
        <Card className="p-5">
          <ol className="relative flex flex-col gap-5 border-l border-white/[0.08] pl-5">
            {activity.map((entry) => (
              <li key={entry.id} className="relative">
                <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-400 ring-4 ring-background" />
                <p className="text-sm leading-relaxed text-foreground/85">
                  {entry.message}
                </p>
                <span className="mt-0.5 block text-xs text-muted">
                  {entry.timestamp}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  );
}

export function DashboardHome() {
  const { user } = useAuth();
  const { data: resumes, isLoading, isError, refetch } = useDashboardResumes();

  if (isLoading) {
    return (
      <Container className="max-w-6xl">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-10"
        >
          <motion.div variants={item}>
            <PageHeader
              eyebrow="Overview"
              title="Welcome back"
              description="Here's what's happening with your resumes today."
            />
          </motion.div>
          <DashboardSkeleton />
        </motion.div>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className="max-w-6xl">
        <DashboardError onRetry={() => refetch()} />
      </Container>
    );
  }

  if (!resumes || resumes.length === 0) {
    return (
      <Container className="max-w-6xl">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-10"
        >
          <motion.div variants={item}>
            <PageHeader
              eyebrow="Overview"
              title={
                <>
                  Welcome back
                  {user ? (
                    <>
                      ,{" "}
                      <span className="text-gradient">{user.username}</span>
                    </>
                  ) : null}
                </>
              }
              description="Here's what's happening with your resumes today."
              actions={
                <Link href="/dashboard/resumes">
                  <Button>
                    <Plus className="h-4 w-4" />
                    New resume
                  </Button>
                </Link>
              }
            />
          </motion.div>
          <motion.div variants={item}>
            <EmptyState />
          </motion.div>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container className="max-w-6xl">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-10"
      >
        <motion.div variants={item}>
          <PageHeader
            eyebrow="Overview"
            title={
              <>
                Welcome back,{" "}
                <span className="text-gradient">{user?.username}</span>
              </>
            }
            description="Here's what's happening with your resumes today."
            actions={
              <Link href="/dashboard/resumes">
                <Button>
                  <Plus className="h-4 w-4" />
                  New resume
                </Button>
              </Link>
            }
          />
        </motion.div>

        <motion.div variants={item}>
          <StatCards resumes={resumes} />
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <motion.div variants={item}>
            <RecentResumes resumes={resumes} />
          </motion.div>
          <motion.div variants={item}>
            <RecentActivity resumes={resumes} />
          </motion.div>
        </div>
      </motion.div>
    </Container>
  );
}
