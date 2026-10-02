"use client";

import { motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { templates } from "@/data/templates";
import type { TemplateId } from "@/data/types";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function TemplatesGallery() {
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
            eyebrow="Templates"
            title="Designer-crafted, ATS-ready"
            description="A focused set of beautiful, recruiter-safe layouts. Switch any time without reformatting a single line."
          />
        </motion.div>

        <motion.div
          variants={item}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {templates.map((template) => (
            <Card key={template.id} className="group flex flex-col p-5">
              <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0d0d15]">
                <TemplateThumbnail id={template.id} accent={template.accent} />
                {template.premium && (
                  <span className="absolute right-3 top-3">
                    <Badge tone="brand">
                      <Sparkles className="h-3 w-3" />
                      Premium
                    </Badge>
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-center gap-2">
                <h3 className="text-base font-semibold tracking-tight">
                  {template.name}
                </h3>
                {template.atsOptimized && (
                  <Badge tone="success">
                    <Check className="h-3 w-3" strokeWidth={3} />
                    ATS
                  </Badge>
                )}
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {template.description}
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-5 w-full"
                type="button"
              >
                Use {template.name}
              </Button>
            </Card>
          ))}
        </motion.div>
      </motion.div>
    </Container>
  );
}

function TemplateThumbnail({
  id,
  accent,
}: {
  id: TemplateId;
  accent: string;
}) {
  const bar = "#3f3f55";
  const line = "#5a5a70";

  const common = (
    <g stroke={line} strokeWidth="3" strokeLinecap="round">
      <line x1="20" y1="34" x2="86" y2="34" />
      <line x1="20" y1="44" x2="60" y2="44" />
    </g>
  );

  const body = (
    <g stroke={bar} strokeWidth="3" strokeLinecap="round">
      <line x1="20" y1="64" x2="120" y2="64" />
      <line x1="20" y1="76" x2="104" y2="76" />
      <line x1="20" y1="88" x2="112" y2="88" />
      <line x1="20" y1="104" x2="96" y2="104" />
      <line x1="20" y1="116" x2="116" y2="116" />
    </g>
  );

  const sidebar = (x: number) => (
    <g>
      <rect
        x={x}
        y="58"
        width="34"
        height="62"
        rx="6"
        fill={`${accent}12`}
        stroke={`${accent}55`}
        strokeWidth="1.2"
      />
      <g stroke={line} strokeWidth="2.4" strokeLinecap="round">
        <line x1={x + 6} y1="68" x2={x + 28} y2="68" />
        <line x1={x + 6} y1="78" x2={x + 22} y2="78" />
        <line x1={x + 6} y1="88" x2={x + 26} y2="88" />
        <line x1={x + 6} y1="98" x2={x + 20} y2="98" />
        <line x1={x + 6} y1="108" x2={x + 24} y2="108" />
      </g>
    </g>
  );

  return (
    <svg
      viewBox="0 0 140 140"
      fill="none"
      className="h-44 w-full"
      aria-hidden
    >
      {id === "creative" && sidebar(12)}
      {id === "modern" && sidebar(94)}
      {id === "executive" && (
        <rect
          x="8"
          y="14"
          width="124"
          height="34"
          rx="6"
          fill={`${accent}12`}
          stroke={`${accent}55`}
          strokeWidth="1.2"
        />
      )}
      <g transform={id === "creative" ? "translate(48 0)" : id === "modern" ? "translate(-4 0)" : "translate(0 4)"}>
        {id === "executive" ? (
          <g transform="translate(0 26)">{common}{body}</g>
        ) : (
          <>
            {common}
            {body}
          </>
        )}
      </g>
      <circle cx={id === "modern" ? 118 : 118} cy="30" r="3" fill={accent} />
    </svg>
  );
}
