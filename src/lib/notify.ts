/**
 * Unified notification dispatcher.
 * Sends both push notifications and SSE events alongside emails.
 * Import this instead of calling sendPushToUser directly in routes.
 */

import { sendPushToUser, sendPushToUsers } from "@/lib/push-notifications";
import { notificationEmitter } from "@/lib/notification-emitter";
import type { PreferenceKey } from "@/lib/notification-preferences";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://focusracer.swipego.app";

// =========== SPORTIF NOTIFICATIONS ===========

/** Photos available for a sportif on an event */
export async function notifyPhotosAvailable(
  userId: string,
  eventName: string,
  photoCount: number,
  eventId: string
) {
  notificationEmitter.notifyUser(userId);
  await sendPushToUser(
    userId,
    {
      title: "Vos photos sont pretes !",
      body: `${photoCount} photo${photoCount > 1 ? "s" : ""} disponible${photoCount > 1 ? "s" : ""} sur ${eventName}`,
      data: { type: "photos_available", eventId, url: `${APP_URL}/events/${eventId}` },
    },
    "photosAvailable"
  );
}

/** Event published notification for followers */
export async function notifyEventPublished(
  followerIds: string[],
  eventName: string,
  eventId: string
) {
  await sendPushToUsers(
    followerIds,
    {
      title: "Nouvel evenement publie",
      body: `${eventName} est maintenant disponible`,
      data: { type: "event_published", eventId, url: `${APP_URL}/events/${eventId}` },
    },
    "eventPublished"
  );
}

/** Badge earned */
export async function notifyBadgeEarned(
  userId: string,
  badgeName: string
) {
  notificationEmitter.notifyUserGamification(userId, { type: "badge_earned", badgeName });
  await sendPushToUser(
    userId,
    {
      title: "Nouveau badge debloque !",
      body: badgeName,
      data: { type: "badge_earned" },
    },
    "badgeEarned"
  );
}

/** Purchase reminder */
export async function notifyPurchaseReminder(
  userId: string,
  eventName: string,
  eventId: string
) {
  await sendPushToUser(
    userId,
    {
      title: "N'oubliez pas vos photos !",
      body: `Vos photos de ${eventName} vous attendent`,
      data: { type: "purchase_reminder", eventId, url: `${APP_URL}/events/${eventId}` },
    },
    "purchaseReminder"
  );
}

// =========== PHOTOGRAPHER / ORGANIZER NOTIFICATIONS ===========

/** New sale notification for photographer */
export async function notifyNewSale(
  photographerId: string,
  amount: string,
  eventName: string
) {
  notificationEmitter.notifyUser(photographerId);
  await sendPushToUser(
    photographerId,
    {
      title: "Nouvelle vente !",
      body: `${amount} sur ${eventName}`,
      data: { type: "new_sale", url: `${APP_URL}/photographer/orders` },
    },
    "newSale"
  );
}

/** New follower */
export async function notifyNewFollower(
  photographerId: string,
  followerName: string
) {
  await sendPushToUser(
    photographerId,
    {
      title: "Nouveau follower",
      body: `${followerName} suit vos evenements`,
      data: { type: "new_follower" },
    },
    "newFollower"
  );
}

/** Stripe Connect onboarded */
export async function notifyStripeOnboarded(userId: string) {
  await sendPushToUser(
    userId,
    {
      title: "Stripe Connect active !",
      body: "Vous pouvez maintenant recevoir des paiements directs",
      data: { type: "stripe_onboarded", url: `${APP_URL}/photographer/orders` },
    },
    "stripeOnboarded"
  );
}

/** Low credits warning */
export async function notifyLowCredits(userId: string, remaining: number) {
  await sendPushToUser(
    userId,
    {
      title: "Credits bientot epuises",
      body: `Il vous reste ${remaining} credit${remaining > 1 ? "s" : ""}`,
      data: { type: "low_credits", url: `${APP_URL}/photographer/credits` },
    },
    "lowCredits"
  );
}

/** Sorting reminder (photos waiting) */
export async function notifySortingReminder(
  userId: string,
  photoCount: number,
  eventName: string
) {
  await sendPushToUser(
    userId,
    {
      title: "Photos en attente de tri",
      body: `${photoCount} photos non triees sur ${eventName}`,
      data: { type: "sorting_reminder" },
    },
    "sortingReminder"
  );
}

// =========== SUPPORT / ADMIN NOTIFICATIONS ===========

/** Support reply received */
export async function notifySupportReply(userId: string, subject: string) {
  notificationEmitter.notifyUser(userId);
  await sendPushToUser(
    userId,
    {
      title: "Reponse du support",
      body: subject,
      data: { type: "support_reply", url: `${APP_URL}/sportif/support` },
    },
    "supportReply"
  );
}

/** New support message for admin */
export async function notifyAdminNewMessage(subject: string) {
  notificationEmitter.notifyAdmin();
  // Push to all admin users
  const { default: prisma } = await import("@/lib/prisma");
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });
  await sendPushToUsers(
    admins.map((a) => a.id),
    {
      title: "Nouveau message support",
      body: subject,
      data: { type: "new_support_message" },
    },
    "newSupportMessage"
  );
}

// =========== HORDE / CHAT ===========

/** New horde chat message */
export async function notifyHordeMessage(
  userId: string,
  senderName: string,
  conversationId: string
) {
  notificationEmitter.notifyUserChat(userId, conversationId);
  await sendPushToUser(userId, {
    title: "Nouveau message",
    body: `${senderName} vous a envoye un message`,
    data: { type: "horde_message", conversationId },
  });
}
