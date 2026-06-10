import crypto from "crypto";
import prisma from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// HMAC key for unsubscribe tokens — without a signature anyone could forge
// a token and unsubscribe arbitrary users
const TOKEN_SECRET = process.env.NEXTAUTH_SECRET || "";

function signPayload(payload: string): string {
  return crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(payload)
    .digest("base64url")
    .slice(0, 24);
}

/** All preference keys that can be toggled */
export type PreferenceKey =
  | "photosAvailable"
  | "eventPublished"
  | "supportReply"
  | "badgeEarned"
  | "streakAtRisk"
  | "purchaseReminder"
  | "sortingReminder"
  | "stripeOnboarded"
  | "newSupportMessage"
  | "newSale"
  | "newFollower"
  | "lowCredits"
  | "productUpdates"
  | "referralCompleted"
  | "newsletter";

/**
 * Check if an email can be sent for a given preference key.
 * Returns true by default if no preference record exists (opt-out model).
 */
export async function canSendEmail(userId: string, key: PreferenceKey): Promise<boolean> {
  const pref = await prisma.notificationPreference.findUnique({
    where: { userId },
    select: { [key]: true },
  });

  // No record = all enabled (opt-out model)
  if (!pref) return true;

  return (pref as Record<string, boolean>)[key] !== false;
}

/**
 * Get or create notification preferences for a user (upsert lazy).
 */
export async function getOrCreatePreferences(userId: string) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

/**
 * Generate a one-click unsubscribe URL for a specific preference.
 * Token format: base64url(userId:key).hmacSignature
 */
export function generateUnsubscribeUrl(userId: string, key: PreferenceKey): string {
  const payload = `${userId}:${key}`;
  const encoded = Buffer.from(payload).toString("base64url");
  const token = `${encoded}.${signPayload(payload)}`;
  return `${APP_URL}/api/notifications/unsubscribe?token=${token}`;
}

/**
 * Parse and verify an unsubscribe token back to userId + key.
 * Rejects tokens with a missing or invalid HMAC signature.
 */
export function parseUnsubscribeToken(token: string): { userId: string; key: PreferenceKey } | null {
  try {
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return null;

    const decoded = Buffer.from(encoded, "base64url").toString("utf-8");
    const [userId, key] = decoded.split(":");
    if (!userId || !key) return null;

    const expected = signPayload(decoded);
    if (
      signature.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    ) {
      return null;
    }

    const validKeys: PreferenceKey[] = [
      "photosAvailable", "eventPublished", "supportReply", "badgeEarned",
      "streakAtRisk", "purchaseReminder", "sortingReminder", "stripeOnboarded",
      "newSupportMessage", "newSale", "newFollower", "lowCredits",
      "productUpdates", "referralCompleted", "newsletter",
    ];
    if (!validKeys.includes(key as PreferenceKey)) return null;

    return { userId, key: key as PreferenceKey };
  } catch {
    return null;
  }
}
