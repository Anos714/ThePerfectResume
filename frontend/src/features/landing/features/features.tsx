import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import {
  AIVisual,
  PreviewVisual,
  TemplatesVisual,
  ATSVisual,
  ExportVisual,
} from "./visuals";

interface Feature {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  className: string;
  visual?: () => ReactNode;
}

const features: Feature[] = [
  {
    key: "ai",
    eyebrow: "AI Copilot",
    title: "Write like your best self",
    description:
      "Tell the copilot what you did and it drafts sharp, achievement-focused bullet points matched to your industry.",
    className: "lg:col-span-4 lg:row-span-2",
    visual: () => <AIVisual />,
  },
  {
    key: "preview",
    eyebrow: "Live preview",
    title: "See every change instantly",
    description: "A true WYSIWYG editor — no surprises at export.",
    className: "lg:col-span-2 lg:row-span-2",
    visual: () => <PreviewVisual />,
  },
  {
    key: "templates",
    eyebrow: "Templates",
    title: "Designer-crafted, ATS-ready",
    description: "A focused set of beautiful, recruiter-safe layouts.",
    className: "lg:col-span-2",
    visual: () => <TemplatesVisual />,
  },
  {
    key: "ats",
    eyebrow: "ATS check",
    title: "Predict recruiter parsing",
    description: "Real-time scoring that keeps you in the running.",
    className: "lg:col-span-2",
    visual: () => <ATSVisual />,
  },
  {
    key: "export",
    eyebrow: "Export",
    title: "Pixel-perfect output",
    description: "Flawless PDF, DOCX and JSON — zero shifting.",
    className: "lg:col-span-2",
    visual: () => <ExportVisual />,
  },
];

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-24 py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Features"
            title={
              <>
                Everything you need to{" "}
                <span className="text-gradient">stand out</span>
              </>
            }
            description="From intelligent writing to pixel-perfect output, every detail is engineered to help you make a stunning first impression."
          />
        </Reveal>

        <div className="mt-16 grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {features.map((feature, i) => (
            <Reveal
              key={feature.key}
              delay={i * 0.07}
              className={cn("h-full", feature.className)}
            >
              <FeatureCard feature={feature} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Visual = feature.visual;
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-surface/40 p-6 transition-colors duration-300 hover:border-white/[0.14] sm:p-7",
      )}
    >
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">
          {feature.eyebrow}
        </span>
        <h3 className="mt-2.5 text-xl font-semibold tracking-tight">
          {feature.title}
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          {feature.description}
        </p>
      </div>

      {Visual && (
        <div className="mt-6 min-h-0 flex-1">
          <Visual />
        </div>
      )}
    </article>
  );
}
