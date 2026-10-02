"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  Download,
  Eye,
  Share2,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditorForm } from "./editor-form";
import { ResumePreviewDocument } from "./preview";
import { AtsPanel } from "./ats-panel";
import { AiPanel } from "./ai-panel";
import { templates } from "@/data/templates";
import { templateById } from "@/data/plans";
import type { Resume, ResumeData, TemplateId } from "@/data/types";

type Tab = "preview" | "ats" | "ai";

interface ResumeBuilderProps {
  resume: Resume;
}

export function ResumeBuilder({ resume }: ResumeBuilderProps) {
  const [data, setData] = useState<ResumeData>(resume);
  const [template, setTemplate] = useState<TemplateId>(resume.template);
  const [tab, setTab] = useState<Tab>("preview");
  const [published, setPublished] = useState(resume.isPublished);

  const tabs: { key: Tab; label: string; icon: typeof Eye }[] = [
    { key: "preview", label: "Preview", icon: Eye },
    { key: "ats", label: "ATS score", icon: Target },
    { key: "ai", label: "AI copilot", icon: Sparkles },
  ];

  return (
    <Container className="max-w-7xl">
      <div className="flex flex-col gap-8">
        <PageHeader
          eyebrow="Builder"
          title={resume.resumeTitle}
          description={
            <span className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{templateById[resume.template]}</Badge>
              <span className="text-muted">
                Last edited {new Date(resume.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </span>
          }
          actions={
            <div className="flex flex-wrap items-center gap-2.5">
              <Button variant="secondary" size="sm">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={() => setPublished((v) => !v)}
                variant={published ? "secondary" : "primary"}
              >
                {published ? (
                  <>
                    <Check className="h-4 w-4" strokeWidth={3} />
                    Published
                  </>
                ) : (
                  "Publish"
                )}
              </Button>
            </div>
          }
        />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Editor column */}
          <div className="flex w-full flex-col gap-5 lg:w-1/2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
                Editor
              </h2>
              <span className="text-xs text-muted">Changes save instantly</span>
            </div>
            <EditorForm data={data} onChange={setData} />
          </div>

          {/* Side column */}
          <div className="flex w-full flex-col gap-4 lg:sticky lg:top-6 lg:w-1/2">
            <div className="glass-strong inline-flex w-fit items-center gap-1 rounded-full p-1">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className="ring-focus relative inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    color: tab === key ? "#fff" : "var(--color-muted)",
                  }}
                >
                  {tab === key && (
                    <motion.span
                      layoutId="builder-tab"
                      className="absolute inset-0 rounded-full bg-white/[0.08]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="relative h-3.5 w-3.5" />
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-surface/30 p-3 sm:p-4">
              <AnimatePresence mode="wait">
                {tab === "preview" && (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <TemplateSwitcher
                      template={template}
                      onTemplateChange={setTemplate}
                    />
                    <div className="mt-4 max-h-[640px] overflow-y-auto rounded-xl">
                      <ResumePreviewDocument data={data} template={template} />
                    </div>
                  </motion.div>
                )}

                {tab === "ats" && (
                  <motion.div
                    key="ats"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <AtsPanel score={resume.atsScore} />
                  </motion.div>
                )}

                {tab === "ai" && (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <AiPanel />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

function TemplateSwitcher({
  template,
  onTemplateChange,
}: {
  template: TemplateId;
  onTemplateChange: (template: TemplateId) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <Wand2 className="h-3.5 w-3.5 text-brand-300" />
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
          Template
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {templates.map((t) => {
          const active = t.id === template;
          return (
            <button
              key={t.id}
              onClick={() => onTemplateChange(t.id)}
              className="ring-focus inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors"
              style={{
                borderColor: active ? t.accent : "rgba(255,255,255,0.1)",
                color: active ? t.accent : "var(--color-muted)",
                background: active ? `${t.accent}14` : "transparent",
              }}
            >
              {t.name}
              {t.premium && (
                <Sparkles className="h-3 w-3" style={{ color: t.accent }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
