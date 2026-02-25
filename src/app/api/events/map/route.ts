import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sportType = searchParams.get("sportType");
    const year = searchParams.get("year");

    const where: Record<string, unknown> = {
      status: "PUBLISHED",
      latitude: { not: null },
      longitude: { not: null },
    };

    if (sportType) where.sportType = sportType;
    if (year) {
      where.date = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${parseInt(year) + 1}-01-01`),
      };
    }

    const events = await prisma.event.findMany({
      where,
      select: {
        id: true,
        name: true,
        date: true,
        location: true,
        sportType: true,
        latitude: true,
        longitude: true,
        coverImage: true,
        _count: { select: { photos: true } },
      },
      orderBy: { date: "desc" },
      take: 500,
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching map events:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
