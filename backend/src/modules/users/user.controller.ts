import {
  ChangePasswordInput,
  ForgotPasswordInput,
  GoogleAuthInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyUserInput,
} from "@/modules/users/auth.schema";
import type { Context, Env } from "hono";
import {
  changePasswordService,
  forgotPasswordService,
  getUserByIdService,
  googleAuthService,
  loginUserService,
  registerUserService,
  resetPasswordService,
  verifyUserService,
} from "./user.service";
import { AuthSuccessResponse } from "./auth.types";
import {
  generateAccessToken,
  generateRefreshToken,
  generateOTP,
  verifyRefreshToken,
  hashRefreshToken,
} from "@/utils/auth";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { env } from "@/config/env";
import { redisClient } from "@/config/redis";
import { sendOTPEmail, sendVerificationEmail } from "@/config/nodemailer";
import { AppError } from "@/utils/AppError";
import { googleClient } from "@/config/google";

// contexts types
type RegisterContext = Context<
  Env,
  string,
  {
    in: { json: RegisterInput };
    out: { json: RegisterInput };
  }
>;

type LoginContext = Context<
  Env,
  string,
  {
    in: { json: LoginInput };
    out: { json: LoginInput };
  }
>;

type VerifyUserContext = Context<
  Env,
  string,
  {
    in: { json: VerifyUserInput };
    out: { json: VerifyUserInput };
  }
>;

type ResetPasswordContext = Context<
  Env,
  string,
  {
    in: { json: ResetPasswordInput };
    out: { json: ResetPasswordInput };
  }
>;

type ForgotPasswordContext = Context<
  Env,
  string,
  {
    in: { json: ForgotPasswordInput };
    out: { json: ForgotPasswordInput };
  }
>;

type ChangePasswordContext = Context<
  Env,
  string,
  {
    in: { json: ChangePasswordInput };
    out: { json: ChangePasswordInput };
  }
>;

type GoogleAuthContext = Context<
  Env,
  string,
  {
    in: { json: GoogleAuthInput };
    out: { json: GoogleAuthInput };
  }
>;

export const registerUserController = async (c: RegisterContext) => {
  const data = c.req.valid("json");

  const newUser = await registerUserService(data);

  // otp
  const otp = generateOTP();

  await redisClient.set(`verify:${newUser.id}`, otp, { EX: 600 });

  await sendVerificationEmail(newUser.email, otp);

  return c.json<AuthSuccessResponse>(
    {
      success: true,
      message:
        "Registration successful! Please check your email for the verification OTP.",
      user: newUser,
    },
    201,
  );
};

export const loginUserController = async (c: LoginContext) => {
  const data = c.req.valid("json");
  const user = await loginUserService(data);
  if (!user.isVerified) {
    const otp = generateOTP();
    await redisClient.set(`verify:${user.id}`, otp, { EX: 600 });
    await sendVerificationEmail(user.email, otp);

    return c.json<AuthSuccessResponse>({
      success: false,
      message:
        "User not verified. Please check your email for the verification OTP.",
      user: user,
    });
  }

  const accessToken = await generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);

  const hashedRefreshToken = hashRefreshToken(refreshToken);
  await redisClient.set(`refresh:${user.id}`, hashedRefreshToken, {
    EX: 60 * 60 * 24 * 7,
  });

  setCookie(c, "refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.HONO_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return c.json<AuthSuccessResponse>(
    {
      success: true,
      message: "Login successful!",
      user: user,
      token: accessToken,
    },
    200,
  );
};

export const verifyUserController = async (c: VerifyUserContext) => {
  const { userId, otp } = c.req.valid("json");

  const storedOtp = await redisClient.get(`verify:${userId}`);

  if (!storedOtp) {
    throw AppError.BadRequest("OTP expired or user not found");
  }

  if (storedOtp !== otp) {
    throw AppError.BadRequest("Invalid OTP");
  }

  const verifiedUser = await verifyUserService(userId);

  // tokens
  const accessToken = await generateAccessToken(verifiedUser.id);
  const refreshToken = await generateRefreshToken(verifiedUser.id);

  // hash refresh token with sha256 using crypto
  const hashedRefreshToken = hashRefreshToken(refreshToken);

  await redisClient.set(`refresh:${verifiedUser.id}`, hashedRefreshToken, {
    EX: 60 * 60 * 24 * 7,
  });

  await redisClient.del(`otp:${userId}`);

  setCookie(c, "refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.HONO_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return c.json<AuthSuccessResponse>(
    {
      success: true,
      message: "Email verified successfully! Welcome aboard",
      user: verifiedUser,
      token: accessToken,
    },
    200,
  );
};

