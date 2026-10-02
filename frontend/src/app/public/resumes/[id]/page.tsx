import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import { Logo } from "@/components/ui/logo";
import { ResumePreviewDocument } from "@/features/dashboard/builder/preview";
import { getResumeById } from "@/data/resumes";
import { templateById } from "@/data/plans";

interface PageProps {
  params: Promise<{ resumeId: string }>;
}

export default async function PublicResumePage({ params }: PageProps) {
  const { resumeId } = await params;
  const resume = getResumeById(resumeId);

  if (!resume) {
    notFound();
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] glass-strong">
        <Container className="flex h-16 items-center justify-between">
          <Logo href="/" size={32} />
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-muted sm:block">
              {resume.fullName} · {resume.headline}
            </span>
            <Link href="/signup">
              <Button size="sm">
                Build yours free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Container>
      </header>

      <main className="flex-1 py-10 sm:py-14">
        <Container className="flex max-w-4xl flex-col gap-8">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
                {resume.fullName}
              </h1>
              <p className="mt-2 text-sm text-muted">{resume.headline}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-surface/40 p-3">
                <ScoreRing value={resume.atsScore} size={56} strokeWidth={6} />
                <div>
                  <div className="text-xs uppercase tracking-[0.14em] text-muted">
                    ATS score
                  </div>
                  <Badge tone="brand" className="mt-1">
                    {templateById[resume.template]}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <ResumePreviewDocument data={resume} template={resume.template} />
        </Container>
      </main>

      <footer className="border-t border-white/[0.06] py-8">
        <Container className="flex flex-col items-center justify-between gap-3 text-sm text-muted sm:flex-row">
          <span>
            © {new Date().getFullYear()} ThePerfectResume. All rights reserved.
          </span>
          <Link
            href="/signup"
            className="ring-focus font-medium text-brand-300 transition-colors hover:text-brand-200"
          >
            Create your perfect resume →
          </Link>
        </Container>
      </footer>
    </div>
  );
}
