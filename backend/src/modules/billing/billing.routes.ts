import { Hono } from "hono";
import { requireAuth } from "@/middlewares/requireAuth";
import { zValidator } from "@hono/zod-validator";
import {
  billingWebhookController,
  cancelSubscriptionController,
  createCheckoutController,
  getBillingStatusController,
} from "./billing.controller";
import { createCheckoutSchema } from "./billing.schema";

const billingRoutes = new Hono();

// Webhook receiver is called by dodo server-to-server and is verified via the
// webhook signature, so it must NOT go through requireAuth.
billingRoutes.post("/webhook", billingWebhookController);

billingRoutes.use("*", requireAuth);

// POST /api/v1/billing/checkout — start a subscription checkout
billingRoutes.post(
  "/checkout",
  zValidator("json", createCheckoutSchema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }),
  createCheckoutController,
);

// GET /api/v1/billing/status — current plan + subscription state
billingRoutes.get("/status", getBillingStatusController);

// POST /api/v1/billing/cancel — cancel subscription at period end
billingRoutes.post("/cancel", cancelSubscriptionController);

export default billingRoutes;
