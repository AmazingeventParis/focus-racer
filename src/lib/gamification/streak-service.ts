import prisma from "@/lib/prisma";
import { grantXp } from "./xp-service";

export interface StreakDef {
  type: string;
  labelFr: string;
  periodDays: number; // 7 for weekly, 30 for monthly
  milestones: number[]; // Streak counts that grant bonus XP
}

export const STREAK_DEFINITIONS: StreakDef[] = [
  { type: "purchase", labelFr: "Achats réguliers", periodDays: 7, milestones: [5, 10, 20, 50] },
  { type: "favorite", labelFr: "Événements suivis", periodDays: 7, milestones: [5, 10, 20, 50] },
  { type: "upload", labelFr: "Uploads réguliers", periodDays: 7, milestones: [5, 10, 20, 50] },
  { type: "publish", labelFr: "Publications régulières", periodDays: 7, milestones: [5, 10, 20, 50] },
  { type: "event_create", labelFr: "Création d'événements", periodDays: 30, milestones: [3, 6, 12] },
];

const STREAK_MAP = new Map(STREAK_DEFINITIONS.map((s) => [s.type, s]));

/**
 * Record a streak activity for a user.
 * Increments the streak if within period, resets if gap.
 */
export async function recordStreakActivity(
  userId: string,
  streakType: string
): Promise<{ currentStreak: number; milestone: boolean } | null> {
  const def = STREAK_MAP.get(streakType);
  if (!def) return null;

  const now = new Date();
  const periodMs = def.periodDays * 24 * 60 * 60 * 1000;

  const existing = await prisma.userStreak.findUnique({
    where: { userId_streakType: { userId, streakType } },
  });

  if (!existing) {
    // First activity for this streak
    const nextDeadline = new Date(now.getTime() + periodMs);
    await prisma.userStreak.create({
      data: {
        userId,
        streakType,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: now,
        nextDeadline,
      },
    });
    return { currentStreak: 1, milestone: false };
  }

  // Check if already counted in current period
  const timeSinceLast = now.getTime() - existing.lastActivityDate.getTime();
  if (timeSinceLast < periodMs * 0.5) {
    // Activity too recent, already counted for this period
    return { currentStreak: existing.currentStreak, milestone: false };
  }

  let newStreak: number;
  if (now <= existing.nextDeadline) {
    // Within deadline — extend streak
    newStreak = existing.currentStreak + 1;
  } else {
    // Missed deadline — reset
    newStreak = 1;
  }

  const newLongest = Math.max(existing.longestStreak, newStreak);
  const nextDeadline = new Date(now.getTime() + periodMs);

  await prisma.userStreak.update({
    where: { userId_streakType: { userId, streakType } },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActivityDate: now,
      nextDeadline,
    },
  });

  // Check milestones
  const isMilestone = def.milestones.includes(newStreak);
  if (isMilestone) {
    await grantXp(userId, "STREAK_BONUS", {
      streakType,
      milestone: String(newStreak),
    });
  }

  return { currentStreak: newStreak, milestone: isMilestone };
}

/**
 * Get all streaks for a user.
 */
export async function getUserStreaks(userId: string) {
  const streaks = await prisma.userStreak.findMany({
    where: { userId },
  });

  return STREAK_DEFINITIONS.map((def) => {
    const streak = streaks.find((s) => s.streakType === def.type);
    return {
      streakType: def.type,
      labelFr: def.labelFr,
      periodDays: def.periodDays,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      lastActivityDate: streak?.lastActivityDate ?? null,
      nextDeadline: streak?.nextDeadline ?? null,
      isActive: streak ? new Date() <= streak.nextDeadline : false,
      nextMilestone: def.milestones.find((m) => m > (streak?.currentStreak ?? 0)) ?? null,
    };
  });
}
