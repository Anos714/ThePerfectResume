import puppeteer, { type Browser } from "puppeteer";
import { resumes } from "@/db/schema";
import { findResumeById } from "@/modules/resumes/resumes.repository";
import { AppError } from "@/utils/AppError";
import { renderResumeHTML } from "./resume-html";
import { buildResumeDocx } from "./resume-docx";

type Resume = typeof resumes.$inferSelect;

let browserInstance: Browser | null = null;

const getBrowser = async (): Promise<Browser> => {
  if (!browserInstance || !browserInstance.connected) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
  }
  return browserInstance;
};

const getResumeForExport = async (
  userId: string,
  resumeId: string,
): Promise<Resume> => {
  if (!resumeId) throw AppError.BadRequest("resumeId is required");

  const resume = await findResumeById(userId, resumeId);
  if (!resume) throw AppError.NotFound("Resume not found");

  return resume;
};

const sanitizeFileName = (title: string): string => {
  const cleaned = title
    .trim()
    .replace(/[^a-z0-9 _-]/gi, "")
    .replace(/\s+/g, "_");
  return cleaned || "resume";
};

export const exportResumeToPdfService = async (
  userId: string,
  resumeId: string,
): Promise<{ buffer: Buffer; fileName: string }> => {
  const resume = await getResumeForExport(userId, resumeId);
  const html = renderResumeHTML(resume);

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: "load" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    return {
      buffer: Buffer.from(pdfBuffer),
      fileName: `${sanitizeFileName(resume.resumeTitle)}.pdf`,
    };
  } finally {
    await page.close();
  }
};

export const exportResumeToDocxService = async (
  userId: string,
  resumeId: string,
): Promise<{ buffer: Buffer; fileName: string }> => {
  const resume = await getResumeForExport(userId, resumeId);
  const docxBuffer = await buildResumeDocx(resume);

  return {
    buffer: docxBuffer,
    fileName: `${sanitizeFileName(resume.resumeTitle)}.docx`,
  };
};
