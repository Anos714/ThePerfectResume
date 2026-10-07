"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Download,
  Eye,
  Loader2,
  Share2,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EditorForm } from "./editor-form";
import { ResumePreviewDocument } from "./preview";
import { AtsPanel } from "./ats-panel";
import { AiPanel } from "./ai-panel";
import { templates } from "@/data/templates";
import { templateById } from "@/data/plans";
import type { ResumeData, TemplateId } from "@/data/types";
import { getErrorMessage } from "@/lib/api";
import {
  buildResumePayload,
  normalizeResumeData,
  normalizeTemplate,
} from "./resume-mappers";
import {
  useResumeAutosave,
  useResumeQuery,
  type SaveStatus,
} from "./use-resume";

type Tab = "preview" | "ats" | "ai";

interface ResumeBuilderProps {
  resumeId: string;
}

export function ResumeBuilder({ resumeId }: ResumeBuilderProps) {
  const query = useResumeQuery(resumeId);

  const [data, setData] = useState<ResumeData | null>(null);
  const [title, setTitle] = useState("Untitled");
  const [template, setTemplate] = useState<TemplateId>("classic");
  const [published, setPublished] = useState(false);
  const [tab, setTab] = useState<Tab>("preview");
  const initializedRef = useRef(false);

  // Seed the editor once the document lands; after that the local state is
  // authoritative while the user edits.
  useEffect(() => {
    if (query.data && !initializedRef.current) {
      setData(normalizeResumeData(query.data));
      setTitle(query.data.resumeTitle ?? "Untitled");
      setTemplate(normalizeTemplate(query.data));
      setPublished(!!query.data.isPublished);
      initializedRef.current = true;
    }
  }, [query.data]);

  const payload = useMemo(
    () =>
      data
        ? buildResumePayload(data, {
            resumeTitle: title,
            template,
            published,
          })
        : null,
    [data, title, template, published],
  );

  const { status, error, isDirty, saveNow } = useResumeAutosave(resumeId, payload);

  // Warn before closing the tab while a write is still outstanding.
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty()) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleTogglePublish = async () => {
    if (!data) return;
    const next = !published;
    setPublished(next);
    // Build the body by hand: setPublished hasn't flushed into the memo yet.
    await saveNow(
      buildResumePayload(data, {
        resumeTitle: title,
        template,
        published: next,
      }),
    );
  };

  if (query.isLoading) {
    return (
      <Container className="max-w-7xl">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Opening your resume…</span>
          </div>
        </div>
      </Container>
    );
  }

  if (query.isError || !data) {
    return (
      <Container className="max-w-7xl">
        <Card className="flex flex-col items-center gap-4 p-12 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-rose-400/12 text-rose-300">
            <AlertCircle className="h-6 w-6" />
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold tracking-tight">
              Couldn’t open this resume
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-muted">
              {getErrorMessage(query.error)}
            </p>
          </div>
          <Link href="/dashboard/resumes">
            <Button>
              <ArrowLeft className="h-4 w-4" />
              Back to resumes
            </Button>
          </Link>
        </Card>
      </Container>
    );
  }

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
          title={title}
          description={
            <span className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{templateById[template]}</Badge>
              {query.data?.updatedAt && (
                <span className="text-muted">
                  Last edited{" "}
                  {new Date(query.data.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
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
                onClick={handleTogglePublish}
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
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
                Editor
              </h2>
              <SaveStatusIndicator
                status={status}
                onRetry={() => payload && saveNow(payload)}
              />
            </div>
            {status === "error" && error && (
              <Card className="flex items-center justify-between gap-3 border-rose-400/25 p-3.5">
                <span className="text-sm text-rose-200">{error}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => payload && saveNow(payload)}
                >
                  Retry
                </Button>
              </Card>
            )}
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
                    <AtsPanel score={query.data?.atsScore ?? 0} />
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

function SaveStatusIndicator({
  status,
  onRetry,
}: {
  status: SaveStatus;
  onRetry: () => void;
}) {
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </span>
    );
  }

  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
        Saved
      </span>
    );
  }

  if (status === "error") {
    return (
      <button
        onClick={onRetry}
        className="ring-focus inline-flex items-center gap-1.5 rounded-full text-xs text-rose-300 transition-colors hover:text-rose-200"
      >
        <AlertCircle className="h-3.5 w-3.5" />
        Couldn’t save — retry
      </button>
    );
  }

  return (
    <span className="text-xs text-muted">Changes save automatically</span>
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
