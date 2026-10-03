import { Hono } from "hono";
import { requireAuth } from "@/middlewares/requireAuth";
import {
  exportResumeDocxController,
  exportResumePdfController,
} from "./exports.controller";

const exportsRoutes = new Hono();

exportsRoutes.use("*", requireAuth);

// GET /api/v1/exports/:resumeId/pdf
exportsRoutes.get("/:resumeId/pdf", exportResumePdfController);

// GET /api/v1/exports/:resumeId/docx
exportsRoutes.get("/:resumeId/docx", exportResumeDocxController);

export default exportsRoutes;
