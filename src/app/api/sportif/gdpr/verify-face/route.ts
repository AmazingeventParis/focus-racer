import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { s3KeyToPublicPath } from "@/lib/s3";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const selfie = formData.get("selfie") as File | null;
    const eventId = formData.get("eventId") as string | null;

    if (!selfie || !eventId) {
      return NextResponse.json({ error: "Selfie et événement requis" }, { status: 400 });
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, name: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
    }

    // Import Rekognition dynamically
    const { searchFaceByImage } = await import("@/lib/rekognition");

    const bytes = await selfie.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Search for matching faces
    const matches = await searchFaceByImage(buffer);

    if (!matches || matches.length === 0) {
      return NextResponse.json({
        verified: false,
        message: "Aucun visage correspondant trouvé dans cet événement",
        photos: [],
      });
    }

    // Get matching face IDs
    const faceIds = matches.map((m) => m.faceId).filter(Boolean);

    // Find photos in this event that match these faces
    const photoFaces = await prisma.photoFace.findMany({
      where: {
        faceId: { in: faceIds },
        photo: { eventId },
      },
      include: {
        photo: {
          select: {
            id: true,
            thumbnailPath: true,
            webPath: true,
            originalName: true,
          },
        },
      },
    });

    const uniquePhotos = new Map<string, typeof photoFaces[0]["photo"]>();
    for (const pf of photoFaces) {
      uniquePhotos.set(pf.photo.id, pf.photo);
    }

    const photos = Array.from(uniquePhotos.values()).map((p) => ({
      id: p.id,
      name: p.originalName,
      thumbnail: p.thumbnailPath ? s3KeyToPublicPath(p.thumbnailPath) : null,
    }));

    return NextResponse.json({
      verified: true,
      message: `${photos.length} photo(s) vous correspondant trouvée(s)`,
      photos,
    });
  } catch (error) {
    console.error("GDPR verify-face error:", error);
    return NextResponse.json({ error: "Erreur lors de la vérification faciale" }, { status: 500 });
  }
}
