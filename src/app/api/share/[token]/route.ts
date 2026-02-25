import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { s3KeyToPublicPath } from "@/lib/s3";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const shareEvent = await prisma.shareEvent.findUnique({
      where: { shareToken: params.token },
      include: {
        photo: {
          select: {
            id: true,
            thumbnailPath: true,
            webPath: true,
            event: {
              select: {
                id: true,
                name: true,
                date: true,
                location: true,
                sportType: true,
                user: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!shareEvent) {
      return NextResponse.json({ error: "Lien de partage introuvable" }, { status: 404 });
    }

    const imagePath = shareEvent.photo.thumbnailPath || shareEvent.photo.webPath;

    return NextResponse.json({
      photo: {
        id: shareEvent.photo.id,
        imagePath: imagePath ? s3KeyToPublicPath(imagePath) : null,
      },
      event: shareEvent.photo.event,
      viewCount: shareEvent.viewCount,
    });
  } catch (error) {
    console.error("Error fetching share:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
