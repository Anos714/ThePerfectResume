import { Hono } from "hono";
import {
  loginUserController,
  refreshTokenController,
  registerUserController,
  verifyUserController,
} from "./user.controller";
import { zValidator } from "@hono/zod-validator";
import {
  loginUserSchema,
  registerUserSchema,
  verifyUserSchema,
} from "@/modules/users/auth.schema";

const userRoutes = new Hono();

userRoutes.post(
  "/register",
  zValidator("json", registerUserSchema),
  registerUserController,
);
userRoutes.post(
  "/login",
  zValidator("json", loginUserSchema),
  loginUserController,
);

userRoutes.post(
  "/verify",
  zValidator("json", verifyUserSchema),
  verifyUserController,
);

userRoutes.post("/refresh", refreshTokenController);

export default userRoutes;
