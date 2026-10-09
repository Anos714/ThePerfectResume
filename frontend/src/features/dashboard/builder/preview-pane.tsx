"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, Minus, Plus, Wand2 } from "lucide-react";
import { ResumePreviewDocument } from "./preview";
import { templates } from "@/data/templates";
import type { ResumeData, TemplateId } from "@/data/types";

const MIN_ZOOM = 0.55;
const MAX_ZOOM = 1.6;
const ZOOM_STEP = 0.1;

interface PreviewPaneProps {
  data: ResumeData;
  template: TemplateId;
  onTemplateChange: (template: TemplateId) => void;
}

/**
 * The right-hand document canvas: a dark stage holding the white paper sheet,
 * with a zoom cluster and the template switcher pinned to the top.
 *
 * Zoom uses the CSS `zoom` property rather than `transform: scale()`. `zoom`
 * reflows layout — the stage scrolls to exactly the sheet's scaled size with no
 * dead space below it — and is supported in every current browser (Firefox
 * since 126). The sheet keeps its intrinsic 794px A4 box, so the exported PDF
 * always renders at 100% regardless of the on-screen zoom.
 */
export function PreviewPane({
  data,
  template,
  onTemplateChange,
}: PreviewPaneProps) {
  const [zoom, setZoom] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);

  const clampZoom = useCallback(
    (next: number) => setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next))),
    [],
  );

  // Fit the sheet to the stage width whenever the pane is first laid out.
  // Skipped once the user has chosen a zoom of their own.
  const hasManualZoomRef = useRef(false);
  const fitToStage = useCallback(() => {
    if (hasManualZoomRef.current) return;
    const stage = stageRef.current;
    if (!stage) return;
    const available = stage.clientWidth - 48; // page padding
    if (available <= 0) return;
    // The sheet is 794px wide (A4 at 96dpi).
    setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, available / 794)));
  }, []);

  useEffect(() => {
    fitToStage();
    // Re-fit when the pane itself is resized (the split seam dragging,
    // window resize, or switching from Form-only back to Both).
    const observer = new ResizeObserver(() => fitToStage());
    const stage = stageRef.current;
    if (stage) observer.observe(stage);
    return () => observer.disconnect();
  }, [fitToStage]);

  const handleZoomIn = () => {
    hasManualZoomRef.current = true;
    clampZoom(zoom + ZOOM_STEP);
  };
  const handleZoomOut = () => {
    hasManualZoomRef.current = true;
    clampZoom(zoom - ZOOM_STEP);
  };
  const handleFit = () => {
    hasManualZoomRef.current = false;
    fitToStage();
  };

  return (
    <div className="flex h-full min-w-0 flex-col bg-[#0a0a11]">
      {/* Document toolbar */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <TemplateSwitcher template={template} onTemplateChange={onTemplateChange} />
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
          <ZoomButton onClick={handleZoomOut} disabled={zoom <= MIN_ZOOM} ariaLabel="Zoom out">
            <Minus className="h-3.5 w-3.5" />
          </ZoomButton>
          <span className="min-w-[3rem] text-center text-[11px] font-medium tabular-nums text-muted">
            {Math.round(zoom * 100)}%
          </span>
          <ZoomButton onClick={handleZoomIn} disabled={zoom >= MAX_ZOOM} ariaLabel="Zoom in">
            <Plus className="h-3.5 w-3.5" />
          </ZoomButton>
          <ZoomButton onClick={handleFit} ariaLabel="Fit to width">
            <Maximize className="h-3.5 w-3.5" />
          </ZoomButton>
        </div>
      </div>

      {/* Scrollable stage */}
      <div
        ref={stageRef}
        className="relative flex-1 overflow-auto"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.045) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      >
        <div className="flex min-h-full w-full items-start justify-center px-6 py-8">
          {/* The sheet keeps its intrinsic 794px A4 box; `zoom` rescales the
              whole page including its layout box, so the stage scrolls to the
              scaled size with no leftover dead space. */}
          <div style={{ width: 794, zoom }}>
            <ResumePreviewDocument data={data} template={template} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ZoomButton({
  onClick,
  disabled,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="ring-focus grid h-7 w-7 place-items-center rounded-md text-muted transition-colors hover:bg-white/[0.07] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
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
    <div className="flex items-center gap-2">
      <Wand2 className="h-3.5 w-3.5 text-brand-300" />
      <div className="flex flex-wrap gap-1.5">
        {templates.map((t) => {
          const active = t.id === template;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTemplateChange(t.id)}
              aria-pressed={active}
              className="ring-focus inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors"
              style={{
                borderColor: active ? t.accent : "rgba(255,255,255,0.1)",
                color: active ? t.accent : "var(--color-muted)",
                background: active ? `${t.accent}14` : "transparent",
              }}
            >
              {t.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
