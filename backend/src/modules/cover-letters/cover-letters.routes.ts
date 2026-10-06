import { requireAuth } from "@/middlewares/requireAuth";
import { Hono } from "hono";
import * as letterController from "./cover-letters.controller";
import { zValidator } from "@hono/zod-validator";
import {
  createCoverLetterSchema,
  updateCoverLetterSchema,
} from "./cover-letters.schema";

const coverLettersRoutes = new Hono();

coverLettersRoutes.use("*", requireAuth);

coverLettersRoutes.get("/", letterController.getCoverLettersController);
coverLettersRoutes.get(
  "/:letterId",
  letterController.getCoverLetterByIdController,
);
coverLettersRoutes.post(
  "/",
  zValidator("json", createCoverLetterSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  letterController.createCoverLetterController,
);
coverLettersRoutes.put(
  "/:letterId",
  zValidator("json", updateCoverLetterSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  letterController.updateCoverLetterController,
);
coverLettersRoutes.delete(
  "/:letterId",
  letterController.deleteCoverLetterController,
);

export default coverLettersRoutes;
