"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    id: "faq_free",
    question: "Is ThePerfectResume really free to use?",
    answer:
      "Yes. The free plan is free forever — no credit card required. You get the manual editor, three templates, PDF export and one AI suggestion per day. Upgrade only if you want unlimited AI, premium templates and ATS checks.",
  },
  {
    id: "faq_ai",
    question: "What exactly does the AI copilot do?",
    answer:
      "Tell the copilot roughly what you did and it drafts sharp, achievement-focused bullet points matched to your industry. You stay in control — accept, edit or discard every suggestion. Nothing is published to your resume until you approve it.",
  },
  {
    id: "faq_ats",
    question: "Will my resume get past Applicant Tracking Systems?",
    answer:
      "Every template is ATS-safe, and the real-time ATS check scores your resume the way a parser would. It flags small issues — missing keywords, unreadable dates, complex layouts — before a recruiter ever sees it.",
  },
  {
    id: "faq_templates",
    question: "Can I switch templates without reformatting everything?",
    answer:
      "Yes. Your content lives separately from the layout, so switching templates is instant and lossless — the wording stays exactly as you wrote it, only the design changes.",
  },
  {
    id: "faq_export",
    question: "Which export formats are supported?",
    answer:
      "Pixel-perfect PDF and DOCX, plus clean JSON for your own tooling. The exported file matches the on-screen preview exactly — zero shifting, spacing or font surprises.",
  },
  {
    id: "faq_data",
    question: "How is my data handled?",
    answer:
      "Your resumes belong to you. We only store what's needed to run the editor, never sell your data, and you can permanently delete your account and everything in it at any time from Settings.",
  },
  {
    id: "faq_cancel",
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely. No hidden fees and no lock-in — cancel in one click from Billing. You'll keep Pro features until the end of your billing period, then drop back to the free plan automatically.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(faqs[0].id);

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section id="faq" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-brand-600/[0.07] blur-[120px]" />
      <Container className="relative">
        <Reveal>
          <SectionHeading
            eyebrow="FAQ"
            title={
              <>
                Questions?{" "}
                <span className="text-gradient">Answered.</span>
              </>
            }
            description="Everything you need to know before you build. Can't find your answer? Reach out and we'll help personally."
          />
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-14 max-w-3xl">
          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => {
              const isOpen = openId === faq.id;
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    delay: index * 0.06,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-surface/40 transition-colors duration-300",
                    isOpen
                      ? "border-brand-400/30 shadow-glow"
                      : "border-white/[0.07] hover:border-white/[0.14]",
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => toggle(faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={`${faq.id}-panel`}
                      id={`${faq.id}-button`}
                      className="ring-focus flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6"
                    >
                      <span
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors duration-300",
                          isOpen
                            ? "bg-brand-500/20 text-brand-300"
                            : "bg-white/[0.05] text-muted",
                        )}
                      >
                        <motion.span
                          animate={{ rotate: isOpen ? 45 : 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 22,
                          }}
                          className="block"
                        >
                          <Plus className="h-4 w-4" strokeWidth={2.5} />
                        </motion.span>
                      </span>
                      <span
                        className={cn(
                          "flex-1 text-[15px] font-medium leading-snug transition-colors duration-300 sm:text-base",
                          isOpen ? "text-white" : "text-foreground/85",
                        )}
                      >
                        {faq.question}
                      </span>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`${faq.id}-panel`}
                        role="region"
                        aria-labelledby={`${faq.id}-button`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.35,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-6 pl-[4.25rem] sm:px-6 sm:pl-[4.5rem]">
                          <p className="text-sm leading-relaxed text-muted">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </Reveal>
      </Container>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </section>
  );
}
