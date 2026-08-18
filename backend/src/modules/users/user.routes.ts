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
  zValidator("json", registerUserSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  registerUserController,
);
userRoutes.post(
  "/login",
  zValidator("json", loginUserSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  loginUserController,
);

userRoutes.post(
  "/verify",
  zValidator("json", verifyUserSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
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
  zValidator("json", resetPasswordSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  resetPasswordController,
);

// user profile routes
userRoutes.post(
  "/change-password",
  requireAuth,
  zValidator("json", changePasswordSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  changePasswordController,
);

userRoutes.post(
  "/auth/google",
  zValidator("json", googleAuthSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  googleAuthController,
);

export default userRoutes;
