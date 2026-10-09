"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SplitViewMode = "editor" | "preview" | "split";

interface SplitViewProps {
  mode: SplitViewMode;
  editor: ReactNode;
  preview: ReactNode;
  /**
   * Which side the editor sits on. Defaults to the left (invoicely's layout);
   * flipping it is a one-prop change if a template ever wants the preview
   * leading instead.
   */
  editorSide?: "left" | "right";
  /** Persisted across sessions by the caller via `onRatioChange`. */
  defaultRatio?: number;
  onRatioChange?: (ratio: number) => void;
  className?: string;
}

// Dragging past these points stops being useful: narrower than a third and the
// editor's two-column field grids collapse, wider than two thirds and the
// resume preview becomes a sliver.
export const MIN_RATIO = 0.3;
export const MAX_RATIO = 0.7;
const DEFAULT_RATIO = 0.46;

const clampRatio = (value: number): number =>
  Math.min(MAX_RATIO, Math.max(MIN_RATIO, value));

/**
 * A two-pane editor/preview split with a draggable seam, in the shape of
 * invoicely's create page. The divider is a real pointer-drag (pointer capture
 * so the drag survives leaving the element) plus keyboard arrows for
 * accessibility — Left/Right nudges by 4%, Home/Enter resets to default.
 *
 * In single-pane modes the seam disappears entirely rather than collapsing to
 * zero width, which keeps the transition a layout change instead of a stretch.
 */
export function SplitView({
  mode,
  editor,
  preview,
  editorSide = "left",
  defaultRatio = DEFAULT_RATIO,
  onRatioChange,
  className,
}: SplitViewProps) {
  const [ratio, setRatio] = useState(() =>
    clampRatio(defaultRatio ?? DEFAULT_RATIO),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const applyRatio = useCallback(
    (next: number) => {
      const clamped = clampRatio(next);
      setRatio(clamped);
      onRatioChange?.(clamped);
    },
    [onRatioChange],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (!rect.width) return;
      const raw = event.clientX - rect.left;
      applyRatio(editorSide === "left" ? raw / rect.width : 1 - raw / rect.width);
    },
    [applyRatio, editorSide],
  );

  // Listeners are bound by an effect while dragging is active, so teardown is
  // symmetric with setup and no callback ever has to reference itself.
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    if (!dragging) return;
    window.addEventListener("pointermove", handlePointerMove);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [dragging, handlePointerMove]);

  const startDrag = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      // Only the primary button starts a resize; anything else is a right-click
      // or a touch scroll that shouldn't hijack the layout.
      if (event.button !== 0) return;
      setDragging(true);
    },
    [],
  );

  // Double-click on the seam snaps back to the balanced default.
  const resetRatio = useCallback(() => applyRatio(DEFAULT_RATIO), [applyRatio]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const step = 0.04;
      const direction = editorSide === "left" ? 1 : -1;
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          applyRatio(ratio - step * direction);
          break;
        case "ArrowRight":
          event.preventDefault();
          applyRatio(ratio + step * direction);
          break;
        case "Home":
        case "Enter":
          event.preventDefault();
          resetRatio();
          break;
      }
    },
    [applyRatio, resetRatio, editorSide, ratio],
  );

  if (mode === "editor") {
    return <div className={cn("flex h-full w-full", className)}>{editor}</div>;
  }

  if (mode === "preview") {
    return <div className={cn("flex h-full w-full", className)}>{preview}</div>;
  }

  const editorNode = (
    <div
      className="h-full min-w-0 overflow-hidden"
      style={{ flexBasis: `${ratio * 100}%` }}
    >
      {editor}
    </div>
  );

  const previewNode = (
    <div className="h-full min-w-0 flex-1 overflow-hidden">{preview}</div>
  );

  const seam = (
    <button
      type="button"
      aria-label="Resize editor and preview"
      role="separator"
      aria-valuenow={Math.round(ratio * 100)}
      aria-valuemin={Math.round(MIN_RATIO * 100)}
      aria-valuemax={Math.round(MAX_RATIO * 100)}
      onPointerDown={startDrag}
      onDoubleClick={resetRatio}
      onKeyDown={handleKeyDown}
      className="group relative z-10 flex h-full w-px shrink-0 cursor-col-resize items-center justify-center bg-white/[0.07] transition-colors hover:bg-brand-400/50 focus-visible:outline-none"
    >
      <span className="absolute inset-y-0 -inset-x-1.5" aria-hidden />
      <span
        aria-hidden
        className="grid h-9 w-3.5 place-items-center rounded-full border border-white/[0.08] bg-surface/90 opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <GripIcon />
      </span>
    </button>
  );

  return (
    <div
      ref={containerRef}
      className={cn("flex h-full w-full overflow-hidden", className)}
    >
      {editorSide === "left" ? (
        <>
          {editorNode}
          {seam}
          {previewNode}
        </>
      ) : (
        <>
          {previewNode}
          {seam}
          {editorNode}
        </>
      )}
    </div>
  );
}

function GripIcon() {
  return (
    <svg
      width="10"
      height="14"
      viewBox="0 0 10 14"
      fill="none"
      className="text-muted"
      aria-hidden
    >
      <path
        d="M3 2.5h.01M7 2.5h.01M3 7h.01M7 7h.01M3 11.5h.01M7 11.5h.01"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
