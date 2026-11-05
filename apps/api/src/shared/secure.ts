import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Constant-time string comparison. Both sides are hashed first so the comparison takes the same
 * time whatever the lengths are. An empty expected value never matches (unconfigured secret).
 */
export function safeEqual(given: string | undefined | null, expected: string | undefined | null): boolean {
  if (!given || !expected) return false;
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
