import admin from "firebase-admin";
import prisma from "@/lib/prisma";
import { canSendEmail, type PreferenceKey } from "@/lib/notification-preferences";

// =========== FIREBASE ADMIN INIT ===========

let firebaseApp: admin.app.App | null = null;

function getFirebaseApp(): admin.app.App | null {
  if (firebaseApp) return firebaseApp;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("[Push] Firebase Admin initialized");
    return firebaseApp;
  } catch (error) {
    console.error("[Push] Firebase Admin init failed:", error);
    return null;
  }
}

// =========== TOKEN MANAGEMENT ===========

export async function registerDeviceToken(
  userId: string,
  token: string,
  platform: string = "android"
): Promise<void> {
  await prisma.deviceToken.upsert({
    where: { token },
    create: { userId, token, platform },
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
 * Send a push notification to a single user.
 * Respects notification preferences (same as email).
 * Silently returns if Firebase is not configured.
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

  const tokens = await getUserTokens(userId);
  if (tokens.length === 0) return 0;

  return sendPushToTokens(tokens, payload);
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

/**
 * Send push to specific FCM tokens.
 * Handles stale token cleanup automatically.
 */
async function sendPushToTokens(
  tokens: string[],
  payload: PushPayload
): Promise<number> {
  const app = getFirebaseApp();
  if (!app) return 0;

  const messaging = admin.messaging(app);

  const message: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data || {},
    android: {
      priority: "high",
      notification: {
        icon: "ic_launcher",
        color: "#10B981",
        channelId: "focus_racer_default",
        sound: "default",
      },
    },
  };

  try {
    const response = await messaging.sendEachForMulticast(message);

    // Cleanup stale tokens
    if (response.failureCount > 0) {
      const staleTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (
          !resp.success &&
          resp.error &&
          (resp.error.code === "messaging/registration-token-not-registered" ||
            resp.error.code === "messaging/invalid-registration-token")
        ) {
          staleTokens.push(tokens[idx]);
        }
      });
      if (staleTokens.length > 0) {
        await prisma.deviceToken.deleteMany({
          where: { token: { in: staleTokens } },
        });
        console.log(`[Push] Cleaned ${staleTokens.length} stale tokens`);
      }
    }

    console.log(
      `[Push] Sent: ${response.successCount}/${tokens.length} (fail: ${response.failureCount})`
    );
    return response.successCount;
  } catch (error) {
    console.error("[Push] Send error:", error);
    return 0;
  }
}
