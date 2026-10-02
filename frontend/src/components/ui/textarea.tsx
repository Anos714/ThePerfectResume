import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, label, hint, id, ...props }, ref) {
    const textareaId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-medium uppercase tracking-[0.12em] text-muted"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "ring-focus w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-foreground transition-colors placeholder:text-muted/60 hover:border-white/[0.14] focus:border-brand-400/50 focus:bg-white/[0.05]",
            className,
          )}
          {...props}
        />
        {hint && <span className="text-xs text-muted/80">{hint}</span>}
      </div>
    );
  },
);
