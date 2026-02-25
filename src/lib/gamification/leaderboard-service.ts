import { LeaderboardPeriod, UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";

// Simple in-memory cache (60s TTL)
const cache = new Map<string, { data: unknown; expires: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown, ttlMs = 60000) {
  cache.set(key, { data, expires: Date.now() + ttlMs });
}

export interface LeaderboardRow {
  rank: number;
  userId: string;
  userName: string;
  score: number;
  level: number;
  levelName: string;
  isCurrentUser: boolean;
}

export function getCurrentPeriodKey(period: LeaderboardPeriod): string {
  const now = new Date();
  if (period === "ALL_TIME") return "all";
  if (period === "MONTHLY") {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
  // WEEKLY
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

/**
 * Get leaderboard for a period/category/role.
 */
export async function getLeaderboard(params: {
  period: LeaderboardPeriod;
  category: string;
  role?: UserRole;
  currentUserId?: string;
  limit?: number;
}): Promise<{ entries: LeaderboardRow[]; userRank: LeaderboardRow | null; total: number }> {
  const { period, category, role, currentUserId, limit = 100 } = params;
  const periodKey = getCurrentPeriodKey(period);
  const cacheKey = `lb:${period}:${periodKey}:${category}:${role || "all"}:${limit}`;

  const cached = getCached<{ entries: LeaderboardRow[]; total: number }>(cacheKey);

  let entries: LeaderboardRow[];
  let total: number;

  if (cached) {
    entries = cached.entries;
    total = cached.total;
  } else {
    const where = {
      period,
      periodKey,
      category,
      ...(role ? { role } : {}),
    };

    const [rows, count] = await Promise.all([
      prisma.leaderboardEntry.findMany({
        where,
        orderBy: { score: "desc" },
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, userLevel: { select: { level: true, levelName: true } } },
          },
        },
      }),
      prisma.leaderboardEntry.count({ where }),
    ]);

    entries = rows.map((row, idx) => ({
      rank: idx + 1,
      userId: row.userId,
      userName: row.user.name,
      score: row.score,
      level: row.user.userLevel?.level ?? 1,
      levelName: row.user.userLevel?.levelName ?? "Débutant",
      isCurrentUser: false,
    }));

    total = count;
    setCache(cacheKey, { entries, total });
  }

  // Mark current user
  let userRank: LeaderboardRow | null = null;
  if (currentUserId) {
    const userIdx = entries.findIndex((e) => e.userId === currentUserId);
    if (userIdx >= 0) {
      entries[userIdx].isCurrentUser = true;
      userRank = entries[userIdx];
    } else {
      // User not in top N — find their rank
      const periodKey = getCurrentPeriodKey(period);
      const userEntry = await prisma.leaderboardEntry.findUnique({
        where: {
          userId_period_periodKey_category: {
            userId: currentUserId,
            period,
            periodKey,
            category,
          },
        },
        include: {
          user: {
            select: { name: true, userLevel: { select: { level: true, levelName: true } } },
          },
        },
      });

      if (userEntry) {
        const higherCount = await prisma.leaderboardEntry.count({
          where: {
            period,
            periodKey,
            category,
            ...(role ? { role } : {}),
            score: { gt: userEntry.score },
          },
        });

        userRank = {
          rank: higherCount + 1,
          userId: currentUserId,
          userName: userEntry.user.name,
          score: userEntry.score,
          level: userEntry.user.userLevel?.level ?? 1,
          levelName: userEntry.user.userLevel?.levelName ?? "Débutant",
          isCurrentUser: true,
        };
      }
    }
  }

  return { entries, userRank, total };
}

/**
 * Get categories available for a role.
 */
export function getCategoriesForRole(role: UserRole): { key: string; labelFr: string }[] {
  const base = [{ key: "xp", labelFr: "XP gagné" }];

  switch (role) {
    case "RUNNER":
      return [...base, { key: "photos_bought", labelFr: "Photos achetées" }, { key: "events_followed", labelFr: "Événements suivis" }];
    case "PHOTOGRAPHER":
      return [...base, { key: "photos_sold", labelFr: "Photos vendues" }, { key: "events", labelFr: "Événements couverts" }];
    case "ORGANIZER":
      return [...base, { key: "events", labelFr: "Événements organisés" }];
    default:
      return base;
  }
}
