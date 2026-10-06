import DodoPayments from "dodopayments";
import { env } from "./env";

// Test mode hits the sandbox API; live mode hits the real one.
export const dodoClient = new DodoPayments({
  bearerToken: env.DODO_API_KEY,
  webhookKey: env.DODO_WEBHOOK_KEY,
  environment: env.HONO_ENV === "production" ? "live_mode" : "test_mode",
});
