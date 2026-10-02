import { describe, expect, test } from "bun:test";
import { cn } from "@/lib/utils";

describe("cn", () => {
  test("joins truthy classes", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  test("filters out falsy values", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  test("returns empty string when no truthy values", () => {
    expect(cn(null, false, undefined)).toBe("");
  });

  test("handles a single class", () => {
    expect(cn("only")).toBe("only");
  });
});
