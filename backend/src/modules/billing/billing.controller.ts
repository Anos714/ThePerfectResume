import type { Context, Env } from "hono";
import { createCheckoutSchema } from "./billing.schema";
import type { CreateCheckoutInput } from "./billing.schema";
import {
  cancelSubscriptionService,
  createCheckoutService,
  getBillingStatusService,
  handleWebhookService,
} from "./billing.service";

type CreateCheckoutContext = Context<
  Env,
  string,
  { in: { json: CreateCheckoutInput }; out: { json: CreateCheckoutInput } }
>;

// POST /api/v1/billing/checkout — create a dodo subscription checkout session
export const createCheckoutController = async (c: CreateCheckoutContext) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  const result = await createCheckoutService(user.id, data);
  return c.json({ success: true, data: result });
};

// GET /api/v1/billing/status — current plan + subscription state
export const getBillingStatusController = async (c: Context) => {
  const user = c.get("user");
  const result = await getBillingStatusService(user.id);
  return c.json({ success: true, data: result });
};

// POST /api/v1/billing/cancel — cancel the active subscription at period end
export const cancelSubscriptionController = async (c: Context) => {
  const user = c.get("user");
  const result = await cancelSubscriptionService(user.id);
  return c.json({ success: true, data: result });
};

// POST /api/v1/billing/webhook — dodo webhook receiver (no auth; signed)
export const billingWebhookController = async (c: Context) => {
  const rawBody = await c.req.text();
  const headers: Record<string, string> = {};
  c.req.raw.headers.forEach((value, key) => {
    headers[key] = value;
  });
  const result = await handleWebhookService(rawBody, headers);
  return c.json(result);
};
