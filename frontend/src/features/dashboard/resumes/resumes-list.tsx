"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Eye, FileText, MoreHorizontal, Pencil, Plus, Share2, Trash2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockResumes } from "@/data/resumes";
import { templateById } from "@/data/plans";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function ResumesList() {
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
            eyebrow="Resumes"
            title="Your resumes"
            description="Create, edit and share tailored resumes for every role you chase."
            actions={
              <Button>
                <Plus className="h-4 w-4" />
                New resume
              </Button>
            }
          />
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 gap-4">
          {mockResumes.map((resume) => (
            <Card key={resume.id} className="group p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href={`/dashboard/resumes/${resume.id}`}
                  className="flex min-w-0 flex-1 items-center gap-4"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-brand-300 transition-colors group-hover:border-brand-400/30">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-medium">
                      {resume.resumeTitle}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <Badge tone="brand">{templateById[resume.template]}</Badge>
                      <span>Updated {formatDate(resume.updatedAt)}</span>
                      <span className="h-1 w-1 rounded-full bg-muted/50" />
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {resume.views}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2.5">
                  <Badge
                    tone={resume.atsScore >= 90 ? "success" : "warn"}
                    className="tabular-nums"
                  >
                    ATS {resume.atsScore}
                  </Badge>
                  {resume.isPublished ? (
                    <Badge tone="success">Published</Badge>
                  ) : (
                    <Badge>Draft</Badge>
                  )}
                  <RowActions resumeId={resume.id} isPublic={resume.isPublic} />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>Completeness</span>
                  <span className="tabular-nums">{resume.completion}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${resume.completion}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      </motion.div>
    </Container>
  );
}

function RowActions({
  resumeId,
  isPublic,
}: {
  resumeId: string;
  isPublic: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <Link href={`/dashboard/resumes/${resumeId}`}>
        <Button variant="ghost" size="sm" aria-label="Edit resume">
          <Pencil className="h-4 w-4" />
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        aria-label={isPublic ? "Copy share link" : "Share resume"}
      >
        <Share2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" aria-label="Delete resume">
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" aria-label="More options">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
