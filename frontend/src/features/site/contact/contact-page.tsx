"use client";

import { motion } from "motion/react";
import { Check, Mail, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GithubIcon, XIcon, LinkedinIcon } from "@/components/ui/brand-icons";

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

const channels = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@theperfectresume.app",
    detail: "Support and account questions",
  },
  {
    icon: MessageCircle,
    label: "Feedback",
    value: "feedback@theperfectresume.app",
    detail: "Ideas, bugs and feature requests",
  },
];

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="relative pt-44 pb-20 sm:pt-52 sm:pb-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-15%] h-[460px] w-[800px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[140px]" />
          <div className="absolute right-[-8%] top-[32%] h-[340px] w-[340px] rounded-full bg-fuchsia-600/12 blur-[120px]" />
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
              <Mail className="h-3.5 w-3.5" />
              Contact
            </motion.span>
            <motion.h1
              variants={item}
              className="mt-7 max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
            >
              Say hello, we{" "}
              <span className="text-gradient">answer back</span>
            </motion.h1>
            <motion.p
              variants={item}
              className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted sm:text-xl"
            >
              Real people read every message — no bots, no ticket queues. Tell
              us what you are building, what broke, or what would make your
              resume better.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      <section className="relative pb-32">
        <Container className="max-w-5xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-start">
            {/* Form */}
            <Reveal className="lg:col-span-3">
              <Card className="p-7 sm:p-8">
                {submitted ? (
                  <div className="flex flex-col items-center gap-4 py-10 text-center">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                      <Check className="h-6 w-6" strokeWidth={3} />
                    </span>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      Message sent
                    </h2>
                    <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted">
                      Thanks for reaching out. We reply within two business
                      days — usually much sooner.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSubmitted(false)}
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form
                    className="flex flex-col gap-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSubmitted(true);
                    }}
                  >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Input
                        name="name"
                        label="Your name"
                        placeholder="Alexandra Carter"
                        required
                      />
                      <Input
                        name="email"
                        type="email"
                        label="Email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                    <Input
                      name="subject"
                      label="Subject"
                      placeholder="How can we help?"
                      required
                    />
                    <Textarea
                      name="message"
                      label="Message"
                      rows={5}
                      placeholder="Write as much or as little as you like…"
                      required
                    />
                    <div className="flex justify-end">
                      <Button type="submit" size="lg">
                        <Send className="h-4 w-4" />
                        Send message
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </Reveal>

            {/* Channels */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              <Reveal>
                <SectionHeading
                  align="left"
                  eyebrow="Direct"
                  title="Other ways in"
                  className="[&_h2]:text-2xl"
                />
              </Reveal>
              {channels.map((channel, i) => {
                const Icon = channel.icon;
                return (
                  <Reveal key={channel.label} delay={0.07 * (i + 1)}>
                    <Card className="p-5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-500/12 text-brand-300">
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <div>
                          <div className="text-xs uppercase tracking-[0.14em] text-muted">
                            {channel.label}
                          </div>
                          <div className="text-sm font-medium">
                            {channel.value}
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-muted">
                        {channel.detail}
                      </p>
                    </Card>
                  </Reveal>
                );
              })}
              <Reveal delay={0.28}>
                <Card className="p-5">
                  <div className="text-xs uppercase tracking-[0.14em] text-muted">
                    Social
                  </div>
                  <div className="mt-3 flex gap-2.5">
                    {[
                      { Icon: XIcon, label: "X (Twitter)" },
                      { Icon: GithubIcon, label: "GitHub" },
                      { Icon: LinkedinIcon, label: "LinkedIn" },
                    ].map(({ Icon, label }) => (
                      <a
                        key={label}
                        href="#"
                        aria-label={label}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-muted transition-colors hover:border-white/25 hover:text-white"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </Card>
              </Reveal>
              <Reveal delay={0.35}>
                <p className="px-1 text-xs leading-relaxed text-muted">
                  Looking for answers right now? Check the{" "}
                  <Link
                    href="/#faq"
                    className="font-medium text-brand-300 transition-colors hover:text-brand-200"
                  >
                    FAQ
                  </Link>{" "}
                  — most common questions are already covered there.
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
