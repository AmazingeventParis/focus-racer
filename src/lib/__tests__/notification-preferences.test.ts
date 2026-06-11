import { describe, it, expect, beforeAll } from "vitest";

// Set the HMAC secret before importing the module so TOKEN_SECRET is populated
// (notification-preferences.ts reads process.env.NEXTAUTH_SECRET at module load)
beforeAll(() => {
  process.env.NEXTAUTH_SECRET = "test-hmac-secret-for-vitest";
});

// Dynamic import after env var is set — avoids the module-load-time capture problem
// by deferring until beforeAll has run.  We use a lazy getter pattern below.

let generateUnsubscribeUrl: typeof import("@/lib/notification-preferences").generateUnsubscribeUrl;
let parseUnsubscribeToken: typeof import("@/lib/notification-preferences").parseUnsubscribeToken;

// Vitest runs beforeAll before the describe body, so top-level await in the module
// scope would race.  Instead we import once in a dedicated setup test.
const setup = async () => {
  const mod = await import("@/lib/notification-preferences");
  generateUnsubscribeUrl = mod.generateUnsubscribeUrl;
  parseUnsubscribeToken = mod.parseUnsubscribeToken;
};

describe("HMAC unsubscribe token", () => {
  // Import inside the first test so NEXTAUTH_SECRET is already set
  it("setup: imports module after env var is in place", async () => {
    await setup();
    expect(generateUnsubscribeUrl).toBeDefined();
    expect(parseUnsubscribeToken).toBeDefined();
  });

  it("generateUnsubscribeUrl returns a URL containing a token", () => {
    const url = generateUnsubscribeUrl("user-123", "newsletter");
    expect(url).toContain("/api/notifications/unsubscribe?token=");
  });

  it("round-trip: parseUnsubscribeToken returns userId and key", () => {
    const url = generateUnsubscribeUrl("user-abc", "photosAvailable");
    const token = new URL(url).searchParams.get("token")!;
    const result = parseUnsubscribeToken(token);
    expect(result).not.toBeNull();
    expect(result?.userId).toBe("user-abc");
    expect(result?.key).toBe("photosAvailable");
  });

  it("tampered signature returns null", () => {
    const url = generateUnsubscribeUrl("user-abc", "newsletter");
    const token = new URL(url).searchParams.get("token")!;
    // Flip the last character of the signature to invalidate it
    const tampered = token.slice(0, -1) + (token.endsWith("A") ? "B" : "A");
    expect(parseUnsubscribeToken(tampered)).toBeNull();
  });

  it("token for user A does not verify for user B (cross-user)", () => {
    const urlA = generateUnsubscribeUrl("user-A", "newsletter");
    const tokenA = new URL(urlA).searchParams.get("token")!;

    // Manually craft a token that looks like user-B but reuses user-A's signature
    const [encoded] = tokenA.split(".");
    // Rebuild encoded part for user-B
    const payloadB = Buffer.from("user-B:newsletter").toString("base64url");
    const forgery = `${payloadB}.${tokenA.split(".")[1]}`;

    expect(parseUnsubscribeToken(forgery)).toBeNull();
  });

  it("token with wrong preference key (invalid key) returns null", () => {
    const url = generateUnsubscribeUrl("user-abc", "newsletter");
    const token = new URL(url).searchParams.get("token")!;
    // Swap the encoded payload to contain an invalid key while keeping the signature
    const invalidPayload = Buffer.from("user-abc:NON_EXISTENT_KEY").toString("base64url");
    const [, sig] = token.split(".");
    const forgery = `${invalidPayload}.${sig}`;
    expect(parseUnsubscribeToken(forgery)).toBeNull();
  });

  it("malformed token (no dot separator) returns null", () => {
    expect(parseUnsubscribeToken("nodothere")).toBeNull();
  });

  it("empty token returns null", () => {
    expect(parseUnsubscribeToken("")).toBeNull();
  });
});
