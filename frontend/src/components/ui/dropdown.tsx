"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: typeof ChevronDown;
  /** Render a check mark and style as the active choice. */
  selected?: boolean;
  /** Right-aligned muted text — a hint or a keyboard shortcut. */
  hint?: string;
  disabled?: boolean;
  onSelect: () => void;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "start" | "end";
  width?: string;
  ariaLabel: string;
}

/**
 * A small keyboard-friendly menu. Invoicely uses this pattern for its download
 * actions; here it also drives the Form / Preview / Both view switch.
 *
 * Keyboard: the trigger toggles with Enter/Space, ArrowDown opens it and lands
 * focus on the first item, arrows move between items, Enter picks, Escape
 * closes and returns focus to the trigger. Focus is tracked with a ref so arrow
 * navigation doesn't re-render the menu on every keystroke.
 */
export function Dropdown({
  trigger,
  items,
  align = "end",
  width = "w-52",
  ariaLabel,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const focusItem = (index: number) => {
    const item = itemRefs.current[index];
    item?.focus();
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
      // Let the menu paint before moving focus into it.
      requestAnimationFrame(() => focusItem(0));
    }
  };

  const handleItemKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const lastIndex = items.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusItem(Math.min(index + 1, lastIndex));
        break;
      case "ArrowUp":
        event.preventDefault();
        focusItem(Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        focusItem(0);
        break;
      case "End":
        event.preventDefault();
        focusItem(lastIndex);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={ariaLabel}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className="ring-focus inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-medium text-foreground transition-colors hover:border-white/[0.16] hover:bg-white/[0.06]"
      >
        {trigger}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Click-outside layer; transparent so it never blocks the visual */}
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 cursor-default"
            />
            <motion.div
              id={menuId}
              role="menu"
              aria-label={ariaLabel}
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "glass-strong absolute top-full z-50 mt-1.5 rounded-xl border border-white/[0.08] p-1.5 shadow-2xl",
                width,
                align === "end" ? "right-0" : "left-0",
              )}
            >
              {items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      item.onSelect();
                      setOpen(false);
                    }}
                    onKeyDown={(event) => handleItemKeyDown(event, index)}
                    className={cn(
                      "ring-focus flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                      item.selected
                        ? "bg-white/[0.07] font-medium text-white"
                        : "text-muted hover:bg-white/[0.05] hover:text-white",
                      item.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          item.selected ? "text-brand-300" : "text-muted",
                        )}
                      />
                    )}
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.hint && (
                      <span className="text-[10px] tabular-nums text-muted/70">
                        {item.hint}
                      </span>
                    )}
                    {item.selected && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-brand-300" strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
