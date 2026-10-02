import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.07] bg-surface/40 p-6 transition-colors duration-300 hover:border-white/[0.14]",
        className,
      )}
      {...props}
    />
  );
}
