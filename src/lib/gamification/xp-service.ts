import { XpActionType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { XP_CONFIG, ACTION_LEADERBOARD_CATEGORIES } from "./xp-config";
import { getXpProgress } from "./levels";
import { notificationEmitter } from "@/lib/notification-emitter";

interface GrantXpResult {
  xpGained: number;
  totalXp: number;
  levelUp: boolean;
  newLevel?: number;
  newLevelName?: string;
}

/**
 * Grant XP to a user for an action.
 * Handles one-time checks, level-up detection, leaderboard updates.
 * Uses role-specific level grids (sportif vs pro).
 */
export async function grantXp(
  userId: string,
  action: XpActionType,
  metadata?: Record<string, string>
): Promise<GrantXpResult | null> {
  const config = XP_CONFIG[action];
  if (!config) return null;

  // Check one-time actions
  if (config.oneTime) {
    const existing = await prisma.xpEvent.findFirst({
      where: { userId, action },
    });
    if (existing) return null;
  }

  // For per-entity one-time actions (e.g., HIGH_OCR_RATE per event)
  if (config.perEntity && metadata?.entityId) {
    const existing = await prisma.xpEvent.findFirst({
      where: {
        userId,
        action,
        metadata: { contains: metadata.entityId },
      },
    });
    if (existing) return null;
  }

  // Fetch user role for role-specific level grid
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) return null;

  const xpAmount = config.xp;

  // Create XP event
  await prisma.xpEvent.create({
    data: {
      userId,
      action,
      xpAmount,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  // Upsert UserLevel
  const firstLevel = getXpProgress(0, user.role);
  const userLevel = await prisma.userLevel.upsert({
    where: { userId },
    create: {
      userId,
      totalXp: xpAmount,
      level: 1,
      levelName: firstLevel.level.name,
      currentLevelXp: xpAmount,
      nextLevelXp: firstLevel.nextLevel?.xpMin ?? 100,
    },
    update: {
      totalXp: { increment: xpAmount },
    },
  });

  const newTotalXp = userLevel.totalXp;
  const oldLevel = userLevel.level;
  const progress = getXpProgress(newTotalXp, user.role);
  const newLevel = progress.level;

  // Update level info
  await prisma.userLevel.update({
    where: { userId },
    data: {
      level: newLevel.level,
      levelName: newLevel.name,
      currentLevelXp: progress.currentLevelXp,
      nextLevelXp: progress.nextLevel?.xpMin ? progress.nextLevel.xpMin - newLevel.xpMin : 0,
    },
  });

  const levelUp = newLevel.level > oldLevel;

  // Update leaderboard entries
  await updateLeaderboard(userId, user.role, action, xpAmount);

  // SSE notifications
  try {
    notificationEmitter.notifyUserGamification(userId, {
      type: "xp_gained",
      action,
      amount: xpAmount,
    });

    if (levelUp) {
      notificationEmitter.notifyUserGamification(userId, {
        type: "level_up",
        newLevel: newLevel.level,
        newName: newLevel.name,
      });

      // Create smart alert for level-up
      await prisma.smartAlert.create({
        data: {
          userId,
          alertType: "LEVEL_UP",
          title: `Niveau ${newLevel.level} atteint !`,
          message: `Félicitations ! Vous êtes maintenant "${newLevel.name}".`,
          metadata: JSON.stringify({ level: newLevel.level, name: newLevel.name }),
        },
      });
    }
  } catch {
    // SSE errors should not block XP granting
  }

  return {
    xpGained: xpAmount,
    totalXp: newTotalXp,
    levelUp,
    newLevel: levelUp ? newLevel.level : undefined,
    newLevelName: levelUp ? newLevel.name : undefined,
  };
}

/**
 * Get full XP summary for a user (role-aware levels).
 */
export async function getUserXpSummary(userId: string) {
  const [userLevel, user] = await Promise.all([
    prisma.userLevel.findUnique({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
  ]);

  const role = user?.role;

  if (!userLevel) {
    const progress = getXpProgress(0, role);
    return {
      totalXp: 0,
      level: 1,
      levelName: progress.level.name,
      progressPercent: 0,
      currentLevelXp: 0,
      xpToNextLevel: progress.nextLevel?.xpMin ?? 100,
      nextLevelName: progress.nextLevel?.name ?? null,
      frame: "none",
      discount: 0,
      perks: [] as string[],
    };
  }

  const progress = getXpProgress(userLevel.totalXp, role);

  return {
    totalXp: userLevel.totalXp,
    level: progress.level.level,
    levelName: progress.level.name,
    progressPercent: progress.progressPercent,
    currentLevelXp: progress.currentLevelXp,
    xpToNextLevel: progress.xpToNextLevel,
    nextLevelName: progress.nextLevel?.name ?? null,
    frame: progress.level.frame,
    discount: progress.level.discount,
    perks: progress.level.perks,
  };
}

/**
 * Get recent XP events for a user.
 */
export async function getRecentXpEvents(userId: string, limit = 10) {
  return prisma.xpEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// Internal: update leaderboard entries (role passed in to avoid duplicate DB query)
async function updateLeaderboard(
  userId: string,
  role: string,
  action: XpActionType,
  xpAmount: number
) {
  const now = new Date();
  const weekNumber = getISOWeekString(now);
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const periods: Array<{ period: "WEEKLY" | "MONTHLY" | "ALL_TIME"; key: string }> = [
    { period: "WEEKLY", key: weekNumber },
    { period: "MONTHLY", key: monthKey },
    { period: "ALL_TIME", key: "all" },
  ];

  for (const { period, key } of periods) {
    // XP category
    await prisma.leaderboardEntry.upsert({
      where: {
        userId_period_periodKey_category: {
          userId,
          period,
          periodKey: key,
          category: "xp",
        },
      },
      create: {
        userId,
        period,
        periodKey: key,
        role: role as "RUNNER",
        category: "xp",
        score: xpAmount,
      },
      update: {
        score: { increment: xpAmount },
        role: role as "RUNNER",
      },
    });

    // Action-specific category
    const category = ACTION_LEADERBOARD_CATEGORIES[action];
    if (category) {
      await prisma.leaderboardEntry.upsert({
        where: {
          userId_period_periodKey_category: {
            userId,
            period,
            periodKey: key,
            category,
          },
        },
        create: {
          userId,
          period,
          periodKey: key,
          role: role as "RUNNER",
          category,
          score: 1,
        },
        update: {
          score: { increment: 1 },
          role: role as "RUNNER",
        },
      });
    }
  }
}

function getISOWeekString(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}
