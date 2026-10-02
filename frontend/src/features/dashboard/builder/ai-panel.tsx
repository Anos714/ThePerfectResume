"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Plus, Sparkles, Wand2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { aiSuggestions } from "@/data/ats";
import { mockUser } from "@/data/user";

export function AiPanel() {
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
    }, 1600);
  };

  const toggleApply = (id: string) => {
    setApplied((prev) => {
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
    <div className="flex flex-col gap-5">
      <Card className="relative overflow-hidden border-brand-400/25 bg-gradient-to-b from-brand-500/[0.08] to-transparent p-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/20 text-brand-300">
            <Wand2 className="h-4 w-4" />
          </span>
          <div>
            <div className="text-sm font-semibold">AI Copilot</div>
            <div className="text-xs text-muted">
              Turn rough notes into sharp, achievement-focused bullets.
            </div>
          </div>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-4 w-full"
          size="sm"
        >
          <Sparkles className="h-4 w-4" />
          {generating ? "Generating…" : "Suggest improvements"}
        </Button>
        {mockUser.plan === "free" && (
          <p className="mt-3 text-center text-xs text-muted">
            {Math.max(
              0,
              mockUser.aiSuggestionsPerDay - mockUser.aiSuggestionsUsedToday,
            )}{" "}
            of {mockUser.aiSuggestionsPerDay} daily suggestions left
          </p>
        )}
      </Card>

      <AnimatePresence mode="popLayout">
        {generating && (
          <motion.div
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

      <div className="flex flex-col gap-3">
        {aiSuggestions.map((suggestion, index) => {
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
                    onClick={() => toggleApply(suggestion.id)}
                    aria-label={isApplied ? "Remove suggestion" : "Apply suggestion"}
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
