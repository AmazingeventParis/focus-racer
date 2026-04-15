import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { s3KeyToPublicPath } from "@/lib/s3";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's favorite sport types
    const favorites = await prisma.eventFavorite.findMany({
      where: { userId },
      select: {
        eventId: true,
        event: { select: { sportType: true } },
      },
    });

    const favEventIds = new Set(favorites.map((f) => f.eventId));
    const favSportTypes = [
      ...new Set(favorites.map((f) => f.event.sportType)),
    ];

    const now = new Date();
    let recommendations;

    if (favSportTypes.length > 0) {
      // Recommend events matching user's sport preferences
      recommendations = await prisma.event.findMany({
        where: {
          status: "PUBLISHED",
          date: { gte: now },
          sportType: { in: favSportTypes },
          id: { notIn: [...favEventIds] },
        },
        select: {
          id: true,
          name: true,
          date: true,
          location: true,
          sportType: true,
          coverImage: true,
          _count: { select: { photos: true } },
        },
        orderBy: { date: "asc" },
        take: 6,
      });
    } else {
      // Fallback: most popular events
      recommendations = await prisma.event.findMany({
        where: {
          status: "PUBLISHED",
          date: { gte: now },
          id: { notIn: [...favEventIds] },
        },
        select: {
          id: true,
          name: true,
          date: true,
          location: true,
          sportType: true,
          coverImage: true,
          _count: { select: { photos: true, favorites: true } },
        },
        orderBy: { favorites: { _count: "desc" } },
        take: 6,
      });
    }

    const mapped = recommendations.map((e) => ({
      id: e.id,
      name: e.name,
      date: e.date.toISOString(),
      location: e.location,
      sportType: e.sportType,
      coverImage: e.coverImage ? s3KeyToPublicPath(e.coverImage) : null,
      photoCount: e._count.photos,
    }));

    return NextResponse.json({ recommendations: mapped });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des recommandations" },
      { status: 500 }
    );
  }
}
