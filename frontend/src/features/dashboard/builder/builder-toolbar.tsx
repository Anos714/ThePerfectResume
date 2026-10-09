"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Columns2,
  Download,
  FileText,
  Eye,
  Loader2,
  PencilLine,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropdown, type DropdownItem } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import {
  downloadResumeExport,
  saveBlobAsDownload,
  type ExportFormat,
} from "@/lib/exports";
import { getErrorMessage } from "@/lib/api";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { SplitViewMode } from "@/components/ui/split-view";
import type { SaveStatus } from "./use-resume";

const VIEW_LABELS: Record<SplitViewMode, string> = {
  editor: "Form",
  preview: "Preview",
  split: "Both",
};

const VIEW_ICONS: Record<SplitViewMode, typeof FileText> = {
  editor: PencilLine,
  preview: Eye,
  split: Columns2,
};

interface BuilderToolbarProps {
  resumeId: string;
  title: string;
  onTitleChange: (title: string) => void;
  status: SaveStatus;
  mode: SplitViewMode;
  onModeChange: (mode: SplitViewMode) => void;
  inspectorOpen: boolean;
  onToggleInspector: () => void;
  published: boolean;
  onTogglePublish: () => void;
  onShare: () => void;
  shareLabel: string;
  onRetrySave: () => void;
}

/**
 * The single slim toolbar above the split, in invoicely's shape: document
 * identity and view switching on the left, actions on the right.
 *
 * The Form / Preview / Both switch is a dropdown on narrow screens and a
 * segmented control once there is room for it — the dropdown's `Both` item is
 * hidden below that breakpoint because two panes side by side need real width.
 */
