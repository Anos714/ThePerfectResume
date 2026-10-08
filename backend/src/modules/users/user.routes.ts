import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
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
  uploadAvatarController,
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
import { productionAuthLimiter } from "@/middlewares/rateLimiter";
import { AppError } from "@/utils/AppError";

const userRoutes = new Hono();

// The strict 5/5-min limiter guards only the routes that check credentials
// (login, register, verify, password reset, Google code exchange). Mounting it
// on "/users/*" would also throttle /me — called on nearly every dashboard
// load — and /refresh, locking legitimate users out of their own account.
const credentialLimiter = productionAuthLimiter;

userRoutes.post(
  "/register",
  credentialLimiter,
  zValidator("json", registerUserSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  registerUserController,
);
userRoutes.post(
  "/login",
  credentialLimiter,
  zValidator("json", loginUserSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  loginUserController,
);

userRoutes.post(
  "/verify",
  credentialLimiter,
  zValidator("json", verifyUserSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  verifyUserController,
);

userRoutes.post("/refresh", credentialLimiter, refreshTokenController);

userRoutes.get("/me", requireAuth, getMeController);

userRoutes.post("/logout", requireAuth, logoutUserController);
userRoutes.post(
  "/forgot-password",
  credentialLimiter,
  zValidator("json", forgotPasswordSchema),
  forgotPasswordController,
);
userRoutes.post(
  "/reset-password",
  credentialLimiter,
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
  credentialLimiter,
  zValidator("json", googleAuthSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  googleAuthController,
);

// avatar upload (multipart/form-data). The body limit rejects an oversized
// upload before parseBody() buffers it into memory — without it a multi-GB
// body would be read fully into the single Bun process and OOM the API. The
// 6 MB ceiling gives multipart overhead room above the service's 5 MB file cap.
userRoutes.post(
  "/avatar",
  requireAuth,
  bodyLimit({
    maxSize: 6 * 1024 * 1024,
    onError: (c) => {
      throw AppError.BadRequest(
        "Image is too large. Maximum size is 5 MB.",
      );
    },
  }),
  uploadAvatarController,
);

export default userRoutes;
