"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Target, X } from "lucide-react";
import { AiPanel } from "./ai-panel";
import { AtsPanel } from "./ats-panel";
import type { ResumeData } from "@/data/types";

export type InspectorTab = "ai" | "ats";

interface InspectorDrawerProps {
  open: boolean;
  tab: InspectorTab;
  onTabChange: (tab: InspectorTab) => void;
  onClose: () => void;
  resumeId: string;
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  atsScore: number;
}

const tabs: { key: InspectorTab; label: string; icon: typeof Sparkles }[] = [
  { key: "ai", label: "AI Copilot", icon: Sparkles },
  { key: "ats", label: "ATS Score", icon: Target },
];

/**
 * The AI + ATS panels lifted out of the old tab column into a slide-over.
 *
 * Invoicely's split keeps the editing surface uncluttered; the assistant is
 * summoned when wanted and dismissed otherwise, so it never competes with the
 * document for width. On narrow screens it covers the full canvas; on desktop
 * it parks at 400px and the preview reflows behind it.
 */
export function InspectorDrawer({
  open,
  tab,
  onTabChange,
  onClose,
  resumeId,
  data,
  onChange,
  atsScore,
}: InspectorDrawerProps) {
  // Escape closes; the body stays fixed behind the drawer.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col border-l border-white/[0.08] bg-surface shadow-2xl sm:w-[400px]"
            role="dialog"
            aria-modal="true"
            aria-label="AI copilot and ATS score"
          >
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
              <div className="glass-strong inline-flex items-center gap-1 rounded-full p-1">
                {tabs.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => onTabChange(key)}
                    aria-pressed={tab === key}
                    className="ring-focus relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{ color: tab === key ? "#fff" : "var(--color-muted)" }}
                  >
                    {tab === key && (
                      <motion.span
                        layoutId="inspector-tab"
                        className="absolute inset-0 rounded-full bg-white/[0.08]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className="relative h-3.5 w-3.5" />
                    <span className="relative">{label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={onClose}
                aria-label="Close panel"
                className="ring-focus grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
              {tab === "ai" ? (
                <AiPanel
                  resumeId={resumeId}
                  data={data}
                  onChange={onChange}
                />
              ) : (
                <AtsPanel score={atsScore} />
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