export const refreshTokenController = async (c: Context) => {
  const refreshToken = getCookie(c, "refreshToken");

  if (!refreshToken) {
    throw AppError.Unauthorized("No refresh token provided");
  }

  const payload = await verifyRefreshToken(refreshToken);
  const userId = payload.id as unknown as string;

  const storedHashedRefreshToken = await redisClient.get(`refresh:${userId}`);

  if (!storedHashedRefreshToken) {
    throw AppError.Unauthorized("Invalid refresh token or expired");
  }

  const hashedRefreshToken = hashRefreshToken(refreshToken);

  if (storedHashedRefreshToken !== hashedRefreshToken) {
    await redisClient.del(`refresh:${userId}`);
    throw AppError.Unauthorized("Invalid refresh token");
  }

  const newAccessToken = await generateAccessToken(userId);

  return c.json<AuthSuccessResponse>(
    {
      success: true,
      message: "Refresh token verified successfully",
      token: newAccessToken,
    },
    200,
  );
};

export const forgotPasswordController = async (c: ForgotPasswordContext) => {
  const data = c.req.valid("json");

  const user = await forgotPasswordService(data);

  const otp = generateOTP();
  await redisClient.set(`otp:${user.id}`, otp, { EX: 600 });
  await sendOTPEmail(user.email, otp);

  return c.json<AuthSuccessResponse>(
    { success: true, message: "OTP sent to your email", user: user },
    200,
  );
};

export const resetPasswordController = async (c: ResetPasswordContext) => {
  const data = c.req.valid("json");

  const user = await resetPasswordService(data);

  return c.json<AuthSuccessResponse>(
    { success: true, message: "Password reset successfully" },
    200,
  );
};

export const getMeController = async (c: Context) => {
  const payload = c.get("user");

  const user = await getUserByIdService(payload.id);
  return c.json<AuthSuccessResponse>(
    { success: true, message: "User authenticated", user: user },
    200,
  );
};

export const logoutUserController = async (c: Context) => {
  const payload = c.get("user");
  await redisClient.del(`refresh:${payload.id}`);

  deleteCookie(c, "refreshToken", {
    sameSite: "strict",
    path: "/",
    secure: env.HONO_ENV === "production",
  });
  return c.json<AuthSuccessResponse>(
    { success: true, message: "Logged out successfully" },
    200,
  );
};

export const googleAuthController = async (c: GoogleAuthContext) => {
  const { code } = c.req.valid("json");

  if (!code) {
    throw AppError.BadRequest("Code is required");
  }

  const { tokens } = await googleClient.getToken(code);

  if (!tokens || !tokens.id_token) {
    throw AppError.BadRequest("Failed to retrieve ID token from Google");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const rawPayload = ticket.getPayload();

  if (!rawPayload) {
    throw AppError.BadRequest("Google Authentication failed");
  }

  const payload = rawPayload;

  const user = await googleAuthService(payload);

  if (!user) {
    throw AppError.BadRequest("User not found");
  }

  // tokens
  const accessToken = await generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);

  const hashedRefreshToken = hashRefreshToken(refreshToken);

  await redisClient.set(`refresh:${user.id}`, hashedRefreshToken, {
    EX: 60 * 60 * 24 * 7, // 7 days
  });

  setCookie(c, "refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.HONO_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return c.json<AuthSuccessResponse>(
    {
      success: true,
      message: "User authenticated",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token: accessToken,
    },
    200,
  );
};

export const changePasswordController = async (c: ChangePasswordContext) => {
  const data = c.req.valid("json");
  const payload = c.get("user");
  const user = await changePasswordService(data, payload.id);
  return c.json<AuthSuccessResponse>(
    { success: true, message: "Password changed successfully", user: user },
    200,
  );
};
