"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  Check,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  buildSuggestContext,
  MIN_SUGGEST_CONTEXT_LENGTH,
  remainingAiSuggestions,
  suggestImprovements,
  type AiSuggestion,
  type AiUsage,
} from "@/lib/ai";
import { ApiError, getErrorMessage } from "@/lib/api";
import type { ResumeData } from "@/data/types";

interface AiPanelProps {
  resumeId: string;
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

// Added lines are separated so an "Added" toggle can lift its own line back out
// again without touching anything the user wrote around it.
const SEGMENT_SEPARATOR = "\n";
// Matches the summary field's character cap in the editor.
const SUMMARY_MAX_LENGTH = 750;

const appendSegment = (summary: string, segment: string): string => {
  const trimmed = summary.trimEnd();
  return trimmed ? `${trimmed}${SEGMENT_SEPARATOR}${segment}` : segment;
};

const removeSegment = (summary: string, segment: string): string => {
  const lines = summary.split(SEGMENT_SEPARATOR);
  const index = lines.lastIndexOf(segment);
  // The user may have edited the line away already — in that case leave the
  // summary exactly as they wrote it and just clear the badge.
  if (index === -1) return summary;
  lines.splice(index, 1);
  return lines.join(SEGMENT_SEPARATOR);
};

export function AiPanel({ resumeId, data, onChange }: AiPanelProps) {
  // Keyed by suggestion id: knowing which line to lift out on un-apply.
  const [applied, setApplied] = useState<Map<string, string>>(new Map());
  const [notice, setNotice] = useState<string | null>(null);

  const context = useMemo(() => buildSuggestContext(data), [data]);
  const hasEnoughContext = context.trim().length >= MIN_SUGGEST_CONTEXT_LENGTH;

  const mutation = useMutation({
    mutationFn: (body: string) => suggestImprovements(resumeId, body),
  });

  const suggestions: AiSuggestion[] = mutation.data?.suggestions ?? [];
  const usage: AiUsage | null = mutation.data?.usage ?? null;

  const handleGenerate = () => {
    if (!hasEnoughContext || mutation.isPending) return;
    // A fresh batch invalidates the previous batch's "added" badges.
    setApplied(new Map());
    setNotice(null);
    mutation.mutate(context);
  };

  const toggleApply = (suggestion: AiSuggestion) => {
    const text = applied.get(suggestion.id);

    if (text !== undefined) {
      onChange({ ...data, summary: removeSegment(data.summary, text) });
      setApplied((prev) => {
        const next = new Map(prev);
        next.delete(suggestion.id);
        return next;
      });
      return;
    }

    const next = appendSegment(data.summary, suggestion.text);
    if (next.length > SUMMARY_MAX_LENGTH) {
      setNotice(
        "Your summary is at the 750-character limit — shorten it to add more.",
      );
      return;
    }

    onChange({ ...data, summary: next });
    setNotice(null);
    setApplied((prev) => new Map(prev).set(suggestion.id, suggestion.text));
  };

  return (
    <div className="flex flex-col gap-5">
      <Card className="relative overflow-hidden border-brand-400/25 bg-gradient-to-b from-brand-500/[0.08] to-transparent p-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/20 text-brand-300">
            <Wand2 className="h-4 w-4" />
          </span>
          <div>
            <div className="text-sm font-semibold">AI Copilot</div>
            <div className="text-xs text-muted">
              Turns what you&apos;ve written into sharp, achievement-focused
              lines for your summary.
            </div>
          </div>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={mutation.isPending || !hasEnoughContext}
          className="mt-4 w-full"
          size="sm"
        >
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {mutation.isPending ? "Generating…" : "Suggest improvements"}
        </Button>
        {hasEnoughContext ? (
          <QuotaLine usage={usage} />
        ) : (
          <p className="mt-3 text-center text-xs text-muted">
            Add a little content to your resume first — the copilot reads what
            you&apos;ve written.
          </p>
        )}
      </Card>

      {notice && (
        <Card className="flex items-start gap-2.5 border-amber-400/25 p-3.5">
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-400/15 text-amber-300">
            <AlertCircle className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs leading-relaxed text-amber-100/90">
            {notice}
          </span>
        </Card>
      )}

      <AnimatePresence mode="popLayout">
        {mutation.isPending && (
          <motion.div
            key="writing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="flex items-center gap-2 p-4">
              <span className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-brand-400"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.18,
                    }}
                  />
                ))}
              </span>
              <span className="text-sm text-muted">Copilot is writing…</span>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!mutation.isPending && mutation.isError && (
        <ErrorCard error={mutation.error} onRetry={handleGenerate} />
      )}

      {!mutation.isPending &&
        !mutation.isError &&
        !mutation.isIdle &&
        suggestions.length === 0 && (
          <Card className="flex flex-col items-center gap-3 p-6 text-center">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05] text-muted">
              <Sparkles className="h-4 w-4" />
            </span>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              No suggestions this time. Add more detail to your resume and try
              again.
            </p>
            <Button variant="secondary" size="sm" onClick={handleGenerate}>
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          </Card>
        )}

      {mutation.isIdle && (
        <Card className="p-5">
          <p className="text-center text-sm leading-relaxed text-muted">
            Hit{" "}
            <span className="font-medium text-foreground/80">
              Suggest improvements
            </span>{" "}
            and the copilot will draft lines from your experience, projects and
            skills.
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {suggestions.map((suggestion, index) => {
          const isApplied = applied.has(suggestion.id);
          return (
            <motion.div
              key={suggestion.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.4 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="brand">{suggestion.label}</Badge>
                  <button
                    onClick={() => toggleApply(suggestion)}
                    aria-label={
                      isApplied ? "Remove from summary" : "Add to summary"
                    }
                    className={`ring-focus inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-medium transition-colors ${
                      isApplied
                        ? "bg-emerald-400/15 text-emerald-300"
                        : "bg-white/[0.06] text-muted hover:text-white"
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="h-3 w-3" strokeWidth={3} /> Added
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" strokeWidth={3} /> Add
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-3 text-[12.5px] leading-relaxed text-foreground/75">
                  “{suggestion.text}”
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function QuotaLine({ usage }: { usage: AiUsage | null }) {
  if (!usage) return null;

  const remaining = remainingAiSuggestions(usage);

  if (remaining === 0) {
    return (
      <p className="mt-3 text-center text-xs text-muted">
        Daily limit reached —{" "}
        <Link
          href="/dashboard/billing"
          className="font-medium text-brand-300 transition-colors hover:text-brand-200"
        >
          upgrade your plan
        </Link>
      </p>
    );
  }

  return (
    <p className="mt-3 text-center text-xs text-muted">
      {remaining} of {usage.limit} daily suggestions left
    </p>
  );
}

function ErrorCard({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  // 429 means the plan's daily quota is spent, not a transient failure.
  const isQuotaExhausted = error instanceof ApiError && error.status === 429;

  return (
    <Card className="flex flex-col gap-3 border-rose-400/25 p-4">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-rose-400/12 text-rose-300">
          <AlertCircle className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="text-sm font-medium text-rose-100">
            Couldn&apos;t generate suggestions
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            {getErrorMessage(error)}
          </p>
        </div>
      </div>
      {isQuotaExhausted ? (
        <Link href="/dashboard/billing">
          <Button variant="secondary" size="sm" className="w-full">
            <Sparkles className="h-4 w-4" />
            Upgrade your plan
          </Button>
        </Link>
      ) : (
        <Button variant="secondary" size="sm" className="w-full" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      )}
    </Card>
  );
}
