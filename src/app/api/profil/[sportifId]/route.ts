import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { sportifId: string } }
) {
  try {
    const { sportifId } = params;

    const user = await prisma.user.findUnique({
      where: { sportifId },
      select: {
        id: true,
        name: true,
        sportifId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Profil introuvable" },
        { status: 404 }
      );
    }

    const [favoritesWithSport, hordeData, badges] = await Promise.all([
      prisma.eventFavorite.findMany({
        where: { userId: user.id },
        select: { event: { select: { sportType: true } } },
      }),
      prisma.horde.findUnique({
        where: { ownerId: user.id },
        select: {
          members: {
            where: { status: "ACCEPTED" },
            select: { id: true },
          },
        },
      }),
      prisma.userBadge.findMany({
        where: { userId: user.id },
        select: { badgeKey: true, earnedAt: true },
        orderBy: { earnedAt: "asc" },
      }),
    ]);

    // Sport breakdown
    const sportBreakdown: Record<string, number> = {};
    favoritesWithSport.forEach((f) => {
      const s = f.event.sportType;
      sportBreakdown[s] = (sportBreakdown[s] || 0) + 1;
    });

    return NextResponse.json({
      name: user.name,
      sportifId: user.sportifId,
      memberSince: user.createdAt.toISOString(),
      eventCount: favoritesWithSport.length,
      hordeSize: hordeData?.members.length ?? 0,
      sportBreakdown,
      badges,
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
