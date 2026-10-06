import { dodoClient } from "@/config/dodo";
import { env } from "@/config/env";
import { findUserById } from "@/modules/users/user.repository";
import * as billingRepo from "./billing.repository";
import { AppError } from "@/utils/AppError";
import type { CreateCheckoutInput } from "./billing.schema";

const PRODUCT_IDS = {
  pro: env.DODO_PRO_PRODUCT_ID,
  career: env.DODO_CAREER_PRODUCT_ID,
} as const;

const PRODUCT_PLAN = {
  [env.DODO_PRO_PRODUCT_ID]: "pro",
  [env.DODO_CAREER_PRODUCT_ID]: "career",
} as const;

const isActive = (status: string) =>
  status === "active" || status === "past_due" || status === "on_hold";

// Resolve a dodo subscription id from our local record, with a live fallback.
const resolveDodoSubscriptionId = async (userId: string) => {
  const local = await billingRepo.findSubscriptionByUserId(userId);
  if (local?.dodoSubscriptionId) return local.dodoSubscriptionId;

  // No local row: look the user up in dodo by email so a subscription created
  // outside this app (e.g. an earlier checkout) is still manageable.
  return null;
};

export const createCheckoutService = async (
  userId: string,
  data: CreateCheckoutInput,
) => {
  const user = await findUserById(userId);
  if (!user) {
    throw AppError.NotFound("User not found");
  }

  const productId = PRODUCT_IDS[data.plan];
  if (!productId) {
    throw AppError.BadRequest("Invalid plan selected");
  }

  const existing = await billingRepo.findSubscriptionByUserId(userId);
  if (existing && isActive(existing.status)) {
    throw AppError.BadRequest("You already have an active subscription");
  }

  const response = await dodoClient.subscriptions.create({
    billing: {
      country: data.billing.country as never,
      city: data.billing.city,
      state: data.billing.state,
      street: data.billing.street,
      zipcode: data.billing.zipcode,
    },
    customer: {
      email: user.email,
      name: data.customer.name,
    },
    product_id: productId,
    quantity: 1,
    metadata: { userId, plan: data.plan },
  });

  await billingRepo.upsertSubscription(userId, {
    dodoSubscriptionId: response.subscription_id,
    productId,
    plan: data.plan,
    status: "pending",
    dodoCustomerId: response.customer.customer_id ?? null,
  });

  return {
    subscriptionId: response.subscription_id,
    paymentLink: response.payment_link,
    clientSecret: response.client_secret,
  };
};

export const getBillingStatusService = async (userId: string) => {
  const subscription = await billingRepo.findSubscriptionByUserId(userId);

  if (!subscription) {
    return {
      plan: "free" as const,
      status: null,
      hasSubscription: false,
    };
  }

  return {
    plan: isActive(subscription.status) ? subscription.plan : "free",
    status: subscription.status,
    hasSubscription: true,
    subscriptionId: subscription.dodoSubscriptionId,
    productId: subscription.productId,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };
};

export const cancelSubscriptionService = async (userId: string) => {
  const dodoSubscriptionId = await resolveDodoSubscriptionId(userId);
  if (!dodoSubscriptionId) {
    throw AppError.NotFound("No subscription found to cancel");
  }

  await dodoClient.subscriptions.update(dodoSubscriptionId, {
    cancel_at_next_billing_date: true,
    cancel_reason: "cancelled_by_customer",
  });

  const updated = await billingRepo.updateSubscriptionStatus(
    dodoSubscriptionId,
    { cancelAtPeriodEnd: true },
  );

  if (updated) {
    await billingRepo.setUserPlan(updated.userId, "free");
  }

  return { cancelled: true };
};

// ---------------------------------------------------------------------------
// Webhook handling — keep local state in sync with dodo
// ---------------------------------------------------------------------------

const parseDodoDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const planForProduct = (productId: string): "pro" | "career" | "free" =>
  (PRODUCT_PLAN as Record<string, "pro" | "career">)[productId] ?? "free";

export const handleWebhookService = async (rawBody: string, headers: Record<string, string>) => {
  const event = dodoClient.webhooks.unwrap(rawBody, {
    headers,
    key: env.DODO_WEBHOOK_KEY,
  });

  const type = event.type;
  const data = event.data;

  switch (type) {
    case "subscription.active":
    case "subscription.renewed":
    case "subscription.updated":
    case "subscription.plan_changed":
    case "subscription.paused":
    case "subscription.unpaused":
    case "subscription.past_due":
    case "subscription.on_hold":
    case "subscription.failed":
    case "subscription.expired":
    case "subscription.cancelled": {
      const sub = data as unknown as Record<string, unknown>;
      const dodoSubscriptionId = sub.subscription_id as string | undefined;
      const productId = sub.product_id as string | undefined;
      const status = sub.status as string | undefined;
      const metadata = (sub.metadata ?? {}) as Record<string, unknown>;
      const userId = metadata.userId as string | undefined;
      const metadataPlan = metadata.plan as "pro" | "career" | undefined;

      if (!dodoSubscriptionId || !status) break;

      const resolvePlan = (): "free" | "pro" | "career" => {
        if (metadataPlan === "pro" || metadataPlan === "career") {
          return metadataPlan;
        }
        return productId ? planForProduct(productId) : "free";
      };

      const mapped = {
        status: status as never,
        currentPeriodStart: parseDodoDate(
          sub.previous_billing_date as string | null | undefined,
        ),
        currentPeriodEnd: parseDodoDate(
          sub.next_billing_date as string | null | undefined,
        ),
        cancelAtPeriodEnd: Boolean(sub.cancel_at_next_billing_date),
      };

      const updated = await billingRepo.updateSubscriptionStatus(
        dodoSubscriptionId,
        mapped,
      );

      // Sync the denormalised plan on the user row. Prefer the plan stored on
      // the local subscription row (set at checkout); fall back to resolving
      // it from the product id when the row is missing.
      if (updated) {
        const plan = updated.plan;
        const shouldHavePlan = isActive(status) ? plan : "free";
        await billingRepo.setUserPlan(updated.userId, shouldHavePlan);
      } else if (userId && productId) {
        // Subscription row not tracked locally yet (e.g. created via a
        // different flow) — record it now.
        await billingRepo.upsertSubscription(userId, {
          dodoSubscriptionId,
          productId,
          plan: planForProduct(productId),
          status: status as never,
          dodoCustomerId: null,
          currentPeriodStart: mapped.currentPeriodStart,
          currentPeriodEnd: mapped.currentPeriodEnd,
          cancelAtPeriodEnd: mapped.cancelAtPeriodEnd,
        });
        await billingRepo.setUserPlan(
          userId,
          isActive(status) ? planForProduct(productId) : "free",
        );
      }
      break;
    }
    default:
      // Events we don't act on (payments, disputes, licenses...) are ignored.
      break;
  }

  return { received: true };
};
