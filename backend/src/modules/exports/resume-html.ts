import { resumes } from "@/db/schema";

type Resume = typeof resumes.$inferSelect;

interface ExperienceItem {
  company?: string;
  role?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  currentlyWorking?: boolean;
  description?: string;
}

interface EducationItem {
  school?: string;
  degree?: string;
  fieldOfStudy?: string;
  location?: string;
  startYear?: string;
  endYear?: string;
  grade?: string;
}

interface ProjectItem {
  title?: string;
  description?: string;
  techStack?: string[];
  liveLink?: string;
  githubLink?: string;
}

interface CertificationItem {
  name?: string;
  issuer?: string;
  issueDate?: string;
  credentialUrl?: string;
}

interface LanguageItem {
  name?: string;
  proficiency?: string;
}

const esc = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const asArray = <T>(value: unknown): T[] => {
  if (!Array.isArray(value)) return [];
  return value as T[];
};

const formatRange = (
  start?: string,
  end?: string,
  currentlyWorking?: boolean,
): string => {
  const fmt = (v?: string) => (v ? String(v).trim() : "");
  const startStr = fmt(start);
  const endStr = currentlyWorking ? "Present" : fmt(end);
  return [startStr, endStr].filter(Boolean).join(" – ");
};

export function renderResumeHTML(resume: Resume): string {
  const experience = asArray<ExperienceItem>(resume.experience);
  const education = asArray<EducationItem>(resume.education);
  const projects = asArray<ProjectItem>(resume.projects);
  const certifications = asArray<CertificationItem>(resume.certifications);
  const languages = asArray<LanguageItem>(resume.languages);
  const skills = asArray<string>(resume.skills);

  const contactBits = [
    resume.phoneNumber,
    resume.location,
    resume.websiteUrl,
    resume.linkedinUrl,
    resume.githubUrl,
  ].filter((v) => v && String(v).trim() !== "");

  const name = esc(resume.fullName || "Your Name");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${name} — Resume</title>
<style>
  @page { size: A4; margin: 14mm 14mm 14mm 14mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Georgia", "Times New Roman", serif;
    color: #111111;
    font-size: 10.5pt;
    line-height: 1.42;
    margin: 0;
  }
  header { text-align: center; margin-bottom: 14px; }
  h1 {
    font-size: 22pt;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin: 0 0 3px 0;
    font-weight: 700;
  }
  .headline {
    font-size: 11pt;
    color: #444444;
    font-style: italic;
    margin: 0 0 7px 0;
  }
  .contact {
    font-size: 9pt;
    color: #333333;
  }
  .contact span + span::before {
    content: " • ";
    margin: 0 3px;
  }
  h2 {
    font-size: 11pt;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1.5px solid #111111;
    padding-bottom: 2px;
    margin: 16px 0 8px 0;
    page-break-after: avoid;
  }
  .item { margin-bottom: 10px; page-break-inside: avoid; }
  .item:last-child { margin-bottom: 0; }
  .item-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
  .item-title { font-weight: 700; font-size: 10.5pt; }
  .item-sub { color: #333333; font-size: 10pt; }
  .item-date {
    color: #444444;
    font-size: 9.5pt;
    white-space: nowrap;
    font-style: italic;
  }
  .desc { margin-top: 3px; }
  .desc p { margin: 0 0 3px 0; }
  .skills { display: flex; flex-wrap: wrap; gap: 5px 8px; }
  .skills span {
    border: 1px solid #bbbbbb;
    border-radius: 3px;
    padding: 1px 7px;
    font-size: 9.5pt;
  }
  .meta { color: #555555; font-size: 9.5pt; }
  ul { margin: 3px 0 0 0; padding-left: 18px; }
  li { margin-bottom: 2px; }
  .tech { color: #444444; font-size: 9.5pt; margin-top: 2px; }
</style>
</head>
<body>
  <header>
    <h1>${name}</h1>
    ${resume.headline ? `<p class="headline">${esc(resume.headline)}</p>` : ""}
    ${
      contactBits.length
        ? `<div class="contact">${contactBits
            .map((bit) => `<span>${esc(bit)}</span>`)
            .join("")}</div>`
        : ""
    }
  </header>

  ${
    resume.summary
      ? `<section>
        <h2>Summary</h2>
        <p>${esc(resume.summary)}</p>
      </section>`
      : ""
  }

  ${
    experience.length
      ? `<section>
        <h2>Experience</h2>
        ${experience
          .map((exp) => {
            const range = formatRange(
              exp.startDate,
              exp.endDate,
              exp.currentlyWorking,
            );
            return `<div class="item">
              <div class="item-head">
                <div>
                  <div class="item-title">${esc(exp.role || "Role")}</div>
                  <div class="item-sub">${esc(exp.company || "Company")}${
                    exp.location ? ` · ${esc(exp.location)}` : ""
                  }</div>
                </div>
                ${range ? `<div class="item-date">${esc(range)}</div>` : ""}
              </div>
              ${
                exp.description
                  ? `<div class="desc"><p>${esc(exp.description)}</p></div>`
                  : ""
              }
            </div>`;
          })
          .join("")}
      </section>`
      : ""
  }

  ${
    projects.length
      ? `<section>
        <h2>Projects</h2>
        ${projects
          .map((project) => {
            const tech = asArray<string>(project.techStack);
            return `<div class="item">
              <div class="item-head">
                <div>
                  <div class="item-title">${esc(project.title || "Project")}</div>
                  ${
                    project.liveLink
                      ? `<div class="item-sub">${esc(project.liveLink)}</div>`
                      : ""
                  }
                </div>
                ${
                  project.githubLink
                    ? `<div class="item-date">${esc(project.githubLink)}</div>`
                    : ""
                }
              </div>
              ${
                project.description
                  ? `<div class="desc"><p>${esc(project.description)}</p></div>`
                  : ""
              }
              ${
                tech.length
                  ? `<div class="tech">Tech: ${tech.map(esc).join(", ")}</div>`
                  : ""
              }
            </div>`;
          })
          .join("")}
      </section>`
      : ""
  }

  ${
    education.length
      ? `<section>
        <h2>Education</h2>
        ${education
          .map((edu) => {
            const range = formatRange(edu.startYear, edu.endYear);
            return `<div class="item">
              <div class="item-head">
                <div>
                  <div class="item-title">${esc(
                    edu.degree || "Degree",
                  )}${edu.fieldOfStudy ? ` · ${esc(edu.fieldOfStudy)}` : ""}</div>
                  <div class="item-sub">${esc(
                    edu.school || "School",
                  )}${edu.location ? ` · ${esc(edu.location)}` : ""}</div>
                </div>
                ${range ? `<div class="item-date">${esc(range)}</div>` : ""}
              </div>
              ${edu.grade ? `<div class="meta">${esc(edu.grade)}</div>` : ""}
            </div>`;
          })
          .join("")}
      </section>`
      : ""
  }

  ${
    skills.length
      ? `<section>
        <h2>Skills</h2>
        <div class="skills">
          ${skills.map((skill) => `<span>${esc(skill)}</span>`).join("")}
        </div>
      </section>`
      : ""
  }

  ${
    certifications.length
      ? `<section>
        <h2>Certifications</h2>
        <ul>
          ${certifications
            .map(
              (cert) =>
                `<li><strong>${esc(
                  cert.name || "Certification",
                )}</strong> — ${esc(cert.issuer || "")}${
                  cert.issueDate
                    ? ` <span class="meta">(${esc(cert.issueDate)})</span>`
                    : ""
                }</li>`,
            )
            .join("")}
        </ul>
      </section>`
      : ""
  }

  ${
    languages.length
      ? `<section>
        <h2>Languages</h2>
        <ul>
          ${languages
            .map(
              (lang) =>
                `<li><strong>${esc(lang.name || "Language")}</strong> — ${esc(
                  lang.proficiency || "",
                )}</li>`,
            )
            .join("")}
        </ul>
      </section>`
      : ""
  }
</body>
</html>`;
}
