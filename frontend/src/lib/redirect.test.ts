import { describe, expect, test } from "bun:test";
import { safeRedirect } from "@/lib/redirect";

describe("safeRedirect", () => {
  test("allows site-relative paths", () => {
    expect(safeRedirect("/dashboard")).toBe("/dashboard");
    expect(safeRedirect("/dashboard/resumes?id=1")).toBe(
      "/dashboard/resumes?id=1",
    );
    expect(safeRedirect("/")).toBe("/");
  });

  test("rejects absolute and protocol-relative URLs", () => {
    expect(safeRedirect("https://evil.com")).toBeNull();
    expect(safeRedirect("//evil.com")).toBeNull();
    expect(safeRedirect("/\\evil.com")).toBeNull();
    expect(safeRedirect("//evil.com/dashboard")).toBeNull();
  });

  test("rejects empty values", () => {
    expect(safeRedirect(undefined)).toBeNull();
    expect(safeRedirect(null)).toBeNull();
    expect(safeRedirect("")).toBeNull();
  });
});
