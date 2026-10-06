import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const findSubscriptionByUserId = async (userId: string) => {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));
  return subscription;
};

export const findSubscriptionByDodoId = async (dodoSubscriptionId: string) => {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.dodoSubscriptionId, dodoSubscriptionId));
  return subscription;
};

export const upsertSubscription = async (
  userId: string,
  data: {
    dodoSubscriptionId: string;
    productId: string;
    plan: "free" | "pro" | "career";
    status:
      | "pending"
      | "active"
      | "on_hold"
      | "paused"
      | "cancelled"
      | "failed"
      | "expired"
      | "past_due";
    dodoCustomerId?: string | null;
    currentPeriodStart?: Date | null;
    currentPeriodEnd?: Date | null;
    cancelAtPeriodEnd?: boolean;
  },
) => {
  const existing = await findSubscriptionByUserId(userId);

  if (existing) {
    const [updated] = await db
      .update(subscriptions)
      .set({
        dodoSubscriptionId: data.dodoSubscriptionId,
        productId: data.productId,
        plan: data.plan,
        status: data.status,
        dodoCustomerId: data.dodoCustomerId ?? existing.dodoCustomerId,
        currentPeriodStart: data.currentPeriodStart ?? null,
        currentPeriodEnd: data.currentPeriodEnd ?? null,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
      })
      .where(eq(subscriptions.userId, userId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(subscriptions)
    .values({
      userId,
      dodoSubscriptionId: data.dodoSubscriptionId,
      productId: data.productId,
      plan: data.plan,
      status: data.status,
      dodoCustomerId: data.dodoCustomerId,
      currentPeriodStart: data.currentPeriodStart ?? null,
      currentPeriodEnd: data.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
    })
    .returning();
  return created;
};

export const updateSubscriptionStatus = async (
  dodoSubscriptionId: string,
  data: {
    status?:
      | "pending"
      | "active"
      | "on_hold"
      | "paused"
      | "cancelled"
      | "failed"
      | "expired"
      | "past_due";
    currentPeriodStart?: Date | null;
    currentPeriodEnd?: Date | null;
    cancelAtPeriodEnd?: boolean;
  },
) => {
  const [updated] = await db
    .update(subscriptions)
    .set(data)
    .where(eq(subscriptions.dodoSubscriptionId, dodoSubscriptionId))
    .returning();
  return updated;
};

export const setUserPlan = async (
  userId: string,
  plan: "free" | "pro" | "career",
) => {
  const [updated] = await db
    .update(users)
    .set({ plan })
    .where(eq(users.id, userId))
    .returning({ id: users.id, plan: users.plan });
  return updated;
};

export const findUserByDodoCustomerId = async (dodoCustomerId: string) => {
  const [subscription] = await db
    .select({ userId: subscriptions.userId })
    .from(subscriptions)
    .where(eq(subscriptions.dodoCustomerId, dodoCustomerId));
  return subscription;
};
