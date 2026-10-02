"use client";

import { motion } from "motion/react";
import { Check, Zap } from "lucide-react";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { plans, getDisplayPrice } from "@/data/plans";
import type { Plan } from "@/data/plans";

export { getDisplayPrice };

export function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="relative scroll-mt-24 py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Pricing"
            title={
              <>
                Simple pricing, <span className="text-gradient">serious value</span>
              </>
            }
            description="Start free, upgrade when you're ready. No hidden fees, cancel anytime."
          />
        </Reveal>

        <Reveal className="mt-10 flex items-center justify-center gap-4">
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
            className={cn(
              "ring-focus relative h-7 w-13 rounded-full border border-white/10 transition-colors",
              yearly ? "bg-brand-500" : "bg-white/10",
            )}
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
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-stretch">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08} className="h-full">
              <PlanCard plan={plan} yearly={yearly} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function PlanCard({ plan, yearly }: { plan: Plan; yearly: boolean }) {
  const price = getDisplayPrice(plan.monthly, plan.yearly, yearly);

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-3xl border p-7 transition-colors duration-300 sm:p-8",
        plan.popular
          ? "border-brand-400/40 bg-gradient-to-b from-brand-500/[0.12] to-surface/60 shadow-glow"
          : "border-white/[0.08] bg-surface/40 hover:border-white/15",
      )}
    >
      {plan.popular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-glow">
          <Zap className="h-3.5 w-3.5" />
          Most popular
        </span>
      )}

      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
        {plan.popular && (
          <span className="text-xs text-brand-300">Recommended</span>
        )}
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
      >
        {plan.cta}
      </Button>

      <ul className="mt-8 space-y-3 border-t border-white/[0.06] pt-7">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
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
    </div>
  );
}
