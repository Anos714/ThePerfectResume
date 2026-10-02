"use client";

import { motion } from "motion/react";
import { ArrowRight, Sparkles, Wand2, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ResumePreview } from "./resume-preview";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const highlights = [
  "AI bullet suggestions",
  "ATS-friendly templates",
  "One-click export",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-32">
      <Background />

      <Container className="relative">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center"
        >
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200 sm:text-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Now with AI Resume Copilot
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-7 max-w-4xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          >
            Build the resume that
            <br />
            <span className="text-gradient">gets you hired</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted sm:text-xl"
          >
            ThePerfectResume blends a meticulous manual editor with an
            intelligent AI copilot — craft a pixel-perfect, ATS-friendly resume
            in minutes, not hours.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Build your resume free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <Wand2 className="h-4 w-4" />
                Try AI copilot
              </Button>
            </Link>
          </motion.div>

          <motion.ul
            variants={item}
            className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {highlights.map((h) => (
              <li
                key={h}
                className="flex items-center gap-2 text-sm text-muted"
              >
                <Check className="h-4 w-4 text-brand-400" />
                {h}
              </li>
            ))}
          </motion.ul>

          <motion.div variants={item} className="mt-16 w-full">
            <ResumePreview />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
      <div className="absolute left-1/2 top-[-20%] h-[560px] w-[860px] -translate-x-1/2 rounded-full bg-brand-600/25 blur-[140px]" />
      <div className="absolute right-[-10%] top-[30%] h-[400px] w-[400px] rounded-full bg-fuchsia-600/15 blur-[130px]" />
      <div className="absolute bottom-[-10%] left-[-8%] h-[380px] w-[380px] rounded-full bg-sky-500/10 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(8_8_13/0),rgb(8_8_13/0.9))]" />
      <Grid />
    </div>
  );
}

function Grid() {
  return (
    <div
      className="absolute inset-0 opacity-[0.15]"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgb(255 255 255 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.06) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
        maskImage:
          "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)",
      }}
    />
  );
}
