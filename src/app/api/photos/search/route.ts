import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { s3KeyToPublicPath } from "@/lib/s3";
import { searchFacesByFaceId, searchFaceByImage } from "@/lib/rekognition";
import { aiConfig } from "@/lib/ai-config";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// Get photo image buffer from S3 for face search
async function getPhotoBuffer(s3Key: string): Promise<Buffer | null> {
  try {
    const s3 = new S3Client({
      region: process.env.AWS_REGION || "eu-west-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    const resp = await s3.send(new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
    }));
    if (!resp.Body) return null;
    const chunks: Uint8Array[] = [];
    for await (const chunk of resp.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch {
    return null;
  }
}

// Face expansion: find additional photos of the same person via face recognition.
// Strategy 1: Use PhotoFace DB records + SearchFaces API (fast, cheap)
// Strategy 2: If no PhotoFace records, fallback to SearchFacesByImage using
//             the anchor photo's web version from S3 (slower, but always works)
async function expandByFace(
  eventId: string,
  searchedBibs: string[],
  photosMap: Map<string, unknown>
): Promise<void> {
  if (!aiConfig.faceIndexEnabled || photosMap.size === 0) return;

  const anchorPhotoIds = Array.from(photosMap.keys());
  const matchedPhotoIds = new Set<string>();

  // Strategy 1: Use PhotoFace records (fast path)
  const allFaces = await prisma.photoFace.findMany({
    where: { photoId: { in: anchorPhotoIds } },
    select: { faceId: true },
  });

  if (allFaces.length > 0) {
    const uniqueFaceIds = [...new Set(allFaces.map((f) => f.faceId))];
    console.log(`[FaceExpand] Strategy 1: ${uniqueFaceIds.length} face(s) from PhotoFace for ${anchorPhotoIds.length} anchor photo(s)`);

    for (const faceId of uniqueFaceIds) {
      const faceMatches = await searchFacesByFaceId(faceId, 50, 80);
      for (const match of faceMatches) {
        const parts = match.externalImageId.split(":");
        if (parts[0] === eventId && parts[1] && !photosMap.has(parts[1])) {
          matchedPhotoIds.add(parts[1]);
        }
      }
    }
    console.log(`[FaceExpand] Strategy 1 found ${matchedPhotoIds.size} candidate photo(s)`);
  } else {
    // Strategy 2: No PhotoFace records, fallback to SearchFacesByImage
    // This handles photos processed before PhotoFace was implemented,
    // or edge cases where face indexing succeeded in Rekognition but DB insert failed
    console.log(`[FaceExpand] Strategy 2: No PhotoFace records, using SearchFacesByImage`);

    const anchorPhotos = await prisma.photo.findMany({
      where: { id: { in: anchorPhotoIds } },
      select: { id: true, webPath: true, path: true },
    });

    for (const photo of anchorPhotos) {
      const s3Key = photo.webPath || photo.path;
      if (!s3Key) continue;

      const buffer = await getPhotoBuffer(s3Key);
      if (!buffer) continue;

      try {
        const faceMatches = await searchFaceByImage(buffer, 50, 80);
        for (const match of faceMatches) {
          const parts = match.externalImageId.split(":");
          if (parts[0] === eventId && parts[1] && !photosMap.has(parts[1])) {
            matchedPhotoIds.add(parts[1]);
          }
        }
      } catch (err) {
        console.error(`[FaceExpand] SearchFacesByImage error for ${photo.id}:`, err);
      }
    }
    console.log(`[FaceExpand] Strategy 2 found ${matchedPhotoIds.size} candidate photo(s)`);
  }

  if (matchedPhotoIds.size === 0) return;

  // Fetch candidate photos WITH their bib numbers
  const candidatePhotos = await prisma.photo.findMany({
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

  // Filter: only keep photos that either have NO bib detected, or have
  // the SAME bib as what we're searching for. Exclude photos with a
  // different bib — they belong to a different runner who happened to
  // share a group photo with our target.
  const searchedBibSet = new Set(searchedBibs);
  let added = 0;
  for (const p of candidatePhotos) {
    const photoBibs = p.bibNumbers.map((b) => b.number);
    const hasConflictingBib = photoBibs.length > 0 &&
      photoBibs.every((b) => !searchedBibSet.has(b));

    if (!hasConflictingBib) {
      photosMap.set(p.id, {
        id: p.id,
        src: s3KeyToPublicPath(p.thumbnailPath || p.webPath || p.path),
        originalName: p.originalName,
        bibNumbers: p.bibNumbers,
      });
      added++;
    }
  }
  console.log(`[FaceExpand] Added ${added} photo(s) after filtering (${candidatePhotos.length - added} excluded for conflicting bibs)`);
}

// Search photos by bib number or runner name (via start-list)
// Bib/name search includes face expansion: finds additional photos of the same person
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

      // Face expansion (best-effort, catches photos where bib is hidden)
      try {
        await expandByFace(eventId, [bib], photosMap);
      } catch (faceErr) {
        console.error("Face expansion error (non-blocking):", faceErr);
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

      // Face expansion (best-effort)
      try {
        await expandByFace(eventId, bibNums, photosMap);
      } catch (faceErr) {
        console.error("Face expansion error (non-blocking):", faceErr);
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
