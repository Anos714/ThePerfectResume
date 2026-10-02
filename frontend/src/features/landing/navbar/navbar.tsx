"use client";

import { motion, useScroll } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const links = [
  { label: "Features", href: "#features" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return scrollY.on("change", (v) => setScrolled(v > 12));
  }, [scrollY]);

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        ref={containerRef}
        className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6"
      >
        <nav
          className={cn(
            "flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 sm:px-5",
            scrolled
              ? "glass-strong shadow-card"
              : "border border-transparent bg-transparent",
          )}
        >
          <Logo href="/" />

          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/signin">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Start free</Button>
            </Link>
          </div>

          <button
            className="ring-focus grid h-10 w-10 place-items-center rounded-xl text-white md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong mt-2 rounded-2xl p-3 shadow-card md:hidden"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm text-muted transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-white/5 pt-3">
              <Link href="/signin">
                <Button variant="secondary">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button>Start free</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
