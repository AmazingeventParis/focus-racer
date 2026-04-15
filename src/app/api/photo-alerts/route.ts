import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

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

    // Count current photos per alert
    const enriched = await Promise.all(
      alerts.map(async (alert) => {
        const photoCount = await prisma.photo.count({
          where: {
            eventId: alert.eventId,
            bibNumbers: { some: { number: alert.bibNumber } },
          },
        });

        // Update stored count if changed
        if (photoCount !== alert.photoCount) {
          await prisma.photoAlert.update({
            where: { id: alert.id },
            data: { photoCount },
          });
        }

        return {
          ...alert,
          photoCount,
          hasNewPhotos: photoCount > alert.lastNotifiedCount,
        };
      })
    );

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
