import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "ring-focus inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-white text-neutral-900 shadow-[0_1px_0_0_rgb(255_255_255/0.6)_inset,0_12px_30px_-12px_rgb(255_255_255/0.5)] hover:bg-neutral-200 active:scale-[0.98]",
  secondary:
    "glass text-white hover:bg-white/10 active:scale-[0.98]",
  ghost:
    "text-muted hover:text-white hover:bg-white/5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);
