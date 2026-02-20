import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Get user's favorite events
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
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
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ favorites });
}
