import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { evaluateBadges, BADGE_MAP } from "@/lib/badges";
import { grantXp } from "@/lib/gamification/xp-service";
import { canSendEmail, generateUnsubscribeUrl } from "@/lib/notification-preferences";
import { sendBadgeEarnedEmail } from "@/lib/email";

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
      completedReferrals,
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
      prisma.referral.count({ where: { referrerId: userId, status: "COMPLETED" } }),
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
      completedReferrals,
    });

    // Fetch existing badges to detect truly new ones
    const existingBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeKey: true, earnedAt: true },
      orderBy: { earnedAt: "asc" },
    });
    const existingKeys = new Set(existingBadges.map((b) => b.badgeKey));

    // Only new badges that weren't already earned
    const trulyNew = eligible.filter((k) => !existingKeys.has(k));

    // Persist newly earned badges
    if (trulyNew.length > 0) {
      await prisma.userBadge.createMany({
        data: trulyNew.map((key) => ({ userId, badgeKey: key })),
        skipDuplicates: true,
      });

      // Grant XP only for truly new badges
      for (const badgeKey of trulyNew) {
        try {
          await grantXp(userId, "BADGE_EARNED", { badgeKey });
        } catch (xpErr) {
          console.error(`Error granting badge XP for ${badgeKey}:`, xpErr);
        }
      }

      // Send email if this is the user's very first badge
      if (existingKeys.size === 0 && trulyNew.length > 0) {
        try {
          const ok = await canSendEmail(userId, "badgeEarned");
          if (ok) {
            const user = await prisma.user.findUnique({
              where: { id: userId },
              select: { email: true, name: true },
            });
            if (user) {
              const firstBadge = BADGE_MAP.get(trulyNew[0]);
              await sendBadgeEarnedEmail({
                to: user.email,
                name: user.name || "sportif",
                badgeName: firstBadge?.labelFr || trulyNew[0],
                badgeDescription: firstBadge?.descriptionFr || "",
                unsubscribeUrl: generateUnsubscribeUrl(userId, "badgeEarned"),
              });
            }
          }
        } catch (emailErr) {
          console.error("[Email] First badge email error:", emailErr);
        }
      }
    }

    // Fetch all earned badges from DB (including newly created)
    const earned = trulyNew.length > 0
      ? await prisma.userBadge.findMany({
          where: { userId },
          select: { badgeKey: true, earnedAt: true },
          orderBy: { earnedAt: "asc" },
        })
      : existingBadges;

    const newlyEarned = trulyNew;

    return NextResponse.json({ earned, newlyEarned });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des badges" },
      { status: 500 }
    );
  }
}
