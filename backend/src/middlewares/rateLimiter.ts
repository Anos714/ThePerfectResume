import { rateLimiter } from "hono-rate-limiter";
import { RedisStore } from "rate-limit-redis";
import { Context } from "hono";
import { AppError } from "@/utils/AppError";
import Redis from "ioredis";
import { env } from "@/config/env";

const redisClient = new Redis(env.REDIS_URL);

redisClient.on("error", (err) => {
  console.error("Redis Connection Error", err);
});

const redisStore = new RedisStore({
  // @ts-ignore
  sendCommand: async (...args: string[]) => {
    return await redisClient.call(args[0], ...args.slice(1));
  },
  prefix: "rate-limit:",
  ttl: (options: { windowMs: number }) => Math.ceil(options.windowMs / 1000),
});

const getProductionClientIP = (c: Context) => {
  const forwardedFor =
    c.req.header("cf-connecting-ip") || c.req.header("x-real-ip");
  if (forwardedFor) return forwardedFor;

  const connInfo = c.env?.incoming?.socket?.remoteAddress;
  return connInfo || "anonymous user";
};

export const productionAuthLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000,
  limit: 5,
  store: redisStore as any,
  standardHeaders: "draft-7",
  keyGenerator: (c) => `auth:${getProductionClientIP(c)}`,
  handler: (c) => {
    throw AppError.TooManyRequests(
      "Too many security attempts. Locked out for 5 minutes",
    );
  },
});

export const productionGeneralLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  store: redisStore as any,
  standardHeaders: "draft-7",
  keyGenerator: (c) => `gen:${getProductionClientIP(c)}`,
  handler: (c) => {
    throw AppError.TooManyRequests(
      "Too many requests. Locked out for 15 minutes",
    );
  },
});
