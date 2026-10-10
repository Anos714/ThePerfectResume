import { Hono } from "hono";
import { requireAuth } from "@/middlewares/requireAuth";
import {
  exportCoverLetterPdfController,
  exportResumeDocxController,
  exportResumePdfController,
} from "./exports.controller";

const exportsRoutes = new Hono();

exportsRoutes.use("*", requireAuth);

// GET /api/v1/exports/cover-letters/:letterId/pdf — export a cover letter
// NOTE: must be registered before the `/:resumeId/pdf` route so the literal
// `cover-letters` segment wins over the param match.
exportsRoutes.get(
  "/cover-letters/:letterId/pdf",
  exportCoverLetterPdfController,
);

// GET /api/v1/exports/:resumeId/pdf
exportsRoutes.get("/:resumeId/pdf", exportResumePdfController);

// GET /api/v1/exports/:resumeId/docx
exportsRoutes.get("/:resumeId/docx", exportResumeDocxController);

export default exportsRoutes;
