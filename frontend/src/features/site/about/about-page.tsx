"use client";

import { motion } from "motion/react";
import { Heart, Layers, ShieldCheck, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const values = [
  {
    icon: Target,
    title: "Craft over clutter",
    description:
      "Every pixel, spacing and font choice is deliberate. We treat your resume like a product, not a template dump.",
  },
  {
    icon: Sparkles,
    title: "AI that amplifies you",
    description:
      "The copilot never writes your story — it sharpens it. You stay in control of every word that ships.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy by default",
    description:
      "Your data is yours. No selling, no silent tracking — delete everything in one click, anytime.",
  },
  {
    icon: Layers,
    title: "Accessible to everyone",
    description:
      "ATS-safe by default and readable by every parser, so great resumes aren't locked behind design skills.",
  },
];

const stats = [
  { value: "7+", label: "Years of design craft behind it" },
  { value: "6", label: "Hand-engineered templates" },
  { value: "98", label: "Average ATS score target" },
  { value: "100%", label: "Free plan, forever" },
];

export function AboutPage() {
  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="relative pt-44 pb-24 sm:pt-52 sm:pb-32">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-15%] h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[140px]" />
          <div className="absolute right-[-6%] top-[28%] h-[340px] w-[340px] rounded-full bg-fuchsia-600/12 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.12]" style={{
            backgroundImage:
              "linear-gradient(to right, rgb(255 255 255 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.06) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)",
          }} />
        </div>
        <Container>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center text-center"
          >
            <motion.span
              variants={item}
              className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-200 sm:text-sm"
            >
              <Heart className="h-3.5 w-3.5" />
              Our story
            </motion.span>
            <motion.h1
              variants={item}
              className="mt-7 max-w-4xl text-balance text-5xl font-semibold leading-[1.06] tracking-tight sm:text-6xl md:text-7xl"
            >
              Built by people who lost{" "}
              <span className="text-gradient">too many interviews</span>
            </motion.h1>
            <motion.p
              variants={item}
              className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted sm:text-xl"
            >
              ThePerfectResume started as a frustration: brilliant candidates
              rejected because their resume couldn&apos;t survive a parser or
              didn&apos;t look like care went into it. So we built the tool we
              wished we had — a meticulous editor with an AI copilot that makes
              craft effortless.
            </motion.p>
            <motion.div
              variants={item}
              className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Start building free
                </Button>
              </Link>
              <Link href="#mission" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Read our mission
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Mission */}
      <section id="mission" className="relative scroll-mt-24 py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Mission"
              title={
                <>
                  Make every resume{" "}
                  <span className="text-gradient">worth reading</span>
                </>
              }
              description="Most resume tools optimize for the tool — countless features, endless menus. We optimize for the outcome: a recruiter pausing on your name, and an ATS that reads you perfectly."
            />
          </Reveal>
          <Reveal delay={0.1} className="mx-auto mt-14 max-w-3xl">
            <p className="text-center text-pretty text-lg leading-relaxed text-muted">
              We believe a resume is the most important document of your career —
              yet most people settle for a template and a prayer. ThePerfectResume
              blends a pixel-perfect manual editor with an AI copilot that drafts
              sharper bullets, so the work of standing out takes minutes instead
              of weekends.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Values */}
      <section className="relative py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Values"
              title={
                <>
                  What we care <span className="text-gradient">about</span>
                </>
              }
            />
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <Reveal key={value.title} delay={i * 0.07}>
                  <Card className="h-full p-7">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/12 text-brand-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-xl font-semibold tracking-tight">
                      {value.title}
                    </h3>
                    <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted">
                      {value.description}
                    </p>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="relative py-20">
        <Container>
          <Reveal>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.04] lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-surface/30 px-6 py-7 text-center sm:px-8 sm:py-8">
                  <div className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative py-24 sm:py-32">
        <Container>
          <Reveal>
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-6 py-16 text-center sm:px-12 sm:py-20">
              <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
                Your next job starts with a{" "}
                <span className="text-gradient">perfect resume</span>
              </h2>
              <p className="mx-auto mt-5 max-w-md text-pretty leading-relaxed text-muted">
                Join thousands building careers with craft. Free forever —
                no credit card required.
              </p>
              <Link href="/signup" className="mt-9 inline-flex">
                <Button size="lg">Build your resume free</Button>
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
