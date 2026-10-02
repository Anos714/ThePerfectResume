import { describe, expect, test } from "bun:test";
import { getDisplayPrice } from "./pricing";

describe("getDisplayPrice", () => {
  test("returns monthly price when billing monthly", () => {
    expect(getDisplayPrice(12, 9, false)).toBe(12);
  });

  test("returns yearly-discounted price when billing yearly", () => {
    expect(getDisplayPrice(12, 9, true)).toBe(9);
  });

  test("free plan is always 0", () => {
    expect(getDisplayPrice(0, 0, false)).toBe(0);
    expect(getDisplayPrice(0, 0, true)).toBe(0);
  });
});
