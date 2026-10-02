"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquareText, Plus, Sparkles, Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { interviewQuestions } from "@/data/interview";
import type { InterviewQuestion } from "@/data/interview";

type Category = InterviewQuestion["category"] | "all";

const categories: { key: Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "behavioral", label: "Behavioral" },
  { key: "technical", label: "Technical" },
  { key: "role-specific", label: "Role-specific" },
];

const difficultyTone = {
  easy: "success",
  medium: "warn",
  hard: "danger",
} as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function InterviewPrep() {
  const [category, setCategory] = useState<Category>("all");
  const [starred, setStarred] = useState<Set<string>>(
    () => new Set(interviewQuestions.filter((q) => q.starred).map((q) => q.id)),
  );

  const filtered = useMemo(
    () =>
      category === "all"
        ? interviewQuestions
        : interviewQuestions.filter((q) => q.category === category),
    [category],
  );

  const toggleStar = (id: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Container className="max-w-4xl">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-10"
      >
        <motion.div variants={item}>
          <PageHeader
            eyebrow="Career tools"
            title="Interview prep"
            description="Practice the questions recruiters actually ask, tailored to your target role."
            actions={
              <Button variant="secondary">
                <Sparkles className="h-4 w-4" />
                Generate set
              </Button>
            }
          />
        </motion.div>

        <motion.div variants={item} className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = cat.key === category;
            return (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className="ring-focus relative inline-flex items-center rounded-full border border-white/[0.08] px-4 py-1.5 text-xs font-medium transition-colors"
                style={{
                  color: active ? "#fff" : "var(--color-muted)",
                  borderColor: active
                    ? "rgba(129,140,248,0.4)"
                    : "rgba(255,255,255,0.08)",
                  background: active ? "rgba(99,102,241,0.12)" : "transparent",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        <motion.div variants={item} className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((question) => {
              const isStarred = starred.has(question.id);
              return (
                <motion.div
                  key={question.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Card className="group flex items-start gap-4 p-5">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-brand-300">
                      <MessageSquareText className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {question.question}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <Badge>{question.category}</Badge>
                        <Badge tone={difficultyTone[question.difficulty]}>
                          {question.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleStar(question.id)}
                      aria-label={isStarred ? "Unstar question" : "Star question"}
                      className="ring-focus grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors hover:bg-white/5"
                    >
                      <Star
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isStarred
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted",
                        )}
                      />
                    </button>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={item}>
          <button
            type="button"
            className="ring-focus group flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/[0.12] py-5 text-sm font-medium text-muted transition-colors hover:border-brand-400/40 hover:text-white"
          >
            <Plus className="h-4 w-4" />
            Add your own question
          </button>
        </motion.div>
      </motion.div>
    </Container>
  );
}
