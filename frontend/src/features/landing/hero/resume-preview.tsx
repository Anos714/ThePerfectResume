"use client";

import { motion } from "motion/react";
import { Mail, MapPin, Wand2, Sparkles } from "lucide-react";
import { LinkedinIcon } from "@/components/ui/brand-icons";

const skills = [
  { label: "Product Design", level: 92 },
  { label: "UX Research", level: 85 },
  { label: "Design Systems", level: 78 },
  { label: "Prototyping", level: 88 },
];

const experience = [
  {
    role: "Senior Product Designer",
    company: "Lumina · 2021 — Present",
    points: [
      "Led end-to-end redesign that lifted activation by 34%.",
      "Shipped a design system used across 6 product teams.",
    ],
  },
  {
    role: "Product Designer",
    company: "Northwind · 2018 — 2021",
    points: [
      "Ran 40+ user interviews to shape roadmap decisions.",
      "Cut onboarding drop-off by 22% through UX iteration.",
    ],
  },
];

export function ResumePreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto max-w-3xl"
    >
      <div className="glass relative overflow-hidden rounded-2xl p-2 shadow-glow">
        <ScanLine />
        <div className="relative rounded-xl bg-surface/85 p-6 text-left sm:p-8">
          <Header />
          <div className="mt-6 grid gap-7 sm:grid-cols-5">
            <Sidebar />
            <Main />
          </div>
        </div>
      </div>

      <FloatingChip
        className="-left-5 top-12 hidden sm:flex"
        delay={1.6}
        label="ATS score 98"
        dot="bg-emerald-400"
      />
      <FloatingChip
        className="-right-5 bottom-16 hidden sm:flex"
        delay={1.9}
        label="AI enhanced"
        dot="bg-brand-400"
        icon={<Wand2 className="h-3.5 w-3.5 text-brand-300" />}
      />
    </motion.div>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-5">
      <div className="flex items-center gap-3.5">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.1, type: "spring", stiffness: 220, damping: 15 }}
          className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-semibold text-white"
        >
          AC
        </motion.div>
        <div>
          <div className="font-display text-lg font-semibold tracking-tight">
            Alexandra Carter
          </div>
          <div className="mt-0.5 text-xs text-brand-300">
            Senior Product Designer
          </div>
        </div>
      </div>
      <div className="hidden items-center gap-3 text-[11px] text-muted sm:flex">
        <span className="flex items-center gap-1">
          <Mail className="h-3 w-3" /> hello@alex.cv
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" /> SF, CA
        </span>
        <LinkedinIcon className="h-3 w-3" />
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="space-y-6 sm:col-span-2">
      <div>
        <SectionLabel>Skills</SectionLabel>
        <div className="mt-3 space-y-3">
          {skills.map((s, i) => (
            <div key={s.label}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-foreground/80">{s.label}</span>
                <span className="text-muted">{s.level}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${s.level}%` }}
                  transition={{ delay: 1.4 + i * 0.12, duration: 0.9, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Education</SectionLabel>
        <div className="mt-3 space-y-1 text-[12px]">
          <div className="font-medium text-foreground/90">
            BFA, Interaction Design
          </div>
          <div className="text-muted">Rhode Island School of Design · 2014</div>
        </div>
      </div>
    </div>
  );
}

function Main() {
  return (
    <div className="space-y-6 sm:col-span-3">
      <div>
        <SectionLabel>Profile</SectionLabel>
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-foreground/75">
          Product designer with 7+ years crafting intuitive, accessible
          interfaces for startups and scale-ups. Passionate about turning
          complex problems into simple, delightful experiences.
        </p>
      </div>

      <div>
        <SectionLabel>Experience</SectionLabel>
        <div className="mt-3 space-y-4">
          {experience.map((job) => (
            <div key={job.role}>
              <div className="text-[13px] font-semibold text-foreground/90">
                {job.role}
              </div>
              <div className="text-[11px] text-muted">{job.company}</div>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[11.5px] leading-relaxed text-foreground/70 marker:text-brand-400">
                {job.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-brand-400/25 bg-brand-500/10 p-3">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand-500/25">
            <Wand2 className="h-3 w-3 text-brand-300" />
          </span>
          <span className="text-[11px] font-semibold text-brand-200">
            AI Copilot suggestion
          </span>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            <Sparkles className="h-2.5 w-2.5" /> 3 added
          </span>
        </div>
        <p className="mt-2 text-[11.5px] leading-relaxed text-foreground/75">
          “Spearheaded the 2024 redesign, increasing trial-to-paid conversion
          by 27% through iterative prototyping and A/B testing.”
        </p>
        <div className="mt-2.5 flex items-center gap-1">
          <span className="text-[10px] text-muted">Generating</span>
          <TypingDots />
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-300">
      {children}
    </span>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1 w-1 rounded-full bg-brand-400"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </span>
  );
}

function ScanLine() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-full overflow-hidden rounded-2xl">
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-400/60 to-transparent"
        initial={{ top: "0%" }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function FloatingChip({
  className,
  delay,
  label,
  dot,
  icon,
}: {
  className?: string;
  delay: number;
  label: string;
  dot: string;
  icon?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-strong absolute z-20 items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium shadow-card ${className ?? ""}`}
    >
      <motion.span
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="flex items-center gap-2.5"
      >
        {icon ?? <span className={`h-2 w-2 rounded-full ${dot}`} />}
        {label}
      </motion.span>
    </motion.div>
  );
}
