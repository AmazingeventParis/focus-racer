import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { evaluatePhotographerBadges, PHOTOGRAPHER_BADGE_MAP } from "@/lib/photographer-badges";
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

    // Fetch all data needed for badge evaluation in parallel
    const [
      eventsWithPhotos,
      totalPhotosAgg,
      totalPhotosSoldAgg,
      revenueAgg,
      sportTypesRaw,
      userData,
      eventStats,
    ] = await Promise.all([
      // Events with at least 1 photo
      prisma.event.count({
        where: { userId, photos: { some: {} } },
      }),
      // Total photos uploaded
      prisma.photo.count({
        where: { event: { userId } },
      }),
      // Total photos sold
      prisma.orderItem.count({
        where: { order: { event: { userId }, status: "PAID" } },
      }),
      // Total revenue
      prisma.order.aggregate({
        where: { event: { userId }, status: { in: ["PAID", "DELIVERED"] } },
        _sum: { photographerPayout: true },
      }),
      // Distinct sport types
      prisma.event.findMany({
        where: { userId, photos: { some: {} } },
        select: { sportType: true },
        distinct: ["sportType"],
      }),
      // User data (stripe)
      prisma.user.findUnique({
        where: { id: userId },
        select: { stripeOnboarded: true },
      }),
      // Per-event stats for OCR rate and blur rate
      prisma.event.findMany({
        where: { userId, photos: { some: {} } },
        select: {
          id: true,
          _count: { select: { photos: true } },
          photos: {
            select: { isBlurry: true, bibNumbers: { select: { id: true } } },
          },
        },
      }),
    ]);

    // Calculate best OCR rate (% of photos with at least 1 bib)
    let bestOcrRate = 0;
    let bestCleanRate = 0;

    for (const ev of eventStats) {
      const total = ev.photos.length;
      if (total === 0) continue;

      const withBib = ev.photos.filter((p) => p.bibNumbers.length > 0).length;
      const ocrRate = (withBib / total) * 100;
      if (ocrRate > bestOcrRate) bestOcrRate = ocrRate;

      // Zero waste: only count events with 100+ photos
      if (total >= 100) {
        const blurry = ev.photos.filter((p) => p.isBlurry === true).length;
        const cleanRate = ((total - blurry) / total) * 100;
        if (cleanRate > bestCleanRate) bestCleanRate = cleanRate;
      }
    }

    const eligible = evaluatePhotographerBadges({
      eventsWithPhotos,
      totalPhotos: totalPhotosAgg,
      totalPhotosSold: totalPhotosSoldAgg,
      totalRevenue: revenueAgg._sum.photographerPayout ?? 0,
      distinctSportTypes: sportTypesRaw.length,
      stripeOnboarded: userData?.stripeOnboarded ?? false,
      bestOcrRate,
      bestCleanRate,
    });

    // Fetch existing badges to detect truly new ones
    const photoBadgeKeys = [
      "first_shoot", "eagle_eye", "marathon_image", "golden_photographer",
      "best_seller", "cash_machine", "multi_terrain", "faithful",
      "stripe_connected", "zero_waste",
    ];
    const existingBadges = await prisma.userBadge.findMany({
      where: { userId, badgeKey: { in: photoBadgeKeys } },
      select: { badgeKey: true, earnedAt: true },
      orderBy: { earnedAt: "asc" },
    });
    const existingKeys = new Set(existingBadges.map((b) => b.badgeKey));

    const trulyNew = eligible.filter((k) => !existingKeys.has(k));

    // Persist and grant XP only for truly new badges
    if (trulyNew.length > 0) {
      await prisma.userBadge.createMany({
        data: trulyNew.map((key) => ({ userId, badgeKey: key })),
        skipDuplicates: true,
      });

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
              const firstBadge = PHOTOGRAPHER_BADGE_MAP.get(trulyNew[0]);
              await sendBadgeEarnedEmail({
                to: user.email,
                name: user.name || "photographe",
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

    const earned = trulyNew.length > 0
      ? await prisma.userBadge.findMany({
          where: { userId, badgeKey: { in: photoBadgeKeys } },
          select: { badgeKey: true, earnedAt: true },
          orderBy: { earnedAt: "asc" },
        })
      : existingBadges;

    const newlyEarned = trulyNew;

    return NextResponse.json({ earned, newlyEarned });
  } catch (error) {
    console.error("Error fetching photographer badges:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des badges" },
      { status: 500 }
    );
  }
}
