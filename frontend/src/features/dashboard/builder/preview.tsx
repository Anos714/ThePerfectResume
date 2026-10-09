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

/**
 * The resume rendered as a sheet of paper.
 *
 * The live preview intentionally mirrors the PDF exporter's renderer
 * (`backend/.../resume-html.ts`): white page, dark ink, same section order and
 * the template's accent colour. Keeping the two in step is what makes the
 * export a truthful "what you see is what you get", so any visual change here
 * wants a matching change on the server.
 */
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
        "relative w-full rounded-[10px] bg-white p-6 text-left shadow-[0_1px_2px_rgb(0_0_0/0.06),0_12px_32px_-12px_rgb(0_0_0/0.25)] ring-1 ring-black/[0.06] sm:p-8",
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
                "min-w-0 sm:col-span-3",
                sidebarOrder && "sm:order-2",
              )}
            >
              <MainColumn data={data} accent={accent} />
            </div>
            <div
              className={cn(
                "mt-7 min-w-0 border-t border-neutral-200 pt-6 sm:col-span-2 sm:mt-0 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0",
                sidebarOrder && "sm:order-1 sm:border-l-0 sm:border-r sm:pl-0 sm:pr-6",
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
      className="text-[10px] font-bold uppercase tracking-[0.16em]"
      style={{ color: accent }}
    >
      {children}
    </span>
  );
}

function Header({ data, accent }: { data: ResumeData; accent: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-5">
      <div className="min-w-0">
        <div className="font-display text-xl font-semibold tracking-tight text-neutral-900">
          {data.fullName || "Your name"}
        </div>
        <div className="mt-0.5 text-xs font-medium" style={{ color: accent }}>
          {data.headline || "Your headline"}
        </div>
      </div>
      <div className="hidden shrink-0 items-center gap-3 text-[11px] text-neutral-500 sm:flex">
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
      className="-mx-6 -mt-6 mb-6 rounded-t-[10px] px-6 py-5 sm:-mx-8 sm:px-8"
      style={{ background: `${accent}14`, borderBottom: `1px solid ${accent}33` }}
    >
      <div className="font-display text-xl font-semibold tracking-tight text-neutral-900">
        {data.fullName || "Your name"}
      </div>
      <div className="mt-0.5 text-xs font-medium" style={{ color: accent }}>
        {data.headline || "Your headline"}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-500">
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
          <p className="mt-2.5 text-[12.5px] leading-relaxed text-neutral-700">
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
                <div className="text-[13px] font-semibold text-neutral-900">
                  {exp.role || "Role"}
                </div>
                <div className="text-[11px] text-neutral-500">
                  {exp.company || "Company"}
                  {exp.location ? ` · ${exp.location}` : ""} ·{" "}
                  {formatRange(exp.startDate, exp.endDate, exp.currentlyWorking)}
                </div>
                {exp.description && (
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-neutral-600">
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
                <div className="text-[12.5px] font-semibold text-neutral-900">
                  {project.title}
                </div>
                {project.description && (
                  <p className="mt-1 text-[11.5px] leading-relaxed text-neutral-600">
                    {project.description}
                  </p>
                )}
                {project.techStack.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-600"
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
                <div className="text-[12.5px] font-semibold text-neutral-900">
                  {edu.degree}
                  {edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}
                </div>
                <div className="text-[11px] text-neutral-500">
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
                className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[10.5px] text-neutral-700"
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
                <span className="text-neutral-700">{lang.name}</span>
                <span className="text-neutral-500">{lang.proficiency}</span>
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
                <div className="text-neutral-700">{cert.name}</div>
                <div className="text-neutral-500">
                  {cert.issuer} · {cert.issueDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5 text-[11px] text-neutral-500">
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
