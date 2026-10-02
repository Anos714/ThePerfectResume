"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  CreditCard,
  FileText,
  LayoutDashboard,
  LayoutTemplate,
  MessageSquareText,
  PenLine,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { mockUser, planLabels } from "@/data/user";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Resumes", href: "/dashboard/resumes", icon: FileText },
  { label: "Templates", href: "/dashboard/templates", icon: LayoutTemplate },
  { label: "Cover letters", href: "/dashboard/cover-letters", icon: PenLine },
  {
    label: "Interview prep",
    href: "/dashboard/interview-prep",
    icon: MessageSquareText,
  },
];

const footerNav: NavItem[] = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <Logo href="/dashboard" onClick={onNavigate} />

      <nav className="flex flex-1 flex-col gap-1">
        <span className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted/70">
          Workspace
        </span>
        {mainNav.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={isActive(item.href)}
            onClick={onNavigate}
          />
        ))}

        <span className="mt-5 px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted/70">
          Account
        </span>
        {footerNav.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={isActive(item.href)}
            onClick={onNavigate}
          />
        ))}
      </nav>

      {mockUser.plan === "free" ? (
        <UpgradeCard onNavigate={onNavigate} />
      ) : (
        <PlanCard />
      )}

      <div className="flex items-center gap-3 border-t border-white/[0.06] pt-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-semibold text-white">
          {mockUser.fullName
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">
            {mockUser.fullName}
          </div>
          <div className="truncate text-xs text-muted">{mockUser.email}</div>
        </div>
      </div>
    </div>
  );
}

function SidebarLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "ring-focus relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-white/[0.06] font-medium text-white"
          : "text-muted hover:bg-white/[0.04] hover:text-white",
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-brand-400"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <Icon
        className={cn("h-4.5 w-4.5 shrink-0", active && "text-brand-300")}
        strokeWidth={2}
      />
      {item.label}
    </Link>
  );
}

function UpgradeCard({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-400/25 bg-gradient-to-b from-brand-500/10 to-transparent p-4">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-brand-300" />
        <span className="text-sm font-semibold">Upgrade to Pro</span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted">
        Unlock unlimited AI copilot, ATS checks and premium templates.
      </p>
      <Link
        href="/dashboard/billing"
        onClick={onNavigate}
        className="ring-focus mt-3 inline-flex h-9 w-full items-center justify-center rounded-full bg-white text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
      >
        Go Pro
      </Link>
    </div>
  );
}

function PlanCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brand-300" />
        <span className="text-sm font-semibold">
          {planLabels[mockUser.plan]} plan
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted">
        AI copilot is unlimited. Cover letters and interview prep included.
      </p>
    </div>
  );
}
