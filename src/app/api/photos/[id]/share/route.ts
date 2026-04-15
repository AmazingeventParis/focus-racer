import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { grantXp } from "@/lib/gamification/xp-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const photoId = params.id;
    const body = await request.json().catch(() => ({}));
    const platform = body.platform || null;

    const shareEvent = await prisma.shareEvent.create({
      data: {
        userId: session.user.id,
        photoId,
        platform,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shareUrl = `${appUrl}/share/${shareEvent.shareToken}`;

    // Grant XP
    await grantXp(session.user.id, "PHOTO_SHARED", { photoId, platform: platform || "link" });

    return NextResponse.json({ shareUrl, shareToken: shareEvent.shareToken });
  } catch (error) {
    console.error("Error creating share:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
