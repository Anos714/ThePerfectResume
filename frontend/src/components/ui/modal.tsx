"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  // Escape dismisses, and the body stays put behind the dialog instead of
  // scrolling under the backdrop.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8"
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === "string" ? title : undefined}
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <Card
        className={cn(
          "relative z-10 w-full max-w-md p-6",
          className,
        )}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm leading-relaxed text-muted">{description}</p>
          )}
        </div>
        <div className="mt-5 flex flex-col gap-4">{children}</div>
      </Card>
    </div>
  );
}
