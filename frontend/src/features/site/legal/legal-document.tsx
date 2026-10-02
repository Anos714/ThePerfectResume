import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import type { ReactNode } from "react";

export interface LegalSection {
  id: string;
  heading: string;
  body: ReactNode;
}

interface LegalDocumentProps {
  sections: LegalSection[];
  lastUpdated: string;
}

export function LegalDocument({ sections, lastUpdated }: LegalDocumentProps) {
  return (
    <Container className="max-w-3xl">
      <div className="flex flex-col gap-12 py-32">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-300">
            Last updated {lastUpdated}
          </p>
        </Reveal>

        {sections.map((section, index) => (
          <Reveal key={section.id} delay={Math.min(index * 0.04, 0.24)}>
            <section id={section.id} className="scroll-mt-24">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {section.heading}
              </h2>
              <div className="mt-4 flex flex-col gap-4 text-[15px] leading-relaxed text-muted">
                {section.body}
              </div>
            </section>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}
