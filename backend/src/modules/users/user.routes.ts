import { Hono } from "hono";
import {
  changePasswordController,
  forgotPasswordController,
  getMeController,
  googleAuthController,
  loginUserController,
  logoutUserController,
  refreshTokenController,
  registerUserController,
  resetPasswordController,
  verifyUserController,
} from "./user.controller";
import { zValidator } from "@hono/zod-validator";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  googleAuthSchema,
  loginUserSchema,
  registerUserSchema,
  resetPasswordSchema,
  verifyUserSchema,
} from "@/modules/users/auth.schema";
import { requireAuth } from "@/middlewares/requireAuth";

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

userRoutes.get("/me", requireAuth, getMeController);

userRoutes.post("/logout", requireAuth, logoutUserController);
userRoutes.post(
  "/forgot-password",
  zValidator("json", forgotPasswordSchema),
  forgotPasswordController,
);
userRoutes.post(
  "/reset-password",
  zValidator("json", resetPasswordSchema),
  resetPasswordController,
);

// user profile routes
userRoutes.post(
  "/change-password",
  requireAuth,
  zValidator("json", changePasswordSchema),
  changePasswordController,
);

userRoutes.post(
  "/auth/google",
  zValidator("json", googleAuthSchema),
  googleAuthController,
);

export default userRoutes;
