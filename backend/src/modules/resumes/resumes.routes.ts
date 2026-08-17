import { requireAuth } from "@/middlewares/requireAuth";
import { Hono } from "hono";
import * as resumeController from "./resumes.controller";
import { zValidator } from "@hono/zod-validator";
import {
  createResumeSchema,
  updateResumeNameSchema,
  updateResumeSchema,
  updateResumeTemplateSchema,
} from "./resumes.schema";

const resumesRoutes = new Hono();

resumesRoutes.use("/*", requireAuth);
resumesRoutes.get("/", resumeController.getResumesController);
resumesRoutes.get("/:resumeId", resumeController.getResumeByIdController);
resumesRoutes.post(
  "/",
  zValidator("json", createResumeSchema),
  resumeController.createResumeController,
);
resumesRoutes.put(
  "/:resumeId",
  zValidator("json", updateResumeSchema),
  resumeController.updateResumeByIdController,
);
resumesRoutes.delete("/:resumeId", resumeController.deleteResumeByIdController);

// for renaming the resume title
resumesRoutes.patch(
  "/:resumeId/rename",
  zValidator("json", updateResumeNameSchema),
  resumeController.updateResumeNameController,
);

// for chaning the template of a resume
resumesRoutes.patch(
  "/:resumeId/template",
  zValidator("json", updateResumeTemplateSchema),
  resumeController.updateResumeTemplateController,
);

// for changing the resume visibility (toggle isPublished and isPublic)
resumesRoutes.patch(
  "/:resumeId/visibility",
  resumeController.updateResumeVisibilityController,
);

// make a public sharable link for the resume
resumesRoutes.get(
  "/public/:resumeId",
  resumeController.getResumePublicLinkController,
);

export default resumesRoutes;
