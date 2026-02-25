import prisma from "@/lib/prisma";
import { notificationEmitter } from "@/lib/notification-emitter";

/**
 * Create a smart alert and optionally notify via SSE.
 */
export async function createSmartAlert(params: {
  userId: string;
  alertType: "PHOTOS_AVAILABLE" | "PURCHASE_REMINDER" | "SORTING_REMINDER" | "WEEKLY_STATS" | "STREAK_AT_RISK" | "BADGE_EARNED" | "LEVEL_UP" | "REFERRAL_COMPLETED";
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  notifySSE?: boolean;
}) {
  const alert = await prisma.smartAlert.create({
    data: {
      userId: params.userId,
      alertType: params.alertType,
      title: params.title,
      message: params.message,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });

  if (params.notifySSE !== false) {
    try {
      notificationEmitter.notifyUserGamification(params.userId, {
        type: "smart_alert",
        alertType: params.alertType,
        alertId: alert.id,
      });
    } catch {
      // SSE errors should not block
    }
  }

  return alert;
}

/**
 * Get unread alerts for a user.
 */
export async function getUnreadAlerts(userId: string, limit = 20) {
  return prisma.smartAlert.findMany({
    where: { userId, read: false },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get all alerts for a user (paginated).
 */
export async function getUserAlerts(userId: string, limit = 50) {
  return prisma.smartAlert.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Mark an alert as read.
 */
export async function markAlertRead(alertId: string, userId: string) {
  return prisma.smartAlert.updateMany({
    where: { id: alertId, userId },
    data: { read: true },
  });
}

/**
 * Process scheduled alerts (called periodically).
 * Checks for streak-at-risk, purchase reminders, sorting reminders.
 */
export async function processScheduledAlerts() {
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

  let alertsCreated = 0;

  // 1. Streak at risk (deadline within 24h)
  const atRiskStreaks = await prisma.userStreak.findMany({
    where: {
      currentStreak: { gt: 0 },
      nextDeadline: { lte: twentyFourHoursFromNow, gt: now },
    },
    include: { user: { select: { id: true } } },
  });

  for (const streak of atRiskStreaks) {
    // Check if alert already sent recently
    const existing = await prisma.smartAlert.findFirst({
      where: {
        userId: streak.userId,
        alertType: "STREAK_AT_RISK",
        createdAt: { gt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        metadata: { contains: streak.streakType },
      },
    });
    if (!existing) {
      await createSmartAlert({
        userId: streak.userId,
        alertType: "STREAK_AT_RISK",
        title: "Série en danger !",
        message: `Votre série de ${streak.currentStreak} semaines est en danger. Effectuez une action avant demain !`,
        metadata: { streakType: streak.streakType, currentStreak: streak.currentStreak },
      });
      alertsCreated++;
    }
  }

  // 2. Purchase reminders (photos available 48h ago, no purchase)
  const eventsWithPhotos = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      uploadCompletedAt: { lte: fortyEightHoursAgo, gt: seventyTwoHoursAgo },
    },
    select: {
      id: true,
      name: true,
      startListEntries: {
        where: { email: { not: null } },
        select: { email: true, firstName: true, bibNumber: true },
      },
    },
  });

  // Batch: collect all emails from start lists, find users in one query
  const allEmails = new Set<string>();
  for (const event of eventsWithPhotos) {
    for (const entry of event.startListEntries) {
      if (entry.email) allEmails.add(entry.email);
    }
  }

  const users = allEmails.size > 0
    ? await prisma.user.findMany({
        where: { email: { in: [...allEmails] } },
        select: { id: true, email: true },
      })
    : [];
  const userByEmail = new Map(users.map((u) => [u.email, u]));

  for (const event of eventsWithPhotos) {
    for (const entry of event.startListEntries) {
      if (!entry.email) continue;
      const user = userByEmail.get(entry.email);
      if (!user) continue;

      // Check if user already purchased for this event
      const hasPurchased = await prisma.order.findFirst({
        where: { userId: user.id, eventId: event.id, status: "PAID" },
      });
      if (hasPurchased) continue;

      // Check if already alerted
      const alerted = await prisma.smartAlert.findFirst({
        where: {
          userId: user.id,
          alertType: "PURCHASE_REMINDER",
          metadata: { contains: event.id },
        },
      });
      if (alerted) continue;

      await createSmartAlert({
        userId: user.id,
        alertType: "PURCHASE_REMINDER",
        title: "Vos photos vous attendent !",
        message: `Vos photos de ${event.name} sont disponibles depuis 48h. Ne les manquez pas !`,
        metadata: { eventId: event.id, eventName: event.name },
        notifySSE: false,
      });
      alertsCreated++;
    }
  }

  // 3. Sorting reminders (uploaded 72h ago, not published)
  const unpublishedEvents = await prisma.event.findMany({
    where: {
      status: "DRAFT",
      uploadCompletedAt: { lte: seventyTwoHoursAgo },
    },
    select: { id: true, name: true, userId: true },
  });

  for (const event of unpublishedEvents) {
    const alerted = await prisma.smartAlert.findFirst({
      where: {
        userId: event.userId,
        alertType: "SORTING_REMINDER",
        metadata: { contains: event.id },
      },
    });
    if (alerted) continue;

    await createSmartAlert({
      userId: event.userId,
      alertType: "SORTING_REMINDER",
      title: "Galerie en attente de publication",
      message: `L'événement "${event.name}" a été uploadé il y a plus de 72h mais n'est pas encore publié.`,
      metadata: { eventId: event.id, eventName: event.name },
      notifySSE: false,
    });
    alertsCreated++;
  }

  return { alertsCreated };
}
