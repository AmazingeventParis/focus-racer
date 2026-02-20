import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Toggle event favorite for the authenticated runner
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const eventId = params.id;

  // Check if already favorited
  const existing = await prisma.eventFavorite.findUnique({
    where: { userId_eventId: { userId: session.user.id, eventId } },
  });

  if (existing) {
    // Remove favorite
    await prisma.eventFavorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  } else {
    // Add favorite
    await prisma.eventFavorite.create({
      data: { userId: session.user.id, eventId },
    });
    return NextResponse.json({ favorited: true });
  }
}

// Check if event is favorited
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ favorited: false });
  }

  const existing = await prisma.eventFavorite.findUnique({
    where: { userId_eventId: { userId: session.user.id, eventId: params.id } },
  });

  return NextResponse.json({ favorited: !!existing });
}
