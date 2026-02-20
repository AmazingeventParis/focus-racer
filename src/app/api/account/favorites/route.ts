import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Get user's favorite events
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const favorites = await prisma.eventFavorite.findMany({
    where: { userId: session.user.id },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          date: true,
          location: true,
          sportType: true,
          coverImage: true,
          userId: true,
          user: { select: { id: true, name: true } },
          _count: { select: { photos: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ favorites });
}
