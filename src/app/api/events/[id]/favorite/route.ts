import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { grantXp } from "@/lib/gamification/xp-service";
import { recordStreakActivity } from "@/lib/gamification/streak-service";

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

    // Grant XP + record streak for favoriting
    try {
      await grantXp(session.user.id, "EVENT_FAVORITE", { eventId });
      await recordStreakActivity(session.user.id, "favorite");
    } catch (e) {
      console.error("Failed to grant XP for favorite:", e);
    }

    // Notify photographer of new follower
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { userId: true, name: true },
      });
      if (event?.userId && event.userId !== session.user.id) {
        const { canSendEmail, generateUnsubscribeUrl } = await import("@/lib/notification-preferences");
        const ok = await canSendEmail(event.userId, "newFollower");
        if (ok) {
          const [photographer, follower, followerCount] = await Promise.all([
            prisma.user.findUnique({ where: { id: event.userId }, select: { email: true, name: true } }),
            prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } }),
            prisma.eventFavorite.count({ where: { eventId } }),
          ]);
          if (photographer) {
            const { sendNewFollowerEmail } = await import("@/lib/email");
            await sendNewFollowerEmail({
              to: photographer.email,
              name: photographer.name || "photographe",
              followerName: follower?.name || "Un sportif",
              eventName: event.name,
              eventId,
              totalFollowers: followerCount,
              unsubscribeUrl: generateUnsubscribeUrl(event.userId, "newFollower"),
            });
          }
        }
      }
    } catch (followerEmailErr) {
      console.error("[Email] New follower notification error:", followerEmailErr);
    }

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
