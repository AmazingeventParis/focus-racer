import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

// NOTE: checkRateLimit uses a module-level in-memory Map that persists for the
// lifetime of the Node process (no reset between tests).  Each test therefore
// uses a unique key so windows never overlap across test cases.

let keyCounter = 0;
function uniqueKey(prefix = "test"): string {
  return `${prefix}:${Date.now()}-${++keyCounter}`;
}

describe("checkRateLimit (sliding window)", () => {
  it("allows the first request", () => {
    const result = checkRateLimit(uniqueKey(), { limit: 3 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2); // 3 - 1 used
  });

  it("allows up to the limit and blocks on the next request", () => {
    const key = uniqueKey();
    const config = { limit: 3, windowMs: 60_000 };

    const r1 = checkRateLimit(key, config);
    const r2 = checkRateLimit(key, config);
    const r3 = checkRateLimit(key, config);

    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(true);

    // 4th call exceeds the limit
    const r4 = checkRateLimit(key, config);
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
  });

  it("returns remaining = 0 and a positive resetMs when blocked", () => {
    const key = uniqueKey();
    const config = { limit: 1, windowMs: 60_000 };

    checkRateLimit(key, config); // consume the only slot
    const blocked = checkRateLimit(key, config);

    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetMs).toBeGreaterThan(0);
    expect(blocked.resetMs).toBeLessThanOrEqual(60_000);
  });

  it("counts remaining correctly as slots are consumed", () => {
    const key = uniqueKey();
    const config = { limit: 5, windowMs: 60_000 };

    expect(checkRateLimit(key, config).remaining).toBe(4);
    expect(checkRateLimit(key, config).remaining).toBe(3);
    expect(checkRateLimit(key, config).remaining).toBe(2);
    expect(checkRateLimit(key, config).remaining).toBe(1);
    expect(checkRateLimit(key, config).remaining).toBe(0);
  });

  it("different keys are tracked independently", () => {
    const keyA = uniqueKey("a");
    const keyB = uniqueKey("b");
    const config = { limit: 2, windowMs: 60_000 };

    // Exhaust key A
    checkRateLimit(keyA, config);
    checkRateLimit(keyA, config);
    expect(checkRateLimit(keyA, config).allowed).toBe(false);

    // Key B is untouched and still allowed
    expect(checkRateLimit(keyB, config).allowed).toBe(true);
  });

  it("allows a new request after the window expires", async () => {
    const key = uniqueKey();
    // Use a very short window (50 ms)
    const config = { limit: 1, windowMs: 50 };

    checkRateLimit(key, config); // consume the only slot
    expect(checkRateLimit(key, config).allowed).toBe(false);

    // Wait for the window to expire
    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(checkRateLimit(key, config).allowed).toBe(true);
  });
});
