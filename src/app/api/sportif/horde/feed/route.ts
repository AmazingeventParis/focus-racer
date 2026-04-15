import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { s3KeyToPublicPath } from "@/lib/s3";

// GET — activité récente de la horde (événements des membres)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Get horde members (accepted)
  const horde = await prisma.horde.findUnique({
    where: { ownerId: session.user.id },
    include: {
      members: {
        where: { status: "ACCEPTED" },
        select: { userId: true, user: { select: { name: true, sportifId: true } } },
      },
    },
  });

  if (!horde || horde.members.length === 0) {
    return NextResponse.json([]);
  }

  const memberIds = horde.members.map((m) => m.userId);
  const memberMap = new Map(horde.members.map((m) => [m.userId, m.user]));

  // Find events where horde members have favorites or orders
  const memberFavorites = await prisma.eventFavorite.findMany({
    where: { userId: { in: memberIds } },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          date: true,
          location: true,
          sportType: true,
          coverImage: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Group by event and attach member info
  const eventMap = new Map<string, { event: typeof memberFavorites[0]["event"]; members: { name: string; sportifId: string | null }[] }>();

  for (const fav of memberFavorites) {
    const entry = eventMap.get(fav.eventId);
    const member = memberMap.get(fav.userId);
    if (entry) {
      if (member && !entry.members.find((m) => m.name === member.name)) {
        entry.members.push(member);
      }
    } else {
      eventMap.set(fav.eventId, {
        event: fav.event,
        members: member ? [member] : [],
      });
    }
  }

  const feed = Array.from(eventMap.values()).slice(0, 10).map((item) => ({
    ...item,
    event: {
      ...item.event,
      coverImage: item.event.coverImage ? s3KeyToPublicPath(item.event.coverImage) : null,
    },
  }));

  return NextResponse.json(feed);
}
