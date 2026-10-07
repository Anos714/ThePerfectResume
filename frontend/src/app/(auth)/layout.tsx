import { ArrowLeft, Check } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const promises = [
  "AI copilot that writes sharper bullets",
  "ATS-friendly, recruiter-safe templates",
  "Pixel-perfect PDF & DOCX export",
];

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden border-r border-white/[0.06] bg-surface/40 lg:block">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-15%] h-[460px] w-[700px] -translate-x-1/2 rounded-full bg-brand-600/25 blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-8%] h-[360px] w-[360px] rounded-full bg-fuchsia-600/15 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(255 255 255 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.06) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage:
                "radial-gradient(ellipse 70% 60% at 50% 35%, black, transparent)",
              WebkitMaskImage:
                "radial-gradient(ellipse 70% 60% at 50% 35%, black, transparent)",
            }}
          />
        </div>

        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo href="/" />

          <div className="max-w-md">
            <h2 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight">
              Build the resume that{" "}
              <span className="text-gradient">gets you hired</span>
            </h2>
            <ul className="mt-8 flex flex-col gap-4">
              {promises.map((promise) => (
                <li key={promise} className="flex items-center gap-3 text-sm">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-500/20 text-brand-300">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {promise}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="text-sm leading-relaxed text-foreground/80">
              “The AI copilot rewrote my bullet points in seconds and they
              actually sounded like me — but sharper. I landed three interviews
              in a week.”
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-semibold text-white">
                SM
              </span>
              <div>
                <div className="text-sm font-medium">Sarah Mitchell</div>
                <div className="text-xs text-muted">Product Designer</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center px-6 py-12 sm:px-10">
        <Link
          href="/"
          aria-label="Back to home"
          className="ring-focus absolute left-6 top-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground sm:left-10 sm:top-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
