"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SplitView, type SplitViewMode } from "@/components/ui/split-view";
import { useMediaQuery } from "@/hooks/use-media-query";
import { BuilderToolbar } from "./builder-toolbar";
import { EditorPane } from "./editor-pane";
import { PreviewPane } from "./preview-pane";
import { InspectorDrawer, type InspectorTab } from "./inspector-drawer";
import {
  buildResumePayload,
  normalizeResumeData,
  normalizeTemplate,
} from "./resume-mappers";
import {
  useResumeAutosave,
  useResumeQuery,
} from "./use-resume";
import { getErrorMessage } from "@/lib/api";
import { buildShareUrl } from "@/lib/resumes";
import type { ResumeData, TemplateId } from "@/data/types";

interface ResumeBuilderProps {
  resumeId: string;
}

export function ResumeBuilder({ resumeId }: ResumeBuilderProps) {
  const query = useResumeQuery(resumeId);

  const [data, setData] = useState<ResumeData | null>(null);
  const [title, setTitle] = useState("Untitled");
  const [template, setTemplate] = useState<TemplateId>("classic");
  const [published, setPublished] = useState(false);
  const [mode, setMode] = useState<SplitViewMode>("split");
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("ai");
  const initializedRef = useRef(false);

  // The split needs real width; below this breakpoint the two-pane layout
  // collapses to a single pane chosen by the view switch. Derived during
  // render rather than in an effect so the switch never lags a resize behind.
  const canSplit = useMediaQuery("(min-width: 900px)");
  const effectiveMode: SplitViewMode =
    !canSplit && mode === "split" ? "preview" : mode;

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

  const handleShare = async () => {
    if (!published) {
      await handleTogglePublish();
    }
    const shareUrl = buildShareUrl(resumeId, window.location.origin);
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // The clipboard API is unavailable (insecure context or a blocked
      // permission); the share URL still works as a navigated link.
      window.open(shareUrl, "_blank", "noopener");
    }
  };

  if (query.isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm">Opening your resume…</span>
        </div>
      </div>
    );
  }

  if (query.isError || !data) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/[0.07] bg-surface/40 p-12 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-rose-400/12 text-rose-300">
            <AlertCircle className="h-6 w-6" />
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold tracking-tight">
              Couldn&apos;t open this resume
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <BuilderToolbar
        resumeId={resumeId}
        title={title}
        onTitleChange={setTitle}
        status={status}
        mode={effectiveMode}
        onModeChange={setMode}
        inspectorOpen={inspectorOpen}
        onToggleInspector={() => setInspectorOpen((prev) => !prev)}
        published={published}
        onTogglePublish={handleTogglePublish}
        onShare={handleShare}
        shareLabel={published ? "Copy link" : "Publish & share"}
        onRetrySave={() => payload && saveNow(payload)}
      />

      {status === "error" && error && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-rose-400/25 bg-rose-400/[0.07] px-4 py-2.5">
          <span className="flex items-center gap-2 text-xs text-rose-200">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => payload && saveNow(payload)}
          >
            Retry save
          </Button>
        </div>
      )}

      <div className="min-h-0 flex-1">
        <SplitView
          mode={effectiveMode}
          editor={
            <EditorPane
              resumeId={resumeId}
              data={data}
              onChange={setData}
            />
          }
          preview={
            <PreviewPane
              data={data}
              template={template}
              onTemplateChange={setTemplate}
            />
          }
        />
      </div>

      <InspectorDrawer
        open={inspectorOpen}
        tab={inspectorTab}
        onTabChange={setInspectorTab}
        onClose={() => setInspectorOpen(false)}
        resumeId={resumeId}
        data={data}
        onChange={setData}
        atsScore={query.data?.atsScore ?? 0}
      />
    </div>
  );
}
