import { env } from "@/config/env";
import { sign, verify } from "hono/jwt";
import crypto from "crypto";

export interface JWTPayload {
  id: string;
  type: "access" | "refresh";
  exp: number;
}

export const generateAccessToken = async (userId: string) => {
  const payload = {
    id: userId,
    type: "access",
    exp: Math.floor(Date.now() / 1000) + 60 * 15, //15 min.
  };
  return await sign(payload, env.JWT_ACCESS_SECRET, "HS256");
};

export const generateRefreshToken = async (userId: string) => {
  const payload = {
    id: userId,
    type: "refresh",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, //7 days.
  };
  return await sign(payload, env.JWT_REFRESH_SECRET, "HS256");
};

export const hashRefreshToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const verifyRefreshToken = async (token: string): Promise<JWTPayload> => {
  const payload = await verify(token, env.JWT_REFRESH_SECRET, "HS256");
  return payload as unknown as JWTPayload;
};

export const verifyAccessToken = async (token: string): Promise<JWTPayload> => {
  const payload = await verify(token, env.JWT_ACCESS_SECRET, "HS256");
  return payload as unknown as JWTPayload;
};

export const generateOTP = (): string => {
  const otp = crypto.randomInt(100000, 1000000).toString();
  return otp;
};
