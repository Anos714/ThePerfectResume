import { requireAuth } from "@/middlewares/requireAuth";
import { Hono } from "hono";
import {
  getProfileController,
  deleteProfileController,
  saveProfileController,
} from "./profiles.controller";
import { zValidator } from "@hono/zod-validator";
import { createProfileSchema } from "./profiles.schema";

const profilesRoutes = new Hono();

profilesRoutes.use("*", requireAuth);

profilesRoutes.get("/", getProfileController);
profilesRoutes.post(
  "/",
  zValidator("json", createProfileSchema),
  saveProfileController,
);
profilesRoutes.delete("/", deleteProfileController);

export default profilesRoutes;
