import { Context, Next } from "hono";
import { redisClient } from "@/config/redis";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "@/utils/AppError";

// Daily AI suggestion quota per plan. Every /ai/* endpoint draws from the
// same counter, matching the single aiSuggestionsPerDay shown in the UI.
export const PLAN_AI_LIMITS: Record<string, number> = {
  free: 10,
  pro: 50,
  career: 200,
};

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

  const limit = PLAN_AI_LIMITS[row.plan] ?? PLAN_AI_LIMITS.free;
  const key = quotaKey(authUser.id);

  // Atomic increment: the first write of the day also sets the TTL so the
  // counter resets at midnight rather than accumulating forever.
  const used = await redisClient.incr(key);
  if (used === 1) {
    await redisClient.expire(key, secondsInDay);
  }

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
