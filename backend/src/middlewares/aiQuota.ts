import { Context, Next } from "hono";
import { redisClient } from "@/config/redis";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "@/utils/AppError";
import { PLAN_AI_LIMITS, aiLimitFor } from "@/config/planLimits";

export { PLAN_AI_LIMITS };

const secondsInDay = 60 * 60 * 24;

const quotaKey = (userId: string) => {
  const today = new Date().toISOString().slice(0, 10);
  return `ai-usage:${userId}:${today}`;
};

export const aiQuotaLimiter = async (c: Context, next: Next) => {
  const authUser = c.get("user");

  const [row] = await db
    .select({ plan: users.plan })
    .from(users)
    .where(eq(users.id, authUser.id));

  if (!row) {
    throw AppError.Unauthorized("User not found");
  }

  const limit = aiLimitFor(row.plan);
  const key = quotaKey(authUser.id);

  // `INCR` followed by a separate `EXPIRE` is not atomic: if the process dies
  // between them the counter survives with no TTL and the user is capped
  // forever. `SET NX EX` seeds the key and its expiry in one round-trip, so
  // the expiry is guaranteed the moment the counter exists.
  const seeded = await redisClient.set(key, "1", {
    NX: true,
    EX: secondsInDay,
  });

  const used = seeded === "OK" ? 1 : await redisClient.incr(key);

  if (used > limit) {
    throw AppError.TooManyRequests(
      `Daily AI suggestion limit reached (${limit}). Upgrade your plan for more suggestions.`,
    );
  }

  // Surface usage to the client on every AI response so the UI can render
  // "3 of 50 used today" without an extra round-trip.
  c.header("X-AI-Usage-Used", String(used));
  c.header("X-AI-Usage-Limit", String(limit));
  c.header("X-AI-Plan", row.plan);

  await next();

  // A transient AI failure (e.g. Gemini 503) should not burn the user's
  // daily quota — refund the attempt so retries are free.
  if (c.res.status >= 500) {
    await redisClient.decr(key);
  }
};
