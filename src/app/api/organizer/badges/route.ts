import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { evaluateOrganizerBadges } from "@/lib/organizer-badges";
import { grantXp } from "@/lib/gamification/xp-service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    const [
      publishedEvents,
      totalEvents,
      startListAgg,
      sportTypesRaw,
      eventsWithBranding,
      eventYearsRaw,
      eventsWithStartList,
      eventCoverage,
    ] = await Promise.all([
      // Published events
      prisma.event.count({
        where: { userId, status: "PUBLISHED" },
      }),
      // Total events
      prisma.event.count({
        where: { userId },
      }),
      // Total start-list entries
      prisma.startListEntry.count({
        where: { event: { userId } },
      }),
      // Distinct sport types
      prisma.event.findMany({
        where: { userId },
        select: { sportType: true },
        distinct: ["sportType"],
      }),
      // Events with full branding (logo + cover + color)
      prisma.event.count({
        where: {
          userId,
          logoImage: { not: null },
          coverImage: { not: null },
          primaryColor: { not: null },
        },
      }),
      // Event years for veteran badge
      prisma.event.findMany({
        where: { userId },
        select: { date: true },
      }),
      // Events with start-list entries (proxy for import)
      prisma.event.count({
        where: { userId, startListEntries: { some: {} } },
      }),
      // Coverage check: events where all bibs have photos
      prisma.event.findMany({
        where: { userId, status: "PUBLISHED", startListEntries: { some: {} } },
        select: {
          id: true,
          startListEntries: { select: { bibNumber: true } },
          photos: {
            select: { bibNumbers: { select: { number: true } } },
          },
        },
      }),
    ]);

    // Check if any event has full coverage (all bibs have at least 1 photo)
    let hasFullCoverage = false;
    for (const ev of eventCoverage) {
      if (ev.startListEntries.length === 0) continue;
      const bibsWithPhotos = new Set<string>();
      for (const photo of ev.photos) {
        for (const bib of photo.bibNumbers) {
          bibsWithPhotos.add(bib.number);
        }
      }
      const allBibs = new Set(ev.startListEntries.map((e) => e.bibNumber));
      if (allBibs.size > 0 && [...allBibs].every((b) => bibsWithPhotos.has(b))) {
        hasFullCoverage = true;
        break;
      }
    }

    // Active years
    const activeYears = [...new Set(eventYearsRaw.map((e) => new Date(e.date).getFullYear()))];

    // Marketplace applications accepted (proxy for accredited photographers)
    let accreditedPhotographers = 0;
    try {
      accreditedPhotographers = await prisma.marketplaceApplication.count({
        where: { listing: { userId }, status: "ACCEPTED" },
      });
    } catch {
      // MarketplaceApplication might not exist yet
    }

    const eligible = evaluateOrganizerBadges({
      publishedEvents,
      totalStartListEntries: startListAgg,
      totalEvents,
      hasFullCoverage,
      distinctSportTypes: sportTypesRaw.length,
      hasStartListImport: eventsWithStartList > 0,
      accreditedPhotographers,
      hasBranding: eventsWithBranding > 0,
      activeYears,
    });

    // Fetch existing badges to detect truly new ones
    const orgaBadgeKeys = [
      "first_departure", "peloton", "serial_organizer", "full_gallery",
      "data_fan", "pro_importer", "godfather", "multi_discipline",
      "branding_king", "veteran",
    ];
    const existingBadges = await prisma.userBadge.findMany({
      where: { userId, badgeKey: { in: orgaBadgeKeys } },
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
    }

    const earned = trulyNew.length > 0
      ? await prisma.userBadge.findMany({
          where: { userId, badgeKey: { in: orgaBadgeKeys } },
          select: { badgeKey: true, earnedAt: true },
          orderBy: { earnedAt: "asc" },
        })
      : existingBadges;

    const newlyEarned = trulyNew;

    return NextResponse.json({ earned, newlyEarned });
  } catch (error) {
    console.error("Error fetching organizer badges:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des badges" },
      { status: 500 }
    );
  }
}
