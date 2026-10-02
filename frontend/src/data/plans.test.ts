import { describe, expect, test } from "bun:test";
import { plans, getDisplayPrice, templateById } from "./plans";
import { templates } from "./templates";

describe("plans", () => {
  test("has free, pro and career tiers", () => {
    expect(plans.map((p) => p.id)).toEqual(["free", "pro", "career"]);
  });

  test("yearly price is never higher than monthly", () => {
    for (const plan of plans) {
      expect(plan.yearly).toBeLessThanOrEqual(plan.monthly);
    }
  });

  test("only one plan is marked popular", () => {
    expect(plans.filter((p) => p.popular).length).toBe(1);
  });

  test("free plan is always 0", () => {
    const free = plans.find((p) => p.id === "free");
    expect(getDisplayPrice(free!.monthly, free!.yearly, false)).toBe(0);
    expect(getDisplayPrice(free!.monthly, free!.yearly, true)).toBe(0);
  });
});

describe("templateById", () => {
  test("covers every template in the gallery", () => {
    for (const template of templates) {
      expect(templateById[template.id]).toBeTruthy();
    }
  });
});
