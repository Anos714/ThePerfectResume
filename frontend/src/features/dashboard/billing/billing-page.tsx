"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, CreditCard, Download, Zap } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getDisplayPrice, plans } from "@/data/plans";
import { mockUser, planLabels } from "@/data/user";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const invoices = [
  { id: "INV-2026-0912", date: "Sep 1, 2026", amount: "$9.00", plan: "Pro" },
  { id: "INV-2026-0807", date: "Aug 1, 2026", amount: "$9.00", plan: "Pro" },
  { id: "INV-2026-0703", date: "Jul 1, 2026", amount: "$9.00", plan: "Pro" },
];

export function BillingPage() {
  const [yearly, setYearly] = useState(true);

  return (
    <Container className="max-w-6xl">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-10"
      >
        <motion.div variants={item}>
          <PageHeader
            eyebrow="Billing"
            title="Plan & billing"
            description="Start free, upgrade when you're ready. No hidden fees, cancel anytime."
          />
        </motion.div>

        <motion.div variants={item}>
          <Card className="flex flex-col gap-4 border-brand-400/25 bg-gradient-to-b from-brand-500/[0.08] to-transparent p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/20 text-brand-300">
                <Zap className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">
                    {planLabels[mockUser.plan]} plan
                  </span>
                  <Badge tone="brand">Active</Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted">
                  Renews on Oct 1, 2026 · $9/month, billed yearly
                </p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <Button variant="secondary" size="sm">
                Change plan
              </Button>
              <Button variant="secondary" size="sm">
                Cancel
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} className="flex items-center justify-center gap-4">
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              !yearly ? "text-white" : "text-muted",
            )}
          >
            Monthly
          </span>
          <button
            role="switch"
            aria-checked={yearly}
            onClick={() => setYearly((v) => !v)}
            className="ring-focus relative h-7 w-13 rounded-full border border-white/10 transition-colors"
            style={{ backgroundColor: yearly ? "var(--color-brand-500)" : "rgba(255,255,255,0.1)" }}
          >
            <motion.span
              className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
              animate={{ left: yearly ? 26 : 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              yearly ? "text-white" : "text-muted",
            )}
          >
            Yearly
            <span className="ml-2 rounded-full bg-brand-500/15 px-2 py-0.5 text-xs font-medium text-brand-300">
              Save 25%
            </span>
          </span>
        </motion.div>

        <motion.div
          variants={item}
          className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-stretch"
        >
          {plans.map((plan) => {
            const price = getDisplayPrice(plan.monthly, plan.yearly, yearly);
            const isCurrent = plan.id === mockUser.plan;
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex h-full flex-col p-7",
                  plan.popular
                    ? "border-brand-400/40 bg-gradient-to-b from-brand-500/[0.12] to-surface/60 shadow-glow"
                    : "",
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-glow">
                    <Zap className="h-3.5 w-3.5" />
                    Most popular
                  </span>
                )}

                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-semibold tracking-tight">
                    {plan.name}
                  </h3>
                  {isCurrent && <Badge tone="success">Current</Badge>}
                </div>
                <p className="mt-2 min-h-10 text-sm leading-relaxed text-muted">
                  {plan.tagline}
                </p>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-5xl font-semibold tracking-tight">
                    ${price}
                  </span>
                  <span className="text-sm text-muted">
                    /month{price !== 0 && yearly ? ", billed yearly" : ""}
                  </span>
                </div>
                <Button
                  variant={plan.popular ? "primary" : "secondary"}
                  className="mt-7 w-full"
                  disabled={isCurrent}
                  type="button"
                >
                  {isCurrent ? "Your plan" : plan.cta}
                </Button>
                <ul className="mt-8 space-y-3 border-t border-white/[0.06] pt-7">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full",
                          plan.popular
                            ? "bg-brand-500/25 text-brand-300"
                            : "bg-white/[0.06] text-muted",
                        )}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span className="text-foreground/85">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </motion.div>

        <motion.div variants={item} className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted" />
            <h2 className="text-lg font-semibold tracking-tight">
              Billing history
            </h2>
          </div>
          <Card className="overflow-hidden p-0">
            <div className="divide-y divide-white/[0.06]">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{invoice.id}</div>
                    <div className="mt-0.5 text-xs text-muted">
                      {invoice.date} · {invoice.plan}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <span className="text-sm tabular-nums">
                      {invoice.amount}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Download ${invoice.id}`}
                      type="button"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </Container>
  );
}
