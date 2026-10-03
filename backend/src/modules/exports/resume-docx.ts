import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
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
}

interface LanguageItem {
  name?: string;
  proficiency?: string;
}

const asArray = <T>(value: unknown): T[] => {
  if (!Array.isArray(value)) return [];
  return value as T[];
};

const s = (value: unknown): string =>
  value === null || value === undefined ? "" : String(value).trim();

const formatRange = (
  start?: string,
  end?: string,
  currentlyWorking?: boolean,
): string => {
  const startStr = s(start);
  const endStr = currentlyWorking ? "Present" : s(end);
  return [startStr, endStr].filter(Boolean).join(" – ");
};

const sectionHeading = (text: string) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24 })],
  });

export async function buildResumeDocx(resume: Resume): Promise<Buffer> {
  const experience = asArray<ExperienceItem>(resume.experience);
  const education = asArray<EducationItem>(resume.education);
  const projects = asArray<ProjectItem>(resume.projects);
  const certifications = asArray<CertificationItem>(resume.certifications);
  const languages = asArray<LanguageItem>(resume.languages);
  const skills = asArray<string>(resume.skills);

  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: s(resume.fullName) || "Your Name",
          bold: true,
          size: 40,
        }),
      ],
    }),
  );

  if (s(resume.headline)) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: s(resume.headline), italics: true })],
      }),
    );
  }

  const contactBits = [
    s(resume.phoneNumber),
    s(resume.location),
    s(resume.websiteUrl),
    s(resume.linkedinUrl),
    s(resume.githubUrl),
  ].filter(Boolean);

  if (contactBits.length) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: contactBits.join(" • ") })],
      }),
    );
  }

  if (s(resume.summary)) {
    children.push(sectionHeading("Summary"));
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: s(resume.summary) })],
      }),
    );
  }

  if (experience.length) {
    children.push(sectionHeading("Experience"));
    for (const exp of experience) {
      const range = formatRange(
        exp.startDate,
        exp.endDate,
        exp.currentlyWorking,
      );
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 20 },
          children: [
            new TextRun({ text: s(exp.role) || "Role", bold: true }),
          ],
        }),
      );
      children.push(
        new Paragraph({
          spacing: { after: 20 },
          children: [
            new TextRun({
              text: [s(exp.company), s(exp.location)]
                .filter(Boolean)
                .join(" · "),
            }),
            ...(range
              ? [new TextRun({ text: ` — ${range}`, italics: true })]
              : []),
          ],
        }),
      );
      if (s(exp.description)) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: s(exp.description) })],
          }),
        );
      }
    }
  }

  if (projects.length) {
    children.push(sectionHeading("Projects"));
    for (const project of projects) {
      const tech = asArray<string>(project.techStack);
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 20 },
          children: [
            new TextRun({ text: s(project.title) || "Project", bold: true }),
          ],
        }),
      );
      if (s(project.liveLink)) {
        children.push(
          new Paragraph({
            spacing: { after: 20 },
            children: [new TextRun({ text: s(project.liveLink) })],
          }),
        );
      }
      if (s(project.description)) {
        children.push(
          new Paragraph({
            spacing: { after: 20 },
            children: [new TextRun({ text: s(project.description) })],
          }),
        );
      }
      if (tech.length) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: `Tech: ${tech.join(", ")}` })],
          }),
        );
      }
    }
  }

  if (education.length) {
    children.push(sectionHeading("Education"));
    for (const edu of education) {
      const range = formatRange(edu.startYear, edu.endYear);
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 20 },
          children: [
            new TextRun({
              text: [s(edu.degree), s(edu.fieldOfStudy)]
                .filter(Boolean)
                .join(" · "),
              bold: true,
            }),
          ],
        }),
      );
      children.push(
        new Paragraph({
          spacing: { after: 20 },
          children: [
            new TextRun({
              text: [s(edu.school), s(edu.location)]
                .filter(Boolean)
                .join(" · "),
            }),
            ...(range
              ? [new TextRun({ text: ` — ${range}`, italics: true })]
              : []),
          ],
        }),
      );
      if (s(edu.grade)) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: s(edu.grade) })],
          }),
        );
      }
    }
  }

  if (skills.length) {
    children.push(sectionHeading("Skills"));
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: skills.join(", ") })],
      }),
    );
  }

  if (certifications.length) {
    children.push(sectionHeading("Certifications"));
    for (const cert of certifications) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 20 },
          children: [
            new TextRun({ text: s(cert.name) || "Certification", bold: true }),
            ...(s(cert.issuer)
              ? [new TextRun({ text: ` — ${s(cert.issuer)}` })]
              : []),
            ...(s(cert.issueDate)
              ? [new TextRun({ text: ` (${s(cert.issueDate)})` })]
              : []),
          ],
        }),
      );
    }
  }

  if (languages.length) {
    children.push(sectionHeading("Languages"));
    for (const lang of languages) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 20 },
          children: [
            new TextRun({ text: s(lang.name) || "Language", bold: true }),
            ...(s(lang.proficiency)
              ? [new TextRun({ text: ` — ${s(lang.proficiency)}` })]
              : []),
          ],
        }),
      );
    }
  }

  const doc = new Document({
    creator: "ThePerfectResume",
    title: `${s(resume.fullName) || "Resume"} — Resume`,
    sections: [{ properties: {}, children }],
  });

  return await Packer.toBuffer(doc);
}
