"use client";

import { EditorForm } from "./editor-form";
import type { ResumeData } from "@/data/types";

interface EditorPaneProps {
  resumeId: string;
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

/**
 * The left-hand form column. This is the pane that actually scrolls in the
 * builder: the app shell is a fixed-height flex row, so the document flows
 * inside this column rather than the page scrolling underneath it.
 *
 * The form is capped at a comfortable reading width and centred; a full-width
 * form on a wide pane stretches fields past the point where the eye can track
 * the label-to-field relationship.
 */
export function EditorPane({ resumeId, data, onChange }: EditorPaneProps) {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          Resume content
        </span>
        <span className="text-[10px] uppercase tracking-[0.12em] text-muted/60">
          Auto-saving
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto w-full max-w-2xl">
          <EditorForm resumeId={resumeId} data={data} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
