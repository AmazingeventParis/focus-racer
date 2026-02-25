import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { s3KeyToPublicPath } from "@/lib/s3";
import { searchFacesByFaceId } from "@/lib/rekognition";
import { aiConfig } from "@/lib/ai-config";

// Search photos by bib number or runner name (via start-list)
// Bib search includes face expansion: finds additional photos of the same person
// even when the bib is not visible (e.g. hidden by hand, back view)
export async function GET(request: NextRequest) {
  // Rate limit: 30 searches/minute per IP
  const limited = rateLimit(request, "photo-search", { limit: 30 });
  if (limited) return limited;
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  const name = searchParams.get("name");
  const bib = searchParams.get("bib");

  if (!eventId) {
    return NextResponse.json({ error: "eventId requis" }, { status: 400 });
  }

  try {
    // Search by bib number
    if (bib) {
      const bibNumbers = await prisma.bibNumber.findMany({
        where: {
          number: bib,
          photo: { eventId, event: { status: "PUBLISHED" } },
        },
        include: {
          photo: {
            select: {
              id: true,
              thumbnailPath: true,
              webPath: true,
              path: true,
              originalName: true,
              bibNumbers: { select: { id: true, number: true } },
            },
          },
        },
      });

      const photosMap = new Map();
      bibNumbers.forEach((b) => {
        if (!photosMap.has(b.photo.id)) {
          photosMap.set(b.photo.id, {
            id: b.photo.id,
            src: s3KeyToPublicPath(b.photo.thumbnailPath || b.photo.webPath || b.photo.path),
            originalName: b.photo.originalName,
            bibNumbers: b.photo.bibNumbers,
          });
        }
      });

      // Face expansion: find additional photos of the same person via face recognition
      // This catches photos where the bib is hidden (hand, back view, etc.)
      if (aiConfig.faceIndexEnabled && photosMap.size > 0) {
        try {
          // Get faceIds from the photos we already found by bib
          const bibPhotoIds = Array.from(photosMap.keys());
          const anchorFaces = await prisma.photoFace.findMany({
            where: { photoId: { in: bibPhotoIds } },
            select: { faceId: true },
          });

          if (anchorFaces.length > 0) {
            // Search for similar faces across the collection
            const matchedPhotoIds = new Set<string>();
            for (const face of anchorFaces) {
              const faceMatches = await searchFacesByFaceId(face.faceId, 50, 70);
              for (const match of faceMatches) {
                if (match.externalImageId.startsWith(`${eventId}:`)) {
                  const photoId = match.externalImageId.split(":")[1];
                  if (photoId && !photosMap.has(photoId)) {
                    matchedPhotoIds.add(photoId);
                  }
                }
              }
            }

            // Fetch the additional photos found by face
            if (matchedPhotoIds.size > 0) {
              const extraPhotos = await prisma.photo.findMany({
                where: { id: { in: Array.from(matchedPhotoIds) }, eventId },
                select: {
                  id: true,
                  thumbnailPath: true,
                  webPath: true,
                  path: true,
                  originalName: true,
                  bibNumbers: { select: { id: true, number: true } },
                },
              });
              for (const p of extraPhotos) {
                photosMap.set(p.id, {
                  id: p.id,
                  src: s3KeyToPublicPath(p.thumbnailPath || p.webPath || p.path),
                  originalName: p.originalName,
                  bibNumbers: p.bibNumbers,
                });
              }
            }
          }
        } catch (faceErr) {
          // Face expansion is best-effort, don't fail the whole search
          console.error("Face expansion error (non-blocking):", faceErr);
        }
      }

      // Try to find runner info from start-list
      const runner = await prisma.startListEntry.findUnique({
        where: { eventId_bibNumber: { eventId, bibNumber: bib } },
      });

      return NextResponse.json({
        query: bib,
        type: "bib",
        runner: runner ? { firstName: runner.firstName, lastName: runner.lastName, bibNumber: runner.bibNumber } : null,
        count: photosMap.size,
        photos: Array.from(photosMap.values()),
      });
    }

    // Search by name
    if (name) {
      const searchTerm = name.trim();
      const entries = await prisma.startListEntry.findMany({
        where: {
          eventId,
          event: { status: "PUBLISHED" },
          OR: [
            { firstName: { contains: searchTerm, mode: "insensitive" } },
            { lastName: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
      });

      if (entries.length === 0) {
        return NextResponse.json({
          query: name,
          type: "name",
          runner: null,
          count: 0,
          photos: [],
        });
      }

      // Get all bib numbers found
      const bibNums = entries.map((e) => e.bibNumber);

      const bibNumbers = await prisma.bibNumber.findMany({
        where: {
          number: { in: bibNums },
          photo: { eventId },
        },
        include: {
          photo: {
            select: {
              id: true,
              thumbnailPath: true,
              webPath: true,
              path: true,
              originalName: true,
              bibNumbers: { select: { id: true, number: true } },
            },
          },
        },
      });

      const photosMap = new Map();
      bibNumbers.forEach((b) => {
        if (!photosMap.has(b.photo.id)) {
          photosMap.set(b.photo.id, {
            id: b.photo.id,
            src: s3KeyToPublicPath(b.photo.thumbnailPath || b.photo.webPath || b.photo.path),
            originalName: b.photo.originalName,
            bibNumbers: b.photo.bibNumbers,
          });
        }
      });

      // Face expansion for name search too
      if (aiConfig.faceIndexEnabled && photosMap.size > 0) {
        try {
          const namePhotoIds = Array.from(photosMap.keys());
          const anchorFaces = await prisma.photoFace.findMany({
            where: { photoId: { in: namePhotoIds } },
            select: { faceId: true },
          });

          if (anchorFaces.length > 0) {
            const matchedPhotoIds = new Set<string>();
            for (const face of anchorFaces) {
              const faceMatches = await searchFacesByFaceId(face.faceId, 50, 70);
              for (const match of faceMatches) {
                const parts = match.externalImageId.split(":");
                if (parts[0] === eventId && parts[1] && !photosMap.has(parts[1])) {
                  matchedPhotoIds.add(parts[1]);
                }
              }
            }

            if (matchedPhotoIds.size > 0) {
              const extraPhotos = await prisma.photo.findMany({
                where: { id: { in: Array.from(matchedPhotoIds) }, eventId },
                select: {
                  id: true,
                  thumbnailPath: true,
                  webPath: true,
                  path: true,
                  originalName: true,
                  bibNumbers: { select: { id: true, number: true } },
                },
              });
              for (const p of extraPhotos) {
                photosMap.set(p.id, {
                  id: p.id,
                  src: s3KeyToPublicPath(p.thumbnailPath || p.webPath || p.path),
                  originalName: p.originalName,
                  bibNumbers: p.bibNumbers,
                });
              }
            }
          }
        } catch (faceErr) {
          console.error("Face expansion error (non-blocking):", faceErr);
        }
      }

      const firstEntry = entries[0];
      return NextResponse.json({
        query: name,
        type: "name",
        runner: { firstName: firstEntry.firstName, lastName: firstEntry.lastName, bibNumber: firstEntry.bibNumber },
        matchedRunners: entries.map((e) => ({ firstName: e.firstName, lastName: e.lastName, bibNumber: e.bibNumber })),
        count: photosMap.size,
        photos: Array.from(photosMap.values()),
      });
    }

    return NextResponse.json({ error: "Paramètre 'bib' ou 'name' requis" }, { status: 400 });
  } catch (error) {
    console.error("Error searching photos:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
