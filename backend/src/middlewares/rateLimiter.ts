import { rateLimiter } from "hono-rate-limiter";
import { RedisStore } from "rate-limit-redis";
import { Context } from "hono";
import { AppError } from "@/utils/AppError";
import { redisClient } from "@/config/redis";
import { env } from "@/config/env";

// node-redis speaks `sendCommand(["PING"])`, but rate-limit-redis calls the
// adapter as `sendCommand("PING")`. Bridge the two shapes.
const sendCommand = async (...args: string[]) =>
  (await redisClient.sendCommand(args as never)) as never;

// The store sets each key's TTL itself from windowMs inside its Lua script, so
// there is no ttl option to pass here.
const redisStore = new RedisStore({
  sendCommand,
  prefix: "rate-limit:",
});

// Client IP for rate-limit keys.
//
// `cf-connecting-ip` / `x-real-ip` are only trustworthy when the request
// actually arrives through the proxy that sets them — otherwise any client can
// send a fresh value on every request and get an unlimited supply of buckets,
// defeating the limiter entirely. Only the socket address (set by the OS-level
// peer, which the client cannot forge) is used unless TRUST_PROXY_HEADERS
// explicitly says the deployment terminates connections at a known proxy.
const getProductionClientIP = (c: Context) => {
  if (env.TRUST_PROXY_HEADERS) {
    const forwardedFor =
      c.req.header("cf-connecting-ip") || c.req.header("x-real-ip");
    if (forwardedFor) return forwardedFor;
  }

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
