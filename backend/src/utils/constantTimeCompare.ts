import { timingSafeEqual } from "node:crypto";

// String comparisons via `!==` short-circuit on the first differing byte, so
// the time they take leaks how much of a secret an attacker guessed right.
// Secrets (refresh-token hashes, OTPs) go through this instead.
//
// Both inputs must be the same length; a length mismatch is itself a failure.
export const constantTimeCompare = (
  a: string,
  b: string,
): boolean => {
  if (a.length !== b.length) return false;

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return timingSafeEqual(bufA, bufB);
};
