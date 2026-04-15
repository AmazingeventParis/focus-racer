import prisma from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
 * Token format: base64url(userId:key)
 */
export function generateUnsubscribeUrl(userId: string, key: PreferenceKey): string {
  const payload = `${userId}:${key}`;
  const token = Buffer.from(payload).toString("base64url");
  return `${APP_URL}/api/notifications/unsubscribe?token=${token}`;
}

/**
 * Parse an unsubscribe token back to userId + key.
 */
export function parseUnsubscribeToken(token: string): { userId: string; key: PreferenceKey } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [userId, key] = decoded.split(":");
    if (!userId || !key) return null;

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
