"use client";

import { useRef } from "react";
import type { KeyboardEvent } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  autoFocus,
}: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const focusAt = (index: number) => {
    const input = inputs.current[index];
    input?.focus();
    input?.select();
  };

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");

    // Pasting the whole code into one box fills every box.
    if (digits.length > 1) {
      const next = digits.slice(0, length);
      onChange(next);
      focusAt(Math.min(next.length, length - 1));
      return;
    }

    const next = value.split("");
    next[index] = digits;
    onChange(next.join(""));

    if (digits && index < length - 1) focusAt(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    // Backspace on an empty box jumps back so the previous digit can be edited.
    if (event.key === "Backspace" && !value[index] && index > 0) {
      focusAt(index - 1);
    }
  };

  return (
    <div className="flex gap-3" role="group" aria-label="One-time code">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(input) => {
            inputs.current[index] = input;
          }}
          type="text"
          inputMode="numeric"
          autoFocus={autoFocus && index === 0}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={length}
          value={value[index] ?? ""}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          className="ring-focus h-14 w-full max-w-[52px] rounded-xl border border-white/[0.08] bg-white/[0.03] text-center text-lg font-medium text-foreground transition-colors hover:border-white/[0.14] focus:border-brand-400/50 focus:bg-white/[0.05]"
        />
      ))}
    </div>
  );
}
