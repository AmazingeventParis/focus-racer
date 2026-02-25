import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { evaluateBadges } from "@/lib/badges";
import { grantXp } from "@/lib/gamification/xp-service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    const [
      orderCount,
      photosCount,
      favoritesCount,
      sportTypesRaw,
      hordeData,
      spentAgg,
      userData,
    ] = await Promise.all([
      prisma.order.count({ where: { userId, status: "PAID" } }),
      prisma.orderItem.count({
        where: { order: { userId, status: "PAID" } },
      }),
      prisma.eventFavorite.count({ where: { userId } }),
      prisma.eventFavorite.findMany({
        where: { userId },
        select: { event: { select: { sportType: true } } },
        distinct: ["eventId"],
      }),
      prisma.horde.findUnique({
        where: { ownerId: userId },
        select: {
          members: {
            where: { status: "ACCEPTED" },
            select: { id: true },
          },
        },
      }),
      prisma.order.aggregate({
        where: { userId, status: "PAID" },
        _sum: { totalAmount: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      }),
    ]);

    const distinctSportTypes = new Set(
      sportTypesRaw.map((f) => f.event.sportType)
    ).size;

    const eligible = evaluateBadges({
      orderCount,
      photosCount,
      favoritesCount,
      distinctSportTypes,
      hordeSize: hordeData?.members.length ?? 0,
      totalSpent: spentAgg._sum.totalAmount ?? 0,
      createdAt: userData?.createdAt ?? new Date(),
    });

    // Persist newly earned badges
    if (eligible.length > 0) {
      await prisma.userBadge.createMany({
        data: eligible.map((key) => ({ userId, badgeKey: key })),
        skipDuplicates: true,
      });

      // Grant XP for each newly earned badge
      for (const badgeKey of eligible) {
        try {
          await grantXp(userId, "BADGE_EARNED", { badgeKey });
        } catch (xpErr) {
          console.error(`Error granting badge XP for ${badgeKey}:`, xpErr);
        }
      }
    }

    // Fetch all earned badges from DB
    const earned = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeKey: true, earnedAt: true },
      orderBy: { earnedAt: "asc" },
    });

    const existingKeys = new Set(earned.map((b) => b.badgeKey));
    const newlyEarned = eligible.filter(
      (k) =>
        !existingKeys.has(k) ||
        earned.find(
          (b) =>
            b.badgeKey === k &&
            Date.now() - new Date(b.earnedAt).getTime() < 5000
        )
    );

    return NextResponse.json({ earned, newlyEarned });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des badges" },
      { status: 500 }
    );
  }
}
