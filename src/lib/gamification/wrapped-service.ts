import { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";

export interface WrappedStats {
  year: number;
  role: UserRole;
  // Sportif
  eventsFollowed?: number;
  photosBought?: number;
  totalSpent?: number;
  topSport?: string | null;
  topEvent?: { name: string; photoCount: number } | null;
  badgesEarned?: number;
  levelReached?: number;
  longestStreak?: number;
  reactionsGiven?: number;
  hordeSize?: number;
  // Photographe
  eventsCovered?: number;
  photosUploaded?: number;
  totalRevenue?: number;
  bestSeller?: { eventName: string; soldCount: number } | null;
  avgOcrRate?: number;
  reactionsReceived?: number;
  // Organisateur
  eventsOrganized?: number;
  runnersManaged?: number;
  avgCoverage?: number;
  // Common
  totalXp?: number;
}

/**
 * Generate or return cached wrapped stats for a user.
 */
export async function getWrappedStats(
  userId: string,
  year: number
): Promise<WrappedStats | null> {
  // Check cache
  const existing = await prisma.wrappedRecap.findUnique({
    where: { userId_year_role: { userId, year, role: "RUNNER" } },
  });

  // If generated less than 24h ago, use cache
  if (existing && Date.now() - existing.generatedAt.getTime() < 24 * 60 * 60 * 1000) {
    return JSON.parse(existing.statsJson);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) return null;

  const yearStart = new Date(`${year}-01-01T00:00:00Z`);
  const yearEnd = new Date(`${year + 1}-01-01T00:00:00Z`);

  let stats: WrappedStats;

  if (user.role === "RUNNER") {
    stats = await generateRunnerWrapped(userId, year, yearStart, yearEnd);
  } else if (user.role === "PHOTOGRAPHER") {
    stats = await generatePhotographerWrapped(userId, year, yearStart, yearEnd);
  } else {
    stats = await generateOrganizerWrapped(userId, year, yearStart, yearEnd);
  }

  // Cache
  await prisma.wrappedRecap.upsert({
    where: { userId_year_role: { userId, year, role: user.role } },
    create: {
      userId,
      year,
      role: user.role,
      statsJson: JSON.stringify(stats),
    },
    update: {
      statsJson: JSON.stringify(stats),
      generatedAt: new Date(),
    },
  });

  return stats;
}

async function generateRunnerWrapped(
  userId: string,
  year: number,
  yearStart: Date,
  yearEnd: Date
): Promise<WrappedStats> {
  const [
    eventsFollowed,
    orders,
    badges,
    userLevel,
    longestStreak,
    reactionsGiven,
    hordeSize,
  ] = await Promise.all([
    prisma.eventFavorite.count({
      where: { userId, createdAt: { gte: yearStart, lt: yearEnd } },
    }),
    prisma.order.findMany({
      where: { userId, status: "PAID", createdAt: { gte: yearStart, lt: yearEnd } },
      include: {
        event: { select: { name: true, sportType: true } },
        items: true,
      },
    }),
    prisma.userBadge.count({
      where: { userId, earnedAt: { gte: yearStart, lt: yearEnd } },
    }),
    prisma.userLevel.findUnique({ where: { userId } }),
    prisma.userStreak.findFirst({
      where: { userId },
      orderBy: { longestStreak: "desc" },
    }),
    prisma.photoReaction.count({
      where: { userId, createdAt: { gte: yearStart, lt: yearEnd } },
    }),
    prisma.hordeMember.count({
      where: {
        horde: { ownerId: userId },
        status: "ACCEPTED",
      },
    }),
  ]);

  const photosBought = orders.reduce((sum, o) => sum + o.items.length, 0);
  const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Top sport
  const sportCounts: Record<string, number> = {};
  for (const o of orders) {
    const sport = o.event.sportType;
    sportCounts[sport] = (sportCounts[sport] || 0) + 1;
  }
  const topSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Top event
  const eventCounts: Record<string, { name: string; count: number }> = {};
  for (const o of orders) {
    if (!eventCounts[o.eventId]) {
      eventCounts[o.eventId] = { name: o.event.name, count: 0 };
    }
    eventCounts[o.eventId].count += o.items.length;
  }
  const topEventEntry = Object.values(eventCounts).sort((a, b) => b.count - a.count)[0];
  const topEvent = topEventEntry ? { name: topEventEntry.name, photoCount: topEventEntry.count } : null;

  return {
    year,
    role: "RUNNER",
    eventsFollowed,
    photosBought,
    totalSpent,
    topSport,
    topEvent,
    badgesEarned: badges,
    levelReached: userLevel?.level ?? 1,
    longestStreak: longestStreak?.longestStreak ?? 0,
    reactionsGiven,
    hordeSize,
    totalXp: userLevel?.totalXp ?? 0,
  };
}

async function generatePhotographerWrapped(
  userId: string,
  year: number,
  yearStart: Date,
  yearEnd: Date
): Promise<WrappedStats> {
  const [
    events,
    photosUploaded,
    soldOrders,
    badges,
    userLevel,
    reactionsReceived,
  ] = await Promise.all([
    prisma.event.findMany({
      where: { userId, createdAt: { gte: yearStart, lt: yearEnd } },
      select: { id: true, name: true },
    }),
    prisma.photo.count({
      where: { event: { userId }, createdAt: { gte: yearStart, lt: yearEnd } },
    }),
    prisma.order.findMany({
      where: {
        event: { userId },
        status: "PAID",
        createdAt: { gte: yearStart, lt: yearEnd },
      },
      include: { event: { select: { name: true } }, items: true },
    }),
    prisma.userBadge.count({
      where: { userId, earnedAt: { gte: yearStart, lt: yearEnd } },
    }),
    prisma.userLevel.findUnique({ where: { userId } }),
    prisma.photoReaction.count({
      where: {
        photo: { event: { userId } },
        createdAt: { gte: yearStart, lt: yearEnd },
      },
    }),
  ]);

  const totalRevenue = soldOrders.reduce((sum, o) => sum + o.photographerPayout, 0);

  // Best seller event
  const eventSales: Record<string, { name: string; count: number }> = {};
  for (const o of soldOrders) {
    if (!eventSales[o.eventId]) {
      eventSales[o.eventId] = { name: o.event.name, count: 0 };
    }
    eventSales[o.eventId].count += o.items.length;
  }
  const bestSellerEntry = Object.values(eventSales).sort((a, b) => b.count - a.count)[0];
  const bestSeller = bestSellerEntry
    ? { eventName: bestSellerEntry.name, soldCount: bestSellerEntry.count }
    : null;

  return {
    year,
    role: "PHOTOGRAPHER",
    eventsCovered: events.length,
    photosUploaded,
    totalRevenue,
    bestSeller,
    badgesEarned: badges,
    levelReached: userLevel?.level ?? 1,
    reactionsReceived,
    totalXp: userLevel?.totalXp ?? 0,
  };
}

async function generateOrganizerWrapped(
  userId: string,
  year: number,
  yearStart: Date,
  yearEnd: Date
): Promise<WrappedStats> {
  const [
    events,
    runnersManaged,
    badges,
    userLevel,
  ] = await Promise.all([
    prisma.event.count({
      where: { userId, createdAt: { gte: yearStart, lt: yearEnd } },
    }),
    prisma.startListEntry.count({
      where: { event: { userId, createdAt: { gte: yearStart, lt: yearEnd } } },
    }),
    prisma.userBadge.count({
      where: { userId, earnedAt: { gte: yearStart, lt: yearEnd } },
    }),
    prisma.userLevel.findUnique({ where: { userId } }),
  ]);

  return {
    year,
    role: "ORGANIZER",
    eventsOrganized: events,
    runnersManaged,
    badgesEarned: badges,
    levelReached: userLevel?.level ?? 1,
    totalXp: userLevel?.totalXp ?? 0,
  };
}
