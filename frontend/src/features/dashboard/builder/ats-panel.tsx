"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Gauge,
  Loader2,
  RefreshCw,
  Target,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ui/score-ring";
import {
  remainingAiSuggestions,
  scoreAts,
  buildAtsContext,
  MIN_ATS_CONTENT_LENGTH,
  type AtsCheck,
  type AtsScoreResult,
  type AiUsage,
} from "@/lib/ai";
import { ApiError, getErrorMessage } from "@/lib/api";
import {
  RESUMES_QUERY_KEY,
  resumeQueryKey,
  updateResumeAtsScore,
  type ResumeListItem,
} from "@/lib/resumes";
import type { ResumeData } from "@/data/types";

const statusConfig = {
  pass: { icon: Check, color: "#34d399", bg: "bg-emerald-400/15" },
  warn: { icon: AlertTriangle, color: "#f59e0b", bg: "bg-amber-400/15" },
  fail: { icon: X, color: "#fb7185", bg: "bg-rose-400/15" },
} as const;

interface AtsPanelProps {
  resumeId: string;
  data: ResumeData;
  // The score most recently stored on the row (`GET /resumes/:id`). Used until
  // the user runs a fresh check, since the backend stores the number but not
  // the per-check breakdown.
  storedScore: number;
}

export function AtsPanel({ resumeId, data, storedScore }: AtsPanelProps) {
  const queryClient = useQueryClient();

  const content = useMemo(() => buildAtsContext(data), [data]);
  const hasEnoughContent = content.trim().length >= MIN_ATS_CONTENT_LENGTH;

  const mutation = useMutation({
    mutationFn: async (body: string): Promise<AtsScoreResult> => {
      const result = await scoreAts(resumeId, body);
      // Persisting is best-effort: the user still gets the freshly computed
      // score and checks even if the analytics write fails.
      try {
        const saved = await updateResumeAtsScore(resumeId, result.score);
        queryClient.setQueryData<ResumeListItem>(
          resumeQueryKey(resumeId),
          saved,
        );
        queryClient.invalidateQueries({ queryKey: RESUMES_QUERY_KEY });
      } catch {
        // Ignored on purpose — the panel below still renders the result.
      }
      return result;
    },
  });

  const result = mutation.data;
  const checks: AtsCheck[] = result?.checks ?? [];
  const usage: AiUsage | null = result?.usage ?? null;
  const hasStoredScore = storedScore > 0;
  const score = result?.score ?? (hasStoredScore ? storedScore : 0);
  const isIdle = mutation.isIdle;

  const handleRun = () => {
    if (!hasEnoughContent || mutation.isPending) return;
    mutation.mutate(content);
  };

  const passed = checks.filter((check) => check.status === "pass").length;

  return (
    <div className="flex flex-col gap-5">
      <Card className="relative overflow-hidden border-brand-400/25 bg-gradient-to-b from-brand-500/[0.08] to-transparent p-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/20 text-brand-300">
            <Target className="h-4 w-4" />
          </span>
          <div>
            <div className="text-sm font-semibold">ATS Scanner</div>
            <div className="text-xs text-muted">
              Grades your resume against applicant-tracking best practices and
              flags what to fix.
            </div>
          </div>
        </div>
        <Button
          onClick={handleRun}
          disabled={mutation.isPending || !hasEnoughContent}
          className="mt-4 w-full"
          size="sm"
        >
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Gauge className="h-4 w-4" />
          )}
          {mutation.isPending
            ? "Scanning..."
            : result
              ? "Re-run ATS check"
              : "Run ATS check"}
        </Button>
        {hasEnoughContent ? (
          <QuotaLine usage={usage} />
        ) : (
          <p className="mt-3 text-center text-xs text-muted">
            Add more content to your resume first — the scanner reads the whole
            document.
          </p>
        )}
      </Card>

      {mutation.isPending && (
        <Card className="flex items-center gap-2 p-4">
          <span className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-brand-400"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
              />
            ))}
          </span>
          <span className="text-sm text-muted">Analyzing your resume...</span>
        </Card>
      )}

      {!mutation.isPending && mutation.isError && (
        <ErrorCard error={mutation.error} onRetry={handleRun} />
      )}

      {!mutation.isPending &&
        !mutation.isError &&
        !isIdle &&
        checks.length === 0 && (
          <Card className="flex flex-col items-center gap-3 p-6 text-center">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05] text-muted">
              <Target className="h-4 w-4" />
            </span>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              No checks came back this time. Add more detail to your resume and
              try again.
            </p>
            <Button variant="secondary" size="sm" onClick={handleRun}>
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          </Card>
        )}

      {checks.length > 0 && (
        <>
          <Card className="flex flex-col items-center gap-4 p-6">
            <ScoreRing value={score} size={132} label="ATS score" />
            <p className="text-center text-sm leading-relaxed text-muted">
              {passed} of {checks.length} checks passed. Fix the warnings to
              push your score higher.
            </p>
          </Card>

          <div className="flex flex-col gap-2.5">
            {checks.map((check, index) => (
              <CheckRow key={check.id} check={check} index={index} />
            ))}
          </div>
        </>
      )}

      {isIdle && checks.length === 0 && (
        <Card className="flex flex-col items-center gap-4 p-6 text-center">
          {hasStoredScore && (
            <ScoreRing value={storedScore} size={132} label="ATS score" />
          )}
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            {hasStoredScore
              ? "This is your last saved score. Run a fresh check to see the full breakdown."
              : "Run a check and the scanner will grade your contact info, headings, keywords, bullets and formatting."}
          </p>
        </Card>
      )}
    </div>
  );
}

function CheckRow({ check, index }: { check: AtsCheck; index: number }) {
  const { icon: Icon, color, bg } = statusConfig[check.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
    >
      <Card className="flex items-start gap-3 p-4">
        <span
          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${bg}`}
          style={{ color }}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
        <div className="min-w-0">
          <div className="text-sm font-medium">{check.label}</div>
          <div className="mt-0.5 text-xs leading-relaxed text-muted">
            {check.detail}
          </div>
        </div>
      </Card>
    </motion.div>
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
      {remaining} of {usage.limit} daily AI actions left
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
            Couldn&apos;t score your resume
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            {getErrorMessage(error)}
          </p>
        </div>
      </div>
      {isQuotaExhausted ? (
        <Link href="/dashboard/billing">
          <Button variant="secondary" size="sm" className="w-full">
            <Target className="h-4 w-4" />
            Upgrade your plan
          </Button>
        </Link>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={onRetry}
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      )}
    </Card>
  );
}