import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { buildAlertCounts } from "@/lib/alert-counts";

const createSchema = z.object({
  eventId: z.string(),
  bibNumber: z.string().min(1, "Numéro de dossard requis"),
});

// GET: list user's alerts with current photo counts
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const alerts = await prisma.photoAlert.findMany({
      where: { userId: session.user.id },
      include: {
        event: {
          select: { id: true, name: true, date: true, location: true, sportType: true, coverImage: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Batch all photo counts in one query instead of N separate photo.count calls
    let countMap = new Map<string, number>();
    if (alerts.length > 0) {
      const uniqueEventIds = [...new Set(alerts.map((a) => a.eventId))];
      const uniqueBibNumbers = [...new Set(alerts.map((a) => a.bibNumber))];

      const photosForAlerts = await prisma.photo.findMany({
        where: {
          eventId: { in: uniqueEventIds },
          bibNumbers: { some: { number: { in: uniqueBibNumbers } } },
        },
        select: {
          eventId: true,
          bibNumbers: {
            select: { number: true },
            where: { number: { in: uniqueBibNumbers } },
          },
        },
      });

      countMap = buildAlertCounts(photosForAlerts, alerts);
    }

    // Enrich alerts with current counts (no DB calls inside map)
    const enriched = alerts.map((alert) => {
      const photoCount = countMap.get(`${alert.eventId}::${alert.bibNumber}`) ?? 0;
      return {
        ...alert,
        photoCount,
        hasNewPhotos: photoCount > alert.lastNotifiedCount,
      };
    });

    // Persist count changes in one batched transaction (skip if nothing changed)
    const staleUpdates = alerts
      .map((alert, i) => ({ alert, newCount: enriched[i].photoCount }))
      .filter(({ alert, newCount }) => newCount !== alert.photoCount)
      .map(({ alert, newCount }) =>
        prisma.photoAlert.update({
          where: { id: alert.id },
          data: { photoCount: newCount },
        })
      );

    if (staleUpdates.length > 0) {
      await prisma.$transaction(staleUpdates);
    }

    // Count total unread (new photos across all alerts)
    const unreadCount = enriched.filter((a) => a.hasNewPhotos).length;

    return NextResponse.json({ alerts: enriched, unreadCount });
  } catch (error) {
    console.error("Error fetching photo alerts:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST: create a new photo alert
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    // Check event exists
    const event = await prisma.event.findUnique({
      where: { id: data.eventId, status: "PUBLISHED" },
    });
    if (!event) {
      return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 });
    }

    // Count existing photos for this bib
    const photoCount = await prisma.photo.count({
      where: {
        eventId: data.eventId,
        bibNumbers: { some: { number: data.bibNumber } },
      },
    });

    // Upsert alert
    const alert = await prisma.photoAlert.upsert({
      where: {
        userId_eventId_bibNumber: {
          userId: session.user.id,
          eventId: data.eventId,
          bibNumber: data.bibNumber,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        eventId: data.eventId,
        bibNumber: data.bibNumber,
        photoCount,
        lastNotifiedCount: photoCount,
      },
    });

    return NextResponse.json({ alert, photoCount });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error creating photo alert:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
