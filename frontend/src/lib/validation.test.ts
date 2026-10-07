import { describe, expect, test } from "bun:test";
import {
  USERNAME_MIN_LENGTH,
  isValidEmail,
  isValidPassword,
  passwordRequirements,
} from "@/lib/validation";

describe("isValidEmail", () => {
  test("accepts well-formed addresses", () => {
    expect(isValidEmail("alex@example.com")).toBe(true);
    expect(isValidEmail("a.b+tag@sub.domain.co")).toBe(true);
  });

  test("rejects malformed addresses", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("alex@example")).toBe(false);
    expect(isValidEmail("alex@@example.com")).toBe(false);
    expect(isValidEmail("alex @example.com")).toBe(false);
    expect(isValidEmail("example.com")).toBe(false);
  });
});

describe("isValidPassword", () => {
  test("passes only when every requirement is met", () => {
    expect(isValidPassword("Passw0rd!")).toBe(true);
    expect(isValidPassword("Abc12345!")).toBe(true);
  });

  test("fails when a requirement is missing", () => {
    expect(isValidPassword("")).toBe(false);
    expect(isValidPassword("short1!")).toBe(false); // too short
    expect(isValidPassword("password1!")).toBe(false); // no uppercase
    expect(isValidPassword("PASSWORD1!")).toBe(false); // no lowercase
    expect(isValidPassword("Password!")).toBe(false); // no number
    expect(isValidPassword("Password1")).toBe(false); // no special char
  });

  test("the requirement list covers the same rule as isValidPassword", () => {
    const sample = "Passw0rd!";
    expect(passwordRequirements.every((r) => r.test(sample))).toBe(
      isValidPassword(sample),
    );
    expect(passwordRequirements).toHaveLength(4);
  });
});

describe("USERNAME_MIN_LENGTH", () => {
  test("matches the backend minimum", () => {
    expect(USERNAME_MIN_LENGTH).toBe(3);
  });
});
