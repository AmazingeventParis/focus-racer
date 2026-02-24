import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { evaluatePhotographerBadges } from "@/lib/photographer-badges";

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

    // Persist newly earned badges
    if (eligible.length > 0) {
      await prisma.userBadge.createMany({
        data: eligible.map((key) => ({ userId, badgeKey: key })),
        skipDuplicates: true,
      });
    }

    // Fetch all photographer badges earned by this user
    const photoBadgeKeys = [
      "first_shoot", "eagle_eye", "marathon_image", "golden_photographer",
      "best_seller", "cash_machine", "multi_terrain", "faithful",
      "stripe_connected", "zero_waste",
    ];
    const photographerEarned = await prisma.userBadge.findMany({
      where: { userId, badgeKey: { in: photoBadgeKeys } },
      select: { badgeKey: true, earnedAt: true },
      orderBy: { earnedAt: "asc" },
    });

    const existingKeys = new Set(photographerEarned.map((b) => b.badgeKey));
    const newlyEarned = eligible.filter(
      (k) =>
        !existingKeys.has(k) ||
        photographerEarned.find(
          (b) =>
            b.badgeKey === k &&
            Date.now() - new Date(b.earnedAt).getTime() < 5000
        )
    );

    return NextResponse.json({ earned: photographerEarned, newlyEarned });
  } catch (error) {
    console.error("Error fetching photographer badges:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des badges" },
      { status: 500 }
    );
  }
}
