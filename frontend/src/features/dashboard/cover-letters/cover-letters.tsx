"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  Eye,
  PenLine,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api";
import {
  coverLetterExcerpt,
  sortRecentCoverLetters,
  type CoverLetterItem,
  type CoverLetterTone,
} from "@/lib/cover-letters";
import { useCoverLettersQuery } from "./use-cover-letters";
import {
  DeleteCoverLetterDialog,
  EditCoverLetterDialog,
  GenerateCoverLetterDialog,
  PreviewCoverLetterDialog,
} from "./cover-letter-dialogs";

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

const toneTone: Record<CoverLetterTone, "brand" | "success" | "warn"> = {
  professional: "brand",
  friendly: "success",
  confident: "warn",
};

type DialogState =
  | { kind: "none" }
  | { kind: "generate" }
  | { kind: "preview"; letter: CoverLetterItem }
  | { kind: "edit"; letter: CoverLetterItem }
  | { kind: "delete"; letter: CoverLetterItem };

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "recently";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function CoverLettersSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={index} className="flex flex-col p-6">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-white/[0.05]" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/[0.06]" />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <div className="h-3 w-full animate-pulse rounded-full bg-white/[0.04]" />
            <div className="h-3 w-5/6 animate-pulse rounded-full bg-white/[0.04]" />
            <div className="h-3 w-3/4 animate-pulse rounded-full bg-white/[0.04]" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function CoverLetterCard({
  letter,
  onPreview,
  onEdit,
  onDelete,
}: {
  letter: CoverLetterItem;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const excerpt = coverLetterExcerpt(letter.content);
  const tone = letter.tone ?? "professional";

  return (
    <Card className="group flex flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={onPreview}
          className="ring-focus flex min-w-0 items-center gap-2.5 text-left"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-brand-300">
            <PenLine className="h-4.5 w-4.5" />
          </span>
          <h3 className="truncate text-sm font-medium">
            {letter.title?.trim() || "Untitled letter"}
          </h3>
        </button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Preview letter"
            type="button"
            onClick={onPreview}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Edit letter"
            type="button"
            onClick={onEdit}
          >
            <PenLine className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Delete letter"
            type="button"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted">
        {excerpt || "No content yet — edit to start writing."}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted">
        <Badge tone={toneTone[tone]}>{tone}</Badge>
        {letter.status === "final" ? (
          <Badge tone="success">Final</Badge>
        ) : (
          <Badge>Draft</Badge>
        )}
        <span className="h-1 w-1 rounded-full bg-muted/50" />
        <span>Updated {formatDate(letter.updatedAt)}</span>
      </div>
    </Card>
  );
}

export function CoverLetters() {
  const {
    data: letters,
    isLoading,
    isError,
    error,
    refetch,
  } = useCoverLettersQuery();
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
            eyebrow="Career tools"
            title="Cover letters"
            description="Tailor a letter for every application — generated from your resume in seconds."
            actions={
              <Button onClick={() => setDialog({ kind: "generate" })}>
                <Plus className="h-4 w-4" />
                New letter
              </Button>
            }
          />
        </motion.div>

        {isLoading ? (
          <CoverLettersSkeleton />
        ) : isError ? (
          <Card className="flex flex-col items-center gap-4 p-12 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-rose-400/12 text-rose-300">
              <AlertCircle className="h-6 w-6" />
            </span>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold tracking-tight">
                Couldn&apos;t load your cover letters
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
        ) : (
          <motion.div
            variants={item}
            className="grid grid-cols-1 gap-4 lg:grid-cols-2"
          >
            {sortRecentCoverLetters(letters ?? []).map((letter) => (
              <CoverLetterCard
                key={letter.id}
                letter={letter}
                onPreview={() => setDialog({ kind: "preview", letter })}
                onEdit={() => setDialog({ kind: "edit", letter })}
                onDelete={() => setDialog({ kind: "delete", letter })}
              />
            ))}

            <button
              type="button"
              onClick={() => setDialog({ kind: "generate" })}
              className="ring-focus group flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/[0.12] text-muted transition-colors hover:border-brand-400/40 hover:text-white"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.04] transition-colors group-hover:bg-brand-500/15">
                <Sparkles className="h-5 w-5 text-brand-300" />
              </span>
              <span className="text-sm font-medium">
                {letters && letters.length > 0
                  ? "Generate another cover letter"
                  : "Generate your first cover letter"}
              </span>
              <span className="text-xs">
                Paste a job description and pick a tone
              </span>
            </button>
          </motion.div>
        )}
      </motion.div>

      <GenerateCoverLetterDialog
        open={dialog.kind === "generate"}
        onClose={close}
      />

      {dialog.kind === "preview" && (
        <PreviewCoverLetterDialog
          key={dialog.letter.id}
          letter={dialog.letter}
          open
          onClose={close}
          onEdit={() => setDialog({ kind: "edit", letter: dialog.letter })}
        />
      )}

      {dialog.kind === "edit" && (
        <EditCoverLetterDialog
          key={dialog.letter.id}
          letter={dialog.letter}
          open
          onClose={close}
        />
      )}

      {dialog.kind === "delete" && (
        <DeleteCoverLetterDialog
          key={dialog.letter.id}
          letter={dialog.letter}
          open
          onClose={close}
        />
      )}
    </Container>
  );
}