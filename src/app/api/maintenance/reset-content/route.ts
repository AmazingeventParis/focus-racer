import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * TEMPORARY maintenance endpoint — full content reset (test data wipe).
 * Guarded by CRON_SECRET. To be removed immediately after use.
 * Deletes all events/photos and related content. Keeps users + settings.
 */
export async function POST(request: NextRequest) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete in dependency order to satisfy FK constraints
    const counts: Record<string, number> = {};
    counts.photoReactions = (await prisma.photoReaction.deleteMany({})).count;
    counts.shareEvents = (await prisma.shareEvent.deleteMany({})).count;
    counts.orderItems = (await prisma.orderItem.deleteMany({})).count;
    counts.orders = (await prisma.order.deleteMany({})).count;
    counts.photoFaces = (await prisma.photoFace.deleteMany({})).count;
    counts.bibNumbers = (await prisma.bibNumber.deleteMany({})).count;
    counts.photos = (await prisma.photo.deleteMany({})).count;
    counts.startListEntries = (await prisma.startListEntry.deleteMany({})).count;
    counts.pricePacks = (await prisma.pricePack.deleteMany({})).count;
    counts.eventFavorites = (await prisma.eventFavorite.deleteMany({})).count;
    counts.guestEventFollowers = (await prisma.guestEventFollower.deleteMany({})).count;
    counts.events = (await prisma.event.deleteMany({})).count;

    return NextResponse.json({ ok: true, deleted: counts });
  } catch (error) {
    console.error("[reset-content] Error:", error);
    return NextResponse.json(
      { error: "Reset failed", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
