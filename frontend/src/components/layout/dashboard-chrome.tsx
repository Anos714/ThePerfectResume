"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";

interface DashboardChromeProps {
  children: React.ReactNode;
}

// The resume builder is an app surface, not a document surface: it needs the
// full viewport for its editor/preview split, so it drops the reading-width
// container. The resumes *list* still reads like a page and keeps it.
const isBuilderRoute = (pathname: string | null): boolean => {
  if (!pathname) return false;
  return /^\/dashboard\/resumes\/[^/]+\/?$/.test(pathname);
};

export function DashboardChrome({ children }: DashboardChromeProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const fullBleed = isBuilderRoute(pathname);

  return (
    <div className={cn("bg-background", fullBleed ? "flex h-dvh flex-col" : "min-h-dvh")}>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/[0.06] glass-strong lg:block">
        <Sidebar />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex shrink-0 items-center justify-between border-b border-white/[0.06] glass-strong px-4 py-3 lg:hidden">
        <Logo href="/dashboard" size={32} />
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          className="ring-focus grid h-10 w-10 place-items-center rounded-xl text-white transition-colors hover:bg-white/5"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile slide-over */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/[0.08] bg-surface lg:hidden"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="ring-focus absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl text-muted transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <Sidebar onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={cn("lg:pl-64", fullBleed && "flex min-h-0 flex-1 flex-col")}>
        <main
          className={cn(
            fullBleed
              ? "min-h-0 flex-1 overflow-hidden"
              : "mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
