"use client";

import { Globe, Mail, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import type { ResumeData, TemplateId } from "@/data/types";
import { templates } from "@/data/templates";

interface PreviewProps {
  data: ResumeData;
  template: TemplateId;
  className?: string;
}

export function ResumePreviewDocument({
  data,
  template,
  className,
}: PreviewProps) {
  const info = templates.find((t) => t.id === template) ?? templates[0];
  const accent = info.accent;

  const layoutClass = {
    single: "",
    "sidebar-right": "sm:grid sm:grid-cols-5 sm:gap-6",
    "sidebar-left": "sm:grid sm:grid-cols-5 sm:gap-6",
    topbar: "",
  }[info.layout];

  const sidebarOrder = info.layout === "sidebar-left";

  return (
    <div
      className={cn(
        "relative w-full rounded-xl border border-white/[0.08] bg-[#0d0d15] p-6 text-left sm:p-8",
        className,
      )}
    >
      {info.layout === "topbar" ? (
        <TopbarHeader data={data} accent={accent} />
      ) : (
        <Header data={data} accent={accent} />
      )}

      <div className={cn("mt-6", layoutClass)}>
        {info.layout === "single" || info.layout === "topbar" ? (
          <MainColumn data={data} accent={accent} />
        ) : (
          <>
            <div
              className={cn(
                "sm:col-span-3",
                sidebarOrder && "sm:order-2",
              )}
            >
              <MainColumn data={data} accent={accent} />
            </div>
            <div
              className={cn(
                "mt-7 sm:col-span-2 sm:mt-0",
                sidebarOrder && "sm:order-1",
              )}
            >
              <SidebarColumn data={data} accent={accent} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SectionLabel({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-[0.16em]"
      style={{ color: accent }}
    >
      {children}
    </span>
  );
}

function Header({ data, accent }: { data: ResumeData; accent: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-5">
      <div>
        <div className="font-display text-lg font-semibold tracking-tight">
          {data.fullName || "Your name"}
        </div>
        <div className="mt-0.5 text-xs" style={{ color: accent }}>
          {data.headline || "Your headline"}
        </div>
      </div>
      <div className="hidden items-center gap-3 text-[11px] text-muted sm:flex">
        {data.phoneNumber && (
          <span className="flex items-center gap-1">
            <PhoneIcon /> {data.phoneNumber}
          </span>
        )}
        {data.email && (
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" /> {data.email}
          </span>
        )}
        {data.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {data.location}
          </span>
        )}
      </div>
    </div>
  );
}

function TopbarHeader({ data, accent }: { data: ResumeData; accent: string }) {
  return (
    <div
      className="-mx-6 -mt-6 mb-6 rounded-t-xl px-6 py-5 sm:-mx-8 sm:px-8"
      style={{ background: `${accent}14`, borderBottom: `1px solid ${accent}33` }}
    >
      <div className="font-display text-lg font-semibold tracking-tight">
        {data.fullName || "Your name"}
      </div>
      <div className="mt-0.5 text-xs" style={{ color: accent }}>
        {data.headline || "Your headline"}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
        {data.phoneNumber && <span>{data.phoneNumber}</span>}
        {data.email && <span>{data.email}</span>}
        {data.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {data.location}
          </span>
        )}
      </div>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden>
      <path
        d="M6.6 3h2.7l1.3 4-2 1.4a11 11 0 0 0 4.7 4.7l1.4-2 4 1.3v2.7a2 2 0 0 1-2.2 2A15 15 0 0 1 4.6 5.2 2 2 0 0 1 6.6 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MainColumn({ data, accent }: { data: ResumeData; accent: string }) {
  return (
    <div className="space-y-6">
      {data.summary && (
        <div>
          <SectionLabel accent={accent}>Profile</SectionLabel>
          <p className="mt-2.5 text-[12.5px] leading-relaxed text-foreground/70">
            {data.summary}
          </p>
        </div>
      )}

      {data.experience.length > 0 && (
        <div>
          <SectionLabel accent={accent}>Experience</SectionLabel>
          <div className="mt-3 space-y-4">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="text-[13px] font-semibold text-foreground/90">
                  {exp.role || "Role"}
                </div>
                <div className="text-[11px] text-muted">
                  {exp.company || "Company"}
                  {exp.location ? ` · ${exp.location}` : ""} ·{" "}
                  {formatRange(exp.startDate, exp.endDate, exp.currentlyWorking)}
                </div>
                {exp.description && (
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-foreground/65">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.projects.length > 0 && (
        <div>
          <SectionLabel accent={accent}>Projects</SectionLabel>
          <div className="mt-3 space-y-3">
            {data.projects.map((project) => (
              <div key={project.id}>
                <div className="text-[12.5px] font-semibold text-foreground/90">
                  {project.title}
                </div>
                {project.description && (
                  <p className="mt-1 text-[11.5px] leading-relaxed text-foreground/65">
                    {project.description}
                  </p>
                )}
                {project.techStack.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-muted"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.education.length > 0 && (
        <div>
          <SectionLabel accent={accent}>Education</SectionLabel>
          <div className="mt-3 space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="text-[12.5px] font-semibold text-foreground/90">
                  {edu.degree}
                  {edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}
                </div>
                <div className="text-[11px] text-muted">
                  {edu.school} · {edu.endYear}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarColumn({ data, accent }: { data: ResumeData; accent: string }) {
  return (
    <div className="space-y-6">
      {data.skills.length > 0 && (
        <div>
          <SectionLabel accent={accent}>Skills</SectionLabel>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[10.5px] text-foreground/80"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.languages.length > 0 && (
        <div>
          <SectionLabel accent={accent}>Languages</SectionLabel>
          <div className="mt-3 space-y-1.5 text-[11.5px]">
            {data.languages.map((lang) => (
              <div key={lang.id} className="flex justify-between gap-3">
                <span className="text-foreground/80">{lang.name}</span>
                <span className="text-muted">{lang.proficiency}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.certifications.length > 0 && (
        <div>
          <SectionLabel accent={accent}>Certifications</SectionLabel>
          <div className="mt-3 space-y-2 text-[11.5px]">
            {data.certifications.map((cert) => (
              <div key={cert.id}>
                <div className="text-foreground/80">{cert.name}</div>
                <div className="text-muted">
                  {cert.issuer} · {cert.issueDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5 text-[11px] text-muted">
        {data.websiteUrl && (
          <span className="flex items-center gap-1.5">
            <Globe className="h-3 w-3" /> {data.websiteUrl.replace(/^https?:\/\//, "")}
          </span>
        )}
        {data.linkedinUrl && (
          <span className="flex items-center gap-1.5">
            <LinkedinIcon className="h-3 w-3" />{" "}
            {data.linkedinUrl.replace(/^https?:\/\/(www\.)?/, "")}
          </span>
        )}
        {data.githubUrl && (
          <span className="flex items-center gap-1.5">
            <GithubIcon className="h-3 w-3" />{" "}
            {data.githubUrl.replace(/^https?:\/\/(www\.)?/, "")}
          </span>
        )}
      </div>
    </div>
  );
}

function formatRange(
  start: string,
  end?: string,
  currentlyWorking?: boolean,
): string {
  const fmt = (v: string) => {
    const [y, m] = v.split("-");
    if (!y) return v;
    if (!m) return y;
    const date = new Date(Number(y), Number(m) - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };
  const startStr = fmt(start);
  const endStr = currentlyWorking ? "Present" : end ? fmt(end) : "";
  return endStr ? `${startStr} — ${endStr}` : startStr;
}
