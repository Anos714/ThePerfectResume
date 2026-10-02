"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Eye,
  FileText,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockResumes } from "@/data/resumes";
import { recentActivity } from "@/data/activity";
import { mockUser } from "@/data/user";
import { templateById } from "@/data/plans";

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

export function DashboardHome() {
  const totalViews = mockResumes.reduce((sum, r) => sum + r.views, 0);
  const avgAts = Math.round(
    mockResumes.reduce((sum, r) => sum + r.atsScore, 0) / mockResumes.length,
  );
  const published = mockResumes.filter((r) => r.isPublished).length;

  const stats = [
    {
      label: "Resumes",
      value: String(mockResumes.length),
      hint: `${published} published`,
      icon: FileText,
    },
    {
      label: "Avg ATS score",
      value: String(avgAts),
      hint: "+4 this week",
      icon: Target,
    },
    {
      label: "Profile views",
      value: totalViews.toLocaleString(),
      hint: "+12% MoM",
      icon: Eye,
    },
    {
      label: "AI suggestions",
      value: mockUser.plan === "free" ? `${Math.max(0, mockUser.aiSuggestionsPerDay - mockUser.aiSuggestionsUsedToday)} left` : "Unlimited",
      hint: mockUser.plan === "free" ? "Resets daily" : `${mockUser.aiSuggestionsUsedToday} used today`,
      icon: Sparkles,
    },
  ];

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
                <span className="text-gradient">
                  {mockUser.fullName.split(" ")[0]}
                </span>
              </>
            }
            description="Here's what's happening with your resumes today."
            actions={
              <Button>
                <Plus className="h-4 w-4" />
                New resume
              </Button>
            }
          />
        </motion.div>

        <motion.div
          variants={item}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
                    {stat.label}
                  </span>
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/12 text-brand-300">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 font-display text-3xl font-semibold tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-muted">{stat.hint}</div>
              </Card>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <motion.div
            variants={item}
            className="flex flex-col gap-4 lg:col-span-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                Recent resumes
              </h2>
              <Link
                href="/dashboard/resumes"
                className="ring-focus inline-flex items-center gap-1.5 rounded-full text-sm text-muted transition-colors hover:text-white"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {mockResumes.map((resume) => (
                <Link key={resume.id} href={`/dashboard/resumes/${resume.id}`}>
                  <Card className="group flex cursor-pointer items-center gap-4 p-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-brand-300">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {resume.resumeTitle}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                        <span>{templateById[resume.template]}</span>
                        <span className="h-1 w-1 rounded-full bg-muted/50" />
                        <span>{resume.completion}% complete</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge
                        tone={resume.atsScore >= 90 ? "success" : "brand"}
                        className="tabular-nums"
                      >
                        ATS {resume.atsScore}
                      </Badge>
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
          </motion.div>

          <motion.div variants={item} className="flex flex-col gap-4 lg:col-span-2">
            <h2 className="text-lg font-semibold tracking-tight">
              Recent activity
            </h2>
            <Card className="p-5">
              <ol className="relative flex flex-col gap-5 border-l border-white/[0.08] pl-5">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="relative">
                    <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-400 ring-4 ring-background" />
                    <p className="text-sm leading-relaxed text-foreground/85">
                      {activity.message}
                    </p>
                    <span className="mt-0.5 block text-xs text-muted">
                      {activity.timestamp}
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Container>
  );
}
