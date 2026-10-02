"use client";

import { motion } from "motion/react";
import { MoreHorizontal, PenLine, Plus, Sparkles, Trash2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { coverLetters } from "@/data/cover-letters";

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

const toneTone = {
  professional: "brand",
  friendly: "success",
  confident: "warn",
} as const;

export function CoverLetters() {
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
              <Button>
                <Plus className="h-4 w-4" />
                New letter
              </Button>
            }
          />
        </motion.div>

        <motion.div
          variants={item}
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          {coverLetters.map((letter) => (
            <Card key={letter.id} className="group flex flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/[0.05] text-brand-300">
                    <PenLine className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="text-sm font-medium">{letter.title}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" aria-label="More options" type="button">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" aria-label="Delete letter" type="button">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted">
                {letter.excerpt}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted">
                <Badge tone={toneTone[letter.tone]}>{letter.tone}</Badge>
                {letter.status === "final" ? (
                  <Badge tone="success">Final</Badge>
                ) : (
                  <Badge>Draft</Badge>
                )}
                <span className="h-1 w-1 rounded-full bg-muted/50" />
                <span>
                  Updated{" "}
                  {new Date(letter.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </Card>
          ))}

          <button
            type="button"
            className="ring-focus group flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/[0.12] text-muted transition-colors hover:border-brand-400/40 hover:text-white"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.04] transition-colors group-hover:bg-brand-500/15">
              <Sparkles className="h-5 w-5 text-brand-300" />
            </span>
            <span className="text-sm font-medium">
              Generate a cover letter from your resume
            </span>
            <span className="text-xs">Paste a job description and pick a tone</span>
          </button>
        </motion.div>
      </motion.div>
    </Container>
  );
}
