import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { grantXp } from "@/lib/gamification/xp-service";
import { ReactionType } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const photoId = params.id;

    const reactions = await prisma.photoReaction.groupBy({
      by: ["type"],
      where: { photoId },
      _count: true,
    });

    const counts: Record<string, number> = {};
    for (const r of reactions) {
      counts[r.type] = r._count;
    }

    let userReactions: string[] = [];
    if (session?.user?.id) {
      const mine = await prisma.photoReaction.findMany({
        where: { photoId, userId: session.user.id },
        select: { type: true },
      });
      userReactions = mine.map((r) => r.type);
    }

    return NextResponse.json({ counts, userReactions });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { type } = await request.json();
    if (!type || !["LIKE", "LOVE", "FIRE", "WOW"].includes(type)) {
      return NextResponse.json({ error: "Type de réaction invalide" }, { status: 400 });
    }

    const photoId = params.id;
    const userId = session.user.id;

    // Toggle: if exists → delete, if not → create
    const existing = await prisma.photoReaction.findUnique({
      where: { userId_photoId_type: { userId, photoId, type: type as ReactionType } },
    });

    if (existing) {
      await prisma.photoReaction.delete({ where: { id: existing.id } });
      return NextResponse.json({ added: false, type });
    }

    await prisma.photoReaction.create({
      data: { userId, photoId, type: type as ReactionType },
    });

    // Grant XP for reacting
    await grantXp(userId, "PHOTO_REACTION", { photoId, type });

    // Notify photographer
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      select: { event: { select: { userId: true } } },
    });
    if (photo?.event.userId && photo.event.userId !== userId) {
      const { notificationEmitter } = await import("@/lib/notification-emitter");
      notificationEmitter.notifyUserGamification(photo.event.userId, {
        type: "photo_reaction",
        photoId,
        reactionType: type,
      });
    }

    return NextResponse.json({ added: true, type });
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
