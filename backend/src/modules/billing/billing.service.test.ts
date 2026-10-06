import { describe, expect, mock, test } from "bun:test";
import { Webhook } from "standardwebhooks";
import { env } from "@/config/env";
import { handleWebhookService } from "./billing.service";

// The webhook receiver must verify the Dodo signature before it touches the
// database. Stub the repository so the test exercises the signature check and
// the subscription-sync branching without needing a live Postgres.
mock.module("@/modules/billing/billing.repository", () => ({
  findSubscriptionByUserId: mock(() => Promise.resolve(null)),
  findSubscriptionByDodoCustomerId: mock(() => Promise.resolve(null)),
  updateSubscriptionStatus: mock(() =>
    Promise.resolve({
      userId: "usr_1",
      plan: "pro" as const,
    }),
  ),
  upsertSubscription: mock(() => Promise.resolve(null)),
  setUserPlan: mock(() => Promise.resolve({ id: "usr_1", plan: "pro" })),
}));

const signPayload = (body: string, key: string) => {
  const webhook = new Webhook(key);
  const timestamp = new Date();
  const messageId = "msg_test_1";
  const signature = webhook.sign(messageId, timestamp, body);
  return {
    "webhook-id": messageId,
    "webhook-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
    "webhook-signature": signature,
  };
};

const subscriptionBody = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({
    type: "subscription.active",
    data: {
      subscription_id: "sub_1",
      product_id: env.DODO_PRO_PRODUCT_ID,
      status: "active",
      metadata: { userId: "usr_1", plan: "pro" },
      ...overrides,
    },
  });

describe("handleWebhookService — signature verification", () => {
  test("accepts a payload signed with the configured webhook key", async () => {
    const body = subscriptionBody();
    const result = await handleWebhookService(body, signPayload(body, env.DODO_WEBHOOK_KEY));
    expect(result.received).toBe(true);
  });

  test("rejects a payload signed with the wrong key", () => {
    const body = subscriptionBody();
    const headers = signPayload(body, "d3Jvbmcta2V5LWRldGFpbHM=");
    expect(handleWebhookService(body, headers)).rejects.toThrow();
  });

  test("rejects a payload whose body was tampered after signing", () => {
    const signed = subscriptionBody({ status: "active" });
    const headers = signPayload(signed, env.DODO_WEBHOOK_KEY);
    const tampered = subscriptionBody({ status: "cancelled" });
    expect(handleWebhookService(tampered, headers)).rejects.toThrow();
  });

  test("rejects a payload with no signature headers", () => {
    expect(handleWebhookService(subscriptionBody(), {})).rejects.toThrow();
  });

  test("ignores events we do not act on", async () => {
    const body = JSON.stringify({ type: "payment.succeeded", data: {} });
    const result = await handleWebhookService(
      body,
      signPayload(body, env.DODO_WEBHOOK_KEY),
    );
    expect(result.received).toBe(true);
  });
});
