"use client";

import { motion } from "motion/react";
import { AlertTriangle, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { atsChecks } from "@/data/ats";

const statusConfig = {
  pass: { icon: Check, color: "#34d399", bg: "bg-emerald-400/15" },
  warn: { icon: AlertTriangle, color: "#f59e0b", bg: "bg-amber-400/15" },
  fail: { icon: X, color: "#fb7185", bg: "bg-rose-400/15" },
} as const;

interface AtsPanelProps {
  score: number;
}

export function AtsPanel({ score }: AtsPanelProps) {
  const passed = atsChecks.filter((c) => c.status === "pass").length;

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex flex-col items-center gap-4 p-6">
        <ScoreRing value={score} size={132} label="ATS score" />
        <p className="text-center text-sm leading-relaxed text-muted">
          {passed} of {atsChecks.length} checks passed. Fix the warnings to push
          your score higher.
        </p>
      </Card>

      <div className="flex flex-col gap-2.5">
        {atsChecks.map((check, index) => {
          const { icon: Icon, color, bg } = statusConfig[check.status];
          return (
            <motion.div
              key={check.id}
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
        })}
      </div>
    </div>
  );
}
