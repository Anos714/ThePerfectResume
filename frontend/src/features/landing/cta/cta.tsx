import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-6 py-16 text-center sm:px-12 sm:py-24">
            <div className="pointer-events-none absolute left-1/2 top-[-40%] h-96 w-[720px] -translate-x-1/2 rounded-full bg-brand-500/30 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-[-30%] right-[-10%] h-72 w-72 rounded-full bg-fuchsia-500/20 blur-[100px]" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-brand-300">
                Get started today
              </span>

              <h2 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
                Your next job starts with a{" "}
                <span className="text-gradient">perfect resume</span>
              </h2>

              <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted">
                Join thousands who&apos;ve upgraded their career with ThePerfectResume.
                Build yours free in minutes.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Build your resume free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    View pricing
                  </Button>
                </Link>
              </div>

              <p className="mt-8 text-sm text-muted">
                Free forever plan · No credit card required
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
