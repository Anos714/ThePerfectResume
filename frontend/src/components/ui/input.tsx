import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, hint, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium uppercase tracking-[0.12em] text-muted"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "ring-focus h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-foreground transition-colors placeholder:text-muted/60 hover:border-white/[0.14] focus:border-brand-400/50 focus:bg-white/[0.05]",
          className,
        )}
        {...props}
      />
      {hint && <span className="text-xs text-muted/80">{hint}</span>}
    </div>
  );
});