export function BuilderToolbar({
  resumeId,
  title,
  onTitleChange,
  status,
  mode,
  onModeChange,
  inspectorOpen,
  onToggleInspector,
  published,
  onTogglePublish,
  onShare,
  shareLabel,
  onRetrySave,
}: BuilderToolbarProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const canSplit = useMediaQuery("(min-width: 900px)");

  const handleExport = async (format: ExportFormat) => {
    if (exporting) return;
    setExportError(null);
    setExporting(format);
    try {
      const { blob, fileName } = await downloadResumeExport(
        resumeId,
        format,
        title,
      );
      saveBlobAsDownload(blob, fileName);
    } catch (error) {
      setExportError(getErrorMessage(error));
    } finally {
      setExporting(null);
    }
  };

  const viewItems: DropdownItem[] = [
    {
      id: "editor",
      label: "Form",
      icon: PencilLine,
      selected: mode === "editor",
      onSelect: () => onModeChange("editor"),
    },
    {
      id: "preview",
      label: "Preview",
      icon: Eye,
      selected: mode === "preview",
      onSelect: () => onModeChange("preview"),
    },
    // Two panes need real width; below the split breakpoint the option is not
    // offered and the mode falls back to a single pane.
    ...(canSplit
      ? [
          {
            id: "split",
            label: "Both",
            icon: Columns2,
            selected: mode === "split",
            onSelect: () => onModeChange("split"),
          } satisfies DropdownItem,
        ]
      : []),
  ];

  const exportItems: DropdownItem[] = [
    {
      id: "pdf",
      label: "Download PDF",
      icon: FileText,
      hint: exporting === "pdf" ? "Rendering…" : undefined,
      disabled: exporting !== null,
      onSelect: () => handleExport("pdf"),
    },
    {
      id: "docx",
      label: "Download DOCX",
      icon: FileText,
      hint: exporting === "docx" ? "Rendering…" : undefined,
      disabled: exporting !== null,
      onSelect: () => handleExport("docx"),
    },
  ];

  const CurrentViewIcon = VIEW_ICONS[mode];

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] bg-surface/60 px-3 py-2.5 backdrop-blur-xl sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Link
          href="/dashboard/resumes"
          aria-label="Back to resumes"
          className="ring-focus grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>

        <TitleField title={title} onTitleChange={onTitleChange} />

        <SaveStatus status={status} onRetry={onRetrySave} />
      </div>

      <div className="flex items-center gap-2">
        {exportError && (
          <span
            className="hidden items-center gap-1.5 text-xs text-rose-300 sm:inline-flex"
            role="alert"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Export failed
          </span>
        )}

        {/* View switch: segmented control where there is room, dropdown otherwise */}
        {canSplit ? (
          <div className="glass-strong hidden items-center gap-0.5 rounded-lg p-0.5 sm:flex">
            {(["editor", "split", "preview"] as SplitViewMode[]).map((value) => {
              const Icon = VIEW_ICONS[value];
              const active = mode === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onModeChange(value)}
                  aria-pressed={active}
                  className={cn(
                    "ring-focus relative inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors",
                    active ? "text-white" : "text-muted hover:text-white",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="view-switch"
                      className="absolute inset-0 rounded-md bg-white/[0.08]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="relative h-3.5 w-3.5" />
                  <span className="relative">{VIEW_LABELS[value]}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        <Dropdown
          ariaLabel="Change view"
          trigger={
            <span className="inline-flex items-center gap-1.5">
              <CurrentViewIcon className="h-3.5 w-3.5" />
              <span>{VIEW_LABELS[mode]}</span>
            </span>
          }
          items={viewItems}
        />

        <button
          type="button"
          onClick={onToggleInspector}
          aria-pressed={inspectorOpen}
          className={cn(
            "ring-focus inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors",
            inspectorOpen
              ? "border-brand-400/40 bg-brand-500/15 text-brand-200"
              : "border-white/[0.08] bg-white/[0.03] text-foreground hover:border-white/[0.16] hover:bg-white/[0.06]",
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Copilot</span>
        </button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onShare}
          className="shrink-0"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">{shareLabel}</span>
        </Button>

        <Dropdown
          ariaLabel="Export resume"
          trigger={
            <span className="inline-flex items-center gap-1.5">
              {exporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">Export</span>
            </span>
          }
          items={exportItems}
        />

        <Button
          size="sm"
          onClick={onTogglePublish}
          variant={published ? "secondary" : "primary"}
          className="shrink-0"
        >
          {published ? (
            <>
              <Check className="h-4 w-4" strokeWidth={3} />
              <span className="hidden sm:inline">Published</span>
            </>
          ) : (
            <span className="hidden sm:inline">Publish</span>
          )}
        </Button>
      </div>
    </header>
  );
}

/**
 * Inline-editable document title. Looks like a heading until focused, then
 * reads as a text field. Committing on blur *and* Enter means a click away
 * never loses the rename, and Escape restores the saved name.
 */
function TitleField({
  title,
  onTitleChange,
}: {
  title: string;
  onTitleChange: (title: string) => void;
}) {
  return (
    <label className="group flex min-w-0 items-center rounded-lg border border-transparent px-2 transition-colors hover:border-white/[0.08] focus-within:border-white/[0.12] focus-within:bg-white/[0.03]">
      <span className="sr-only">Resume title</span>
      <input
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") event.currentTarget.blur();
        }}
        maxLength={80}
        spellCheck={false}
        className="ring-focus min-w-0 max-w-[12rem] truncate bg-transparent py-1.5 text-sm font-semibold text-foreground outline-none sm:max-w-[16rem]"
      />
    </label>
  );
}

function SaveStatus({
  status,
  onRetry,
}: {
  status: SaveStatus;
  onRetry: () => void;
}) {
  if (status === "saving") {
    return (
      <span className="hidden items-center gap-1.5 text-xs text-muted md:inline-flex">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </span>
    );
  }

  if (status === "saved") {
    return (
      <span className="hidden items-center gap-1.5 text-xs text-emerald-300 md:inline-flex">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
        Saved
      </span>
    );
  }

  if (status === "error") {
    return (
      <button
        onClick={onRetry}
        className="ring-focus hidden items-center gap-1.5 rounded-full text-xs text-rose-300 transition-colors hover:text-rose-200 md:inline-flex"
      >
        <AlertCircle className="h-3.5 w-3.5" />
        Couldn&apos;t save — retry
      </button>
    );
  }

  return null;
}
