import prisma from "@/lib/prisma";
import { canSendEmail, type PreferenceKey } from "@/lib/notification-preferences";

// =========== NTFY CONFIG ===========

const NTFY_URL =
  process.env.NTFY_URL || "https://ntfy-zg0oggs8sskgc00oogs4gog8.swipego.app";

function getUserTopic(userId: string): string {
  return `fr-${userId}`;
}

// =========== TOKEN MANAGEMENT ===========

/**
 * Register a device for push notifications.
 * With ntfy, we just record that the user has an active subscription.
 */
export async function registerDeviceToken(
  userId: string,
  token: string,
  platform: string = "android"
): Promise<void> {
  const topic = getUserTopic(userId);
  await prisma.deviceToken.upsert({
    where: { token: topic },
    create: { userId, token: topic, platform },
    update: { userId, platform, updatedAt: new Date() },
  });
}

export async function unregisterDeviceToken(token: string): Promise<void> {
  await prisma.deviceToken.deleteMany({ where: { token } });
}

export async function getUserTokens(userId: string): Promise<string[]> {
  const tokens = await prisma.deviceToken.findMany({
    where: { userId },
    select: { token: true },
  });
  return tokens.map((t) => t.token);
}

// =========== SEND PUSH ===========

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  icon?: string;
}

/**
 * Publish a notification to a user's ntfy topic.
 * No SDK needed — just an HTTP POST.
 */
async function publishToNtfy(
  topic: string,
  payload: PushPayload
): Promise<boolean> {
  try {
    const url = payload.data?.url;
    const headers: Record<string, string> = {
      Title: payload.title,
      Priority: "default",
      Tags: payload.data?.type || "bell",
    };

    if (url) {
      headers["Click"] = url;
      headers["Actions"] = `view, Ouvrir, ${url}, clear=true`;
    }

    const resp = await fetch(`${NTFY_URL}/${topic}`, {
      method: "POST",
      headers,
      body: payload.body,
    });

    if (!resp.ok) {
      console.error(`[Push] ntfy error ${resp.status}:`, await resp.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Push] ntfy publish error:", error);
    return false;
  }
}

/**
 * Send a push notification to a single user.
 * Respects notification preferences (same as email).
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
  preferenceKey?: PreferenceKey
): Promise<number> {
  // Check preference (same opt-out as email)
  if (preferenceKey) {
    const allowed = await canSendEmail(userId, preferenceKey);
    if (!allowed) return 0;
  }

  // Check if user has any registered devices
  const tokens = await getUserTokens(userId);
  if (tokens.length === 0) return 0;

  // Publish to user's ntfy topic
  const topic = getUserTopic(userId);
  const sent = await publishToNtfy(topic, payload);
  if (sent) {
    console.log(`[Push] Sent to ${topic}`);
  }
  return sent ? 1 : 0;
}

/**
 * Send a push notification to multiple users.
 */
export async function sendPushToUsers(
  userIds: string[],
  payload: PushPayload,
  preferenceKey?: PreferenceKey
): Promise<number> {
  let totalSent = 0;
  for (const userId of userIds) {
    totalSent += await sendPushToUser(userId, payload, preferenceKey);
  }
  return totalSent;
}
