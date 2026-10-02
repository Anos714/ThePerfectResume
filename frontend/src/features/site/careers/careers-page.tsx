"use client";

import { motion } from "motion/react";
import { Bell, Briefcase, Heart, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

const culture = [
  {
    icon: Users,
    title: "Small, senior, remote",
    description:
      "A deliberately tiny team of senior makers. No layers, no tickets to nowhere — just people who ship.",
  },
  {
    icon: Heart,
    title: "Craft is the product",
    description:
      "We obsess over the 1% details our users never see but always feel. Quality is a feature here.",
  },
  {
    icon: Briefcase,
    title: "Flexible by default",
    description:
      "Async-first, outcome-led hours. We measure trust by shipped work, not screen time.",
  },
];

export function CareersPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="relative pt-44 pb-24 sm:pt-52 sm:pb-32">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-15%] h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[140px]" />
          <div className="absolute left-[-6%] top-[30%] h-[360px] w-[360px] rounded-full bg-sky-500/10 blur-[120px]" />
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
              <Briefcase className="h-3.5 w-3.5" />
              Careers
            </motion.span>
            <motion.h1
              variants={item}
              className="mt-7 max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
            >
              No open roles
              <br />
              <span className="text-gradient">just yet</span>
            </motion.h1>
            <motion.p
              variants={item}
              className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted sm:text-xl"
            >
              We are a small, deliberately senior team — and we are not hiring
              right now. That will change. Leave your email and we will tell
              you the moment it does.
            </motion.p>
            <motion.div variants={item} className="mt-9">
              <Badge tone="brand">0 open positions</Badge>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Empty state */}
      <section className="relative py-12 sm:py-16">
        <Container className="max-w-3xl">
          <Reveal>
            <Card className="flex flex-col items-center gap-5 border-brand-400/20 bg-gradient-to-b from-brand-500/[0.06] to-transparent p-10 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.05] text-brand-300">
                <Bell className="h-6 w-6" />
              </span>
              <h2 className="text-2xl font-semibold tracking-tight">
                Future openings land here first
              </h2>
              <p className="max-w-md text-pretty text-sm leading-relaxed text-muted">
                Engineering, design and product roles will be posted on this
                page before anywhere else. Be first in line instead of fastest.
              </p>

              {submitted ? (
                <div className="mt-2 flex items-center gap-2 rounded-full bg-emerald-400/10 px-5 py-2.5 text-sm font-medium text-emerald-300">
                  <Heart className="h-4 w-4" />
                  You are on the list — talk soon.
                </div>
              ) : (
                <form
                  className="mt-2 flex w-full flex-col gap-3 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <Input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="flex-1"
                    autoComplete="email"
                  />
                  <Button type="submit" className="shrink-0">
                    Notify me
                  </Button>
                </form>
              )}
            </Card>
          </Reveal>
        </Container>
      </section>

      {/* Culture */}
      <section className="relative py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="How we work"
              title={
                <>
                  What a role here{" "}
                  <span className="text-gradient">feels like</span>
                </>
              }
              description="When we do open up, these are the promises we keep to everyone who joins."
            />
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {culture.map((value, i) => {
              const Icon = value.icon;
              return (
                <Reveal key={value.title} delay={i * 0.07}>
                  <Card className="h-full p-7">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/12 text-brand-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight">
                      {value.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted">
                      {value.description}
                    </p>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative pb-28">
        <Container className="max-w-2xl text-center">
          <Reveal>
            <h2 className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
              Meanwhile, build something{" "}
              <span className="text-gradient">perfect</span>
            </h2>
            <p className="mt-5 text-pretty leading-relaxed text-muted">
              The best application is a resume that speaks for itself.
            </p>
            <Link href="/signup" className="mt-8 inline-flex">
              <Button size="lg">Build your resume free</Button>
            </Link>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
