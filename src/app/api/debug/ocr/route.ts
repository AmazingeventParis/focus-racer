import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Debug endpoint to see OCR results for photos
 * GET /api/debug/ocr?eventId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "eventId manquant" }, { status: 400 });
    }

    // Verify event ownership
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 });
    }
    if (event.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Get photos with OCR details
    const photos = await prisma.photo.findMany({
      where: { eventId },
      select: {
        id: true,
        originalName: true,
        webPath: true,
        thumbnailPath: true,
        ocrProvider: true,
        processedAt: true,
        qualityScore: true,
        isBlurry: true,
        bibNumbers: {
          select: {
            number: true,
            confidence: true,
            source: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const results = photos.map((photo) => ({
      id: photo.id,
      filename: photo.originalName,
      ocrProvider: photo.ocrProvider || "not_processed",
      processedAt: photo.processedAt,
      bibsDetected: photo.bibNumbers.length,
      bibs: photo.bibNumbers.map((b) => ({
        number: b.number,
        confidence: b.confidence,
        source: b.source,
      })),
      qualityScore: photo.qualityScore,
      isBlurry: photo.isBlurry,
      hasWebVersion: !!photo.webPath,
      hasThumbnail: !!photo.thumbnailPath,
    }));

    return NextResponse.json({
      event: {
        id: event.id,
        name: event.name,
      },
      totalPhotos: results.length,
      photosWithBibs: results.filter((r) => r.bibsDetected > 0).length,
      photosWithoutBibs: results.filter((r) => r.bibsDetected === 0).length,
      photos: results,
    });
  } catch (error) {
    console.error("Debug OCR error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
