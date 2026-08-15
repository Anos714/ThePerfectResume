import {
  LoginInput,
  RegisterInput,
  VerifyUserInput,
} from "@/modules/users/auth.schema";
import type { Context, Env } from "hono";
import { registerUserService, verifyUserService } from "./user.service";
import { AuthSuccessResponse } from "./auth.types";
import {
  generateAccessToken,
  generateRefreshToken,
  generateOTP,
  hashRefreshToken,
  verifyRefreshToken,
} from "@/utils/auth";
import { getCookie, setCookie } from "hono/cookie";
import { env } from "@/config/env";
import { redisClient } from "@/config/redis";
import { sendVerificationEmail } from "@/config/nodemailer";
import { AppError } from "@/utils/AppError";

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

export const loginUserController = async (c: LoginContext) => {};

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
  console.log("refreshToken: ", refreshToken);

  if (!refreshToken) {
    throw AppError.Unauthorized("No refresh token provided");
  }

  const payload = await verifyRefreshToken(refreshToken);
  console.log("payload: ", payload);
  const userId = payload.id as unknown as string;
  console.log("userId: ", userId);

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
