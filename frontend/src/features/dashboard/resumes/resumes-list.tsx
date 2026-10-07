"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { AlertCircle, Eye, FileText, Pencil, Plus, RefreshCw, Share2, Trash2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { templateById } from "@/data/plans";
import { getErrorMessage } from "@/lib/api";
import { sortRecentResumes, type ResumeListItem } from "@/lib/resumes";
import { useResumesQuery } from "./use-resumes";
import {
  CreateResumeDialog,
  DeleteResumeDialog,
  EditResumeDialog,
  ShareResumeDialog,
} from "./resume-dialogs";

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

type DialogState =
  | { kind: "none" }
  | { kind: "create" }
  | { kind: "edit"; resume: ResumeListItem }
  | { kind: "share"; resume: ResumeListItem }
  | { kind: "delete"; resume: ResumeListItem };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ResumesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-white/[0.05]" />
              <div className="flex w-full flex-col gap-2">
                <div className="h-4 w-1/3 animate-pulse rounded-full bg-white/[0.06]" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/[0.04]" />
              </div>
            </div>
            <div className="h-6 w-24 animate-pulse rounded-full bg-white/[0.05]" />
          </div>
          <div className="mt-4 h-1.5 w-full animate-pulse rounded-full bg-white/[0.05]" />
        </Card>
      ))}
    </div>
  );
}

function ResumeCard({
  resume,
  onEdit,
  onShare,
  onDelete,
}: {
  resume: ResumeListItem;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
}) {
  const completion = resume.completion ?? null;

  return (
    <Card className="group p-5">
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
              {resume.resumeTitle?.trim() || "Untitled resume"}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
              <Badge tone="brand">
                {resume.template ? templateById[resume.template] : "Classic"}
              </Badge>
              {resume.updatedAt && <span>Updated {formatDate(resume.updatedAt)}</span>}
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3 w-3" /> {resume.views ?? 0}
              </span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2.5">
          {resume.atsScore != null && (
            <Badge
              tone={resume.atsScore >= 90 ? "success" : "warn"}
              className="tabular-nums"
            >
              ATS {resume.atsScore}
            </Badge>
          )}
          {resume.isPublished ? (
            <Badge tone="success">Published</Badge>
          ) : (
            <Badge>Draft</Badge>
          )}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Edit resume"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={
                resume.isPublished ? "Manage share link" : "Share resume"
              }
              onClick={onShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Delete resume"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {completion != null && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Completeness</span>
            <span className="tabular-nums">{completion}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
              initial={{ width: 0 }}
              whileInView={{ width: `${completion}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
    </Card>
  );
}

export function ResumesList() {
  const { data: resumes, isLoading, isError, error, refetch } = useResumesQuery();
  const [dialog, setDialog] = useState<DialogState>({ kind: "none" });

  const close = () => setDialog({ kind: "none" });

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
              <Button onClick={() => setDialog({ kind: "create" })}>
                <Plus className="h-4 w-4" />
                New resume
              </Button>
            }
          />
        </motion.div>

        {isLoading ? (
          <ResumesSkeleton />
        ) : isError ? (
          <Card className="flex flex-col items-center gap-4 p-12 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-rose-400/12 text-rose-300">
              <AlertCircle className="h-6 w-6" />
            </span>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold tracking-tight">
                Couldn’t load your resumes
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-muted">
                {getErrorMessage(error)}
              </p>
            </div>
            <Button variant="secondary" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </Card>
        ) : !resumes || resumes.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 p-12 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/12 text-brand-300">
              <FileText className="h-6 w-6" />
            </span>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold tracking-tight">
                No resumes yet
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-muted">
                Create your first resume and it will show up here, ready to edit
                and share.
              </p>
            </div>
            <Button onClick={() => setDialog({ kind: "create" })}>
              <Plus className="h-4 w-4" />
              Create a resume
            </Button>
          </Card>
        ) : (
          <motion.div variants={item} className="grid grid-cols-1 gap-4">
            {sortRecentResumes(resumes).map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onEdit={() => setDialog({ kind: "edit", resume })}
                onShare={() => setDialog({ kind: "share", resume })}
                onDelete={() => setDialog({ kind: "delete", resume })}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      <CreateResumeDialog open={dialog.kind === "create"} onClose={close} />

      {dialog.kind === "edit" && (
        <EditResumeDialog
          key={dialog.resume.id}
          resume={dialog.resume}
          open
          onClose={close}
        />
      )}

      {dialog.kind === "share" && (
        <ShareResumeDialog
          key={dialog.resume.id}
          resume={dialog.resume}
          open
          onClose={close}
        />
      )}

      {dialog.kind === "delete" && (
        <DeleteResumeDialog
          key={dialog.resume.id}
          resume={dialog.resume}
          open
          onClose={close}
        />
      )}
    </Container>
  );
}
