// Daily AI suggestion quota per plan. Every /ai/* endpoint draws from the
// same counter, matching the single aiSuggestionsPerDay shown in the UI.
//
// Kept dependency-free on purpose: importing it must not pull in env/db/redis
// so unit tests can assert quotas without a live environment.
export type Plan = "free" | "pro" | "career";

export const PLAN_AI_LIMITS: Record<Plan, number> = {
  free: 10,
  pro: 50,
  career: 200,
};

export const planFor = (plan: string): Plan =>
  plan in PLAN_AI_LIMITS ? (plan as Plan) : "free";

export const aiLimitFor = (plan: string): number => PLAN_AI_LIMITS[planFor(plan)];
