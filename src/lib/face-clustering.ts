import { prisma } from "./prisma";
import { searchFacesByFaceId } from "./rekognition";
import { aiConfig } from "./ai-config";

interface ClusteringStats {
  totalAnchorPhotos: number;
  totalOrphanPhotos: number;
  facesSearched: number;
  newBibsAssigned: number;
  photosLinked: number;
  errors: string[];
}

/**
 * Face Clustering Service
 *
 * This runs AFTER all photos have been uploaded and processed.
 * It links photos by face similarity to propagate bib numbers.
 *
 * Algorithm:
 * 1. Get all "anchor" photos (photos with detected bib numbers)
 * 2. Get all "orphan" photos (photos without any bib numbers)
 * 3. For each face in anchor photos, search for similar faces
 * 4. If a similar face is found in an orphan photo, assign the bib number
 *
 * Cost: ~$0.0004 per face searched (AWS SearchFaces)
 */
export async function clusterFacesByEvent(eventId: string): Promise<ClusteringStats> {
  const stats: ClusteringStats = {
    totalAnchorPhotos: 0,
    totalOrphanPhotos: 0,
    facesSearched: 0,
    newBibsAssigned: 0,
    photosLinked: 0,
    errors: [],
  };

  if (!aiConfig.faceIndexEnabled) {
    console.log("[Clustering] Face indexing not enabled, skipping");
    return stats;
  }

  console.log(`[Clustering] Starting face clustering for event ${eventId}`);

  try {
    // 1. Get anchor photos (have bib numbers AND have indexed faces)
    const anchorPhotos = await prisma.photo.findMany({
      where: {
        eventId,
        bibNumbers: { some: {} },
        faces: { some: {} },
      },
      include: {
        bibNumbers: true,
        faces: true,
      },
    });

    stats.totalAnchorPhotos = anchorPhotos.length;
    console.log(`[Clustering] Found ${anchorPhotos.length} anchor photos with bibs and faces`);

    if (anchorPhotos.length === 0) {
      console.log("[Clustering] No anchor photos found, nothing to cluster");
      return stats;
    }

    // 2. Get orphan photos (no bib numbers but have indexed faces)
    const orphanPhotos = await prisma.photo.findMany({
      where: {
        eventId,
        bibNumbers: { none: {} },
        faces: { some: {} },
      },
      include: {
        faces: true,
      },
    });

    stats.totalOrphanPhotos = orphanPhotos.length;
    console.log(`[Clustering] Found ${orphanPhotos.length} orphan photos to potentially link`);

    if (orphanPhotos.length === 0) {
      console.log("[Clustering] No orphan photos found, clustering complete");
      return stats;
    }

    // Create a map of faceId -> photoId for orphans
    const orphanFaceToPhoto = new Map<string, string>();
    for (const photo of orphanPhotos) {
      for (const face of photo.faces) {
        orphanFaceToPhoto.set(face.faceId, photo.id);
      }
    }

    // 3. Search anchor faces in parallel batches — the AWS SearchFaces calls
    // dominate clustering latency; running them sequentially made clustering
    // take minutes on large events
    const searchTasks: { faceId: string; bibNumbers: string[]; anchorId: string }[] = [];
    for (const anchor of anchorPhotos) {
      const bibNumbers = anchor.bibNumbers.map((b) => b.number);
      for (const face of anchor.faces) {
        searchTasks.push({ faceId: face.faceId, bibNumbers, anchorId: anchor.id });
      }
    }

    const SEARCH_BATCH = 10;
    const newBibRows: { photoId: string; number: string; confidence: number; source: string }[] = [];
    const seenPairs = new Set<string>();
    const linkedPhotos = new Set<string>();

    for (let i = 0; i < searchTasks.length; i += SEARCH_BATCH) {
      const batch = searchTasks.slice(i, i + SEARCH_BATCH);
      const results = await Promise.all(
        batch.map(async (task) => {
          try {
            stats.facesSearched++;
            const matches = await searchFacesByFaceId(task.faceId, 100, 85);
            return { task, matches };
          } catch (err) {
            const errorMsg = `Error searching face ${task.faceId}: ${err}`;
            console.error(`[Clustering] ${errorMsg}`);
            stats.errors.push(errorMsg);
            return { task, matches: [] as Awaited<ReturnType<typeof searchFacesByFaceId>> };
          }
        })
      );

      for (const { task, matches } of results) {
        for (const match of matches) {
          // Extract photoId from externalImageId (format: "eventId:photoId")
          const parts = match.externalImageId.split(":");
          if (parts.length !== 2) continue;

          const [matchEventId, matchPhotoId] = parts;

          // Only consider matches from the same event
          if (matchEventId !== eventId) continue;

          // Skip if this is the anchor photo itself
          if (matchPhotoId === task.anchorId) continue;

          // Check if this is an orphan photo
          const orphanPhotoId = orphanFaceToPhoto.get(match.faceId);
          if (!orphanPhotoId) continue;

          for (const bibNumber of task.bibNumbers) {
            const pairKey = `${orphanPhotoId}:${bibNumber}`;
            if (seenPairs.has(pairKey)) continue;
            seenPairs.add(pairKey);
            newBibRows.push({
              photoId: orphanPhotoId,
              number: bibNumber,
              confidence: match.similarity / 100,
              source: "face_cluster",
            });
            linkedPhotos.add(orphanPhotoId);
          }
        }
      }
    }

    // Persist all new links in one batch. The photoId_number unique
    // constraint + skipDuplicates is equivalent to the previous
    // upsert-with-empty-update, in a single round-trip.
    if (newBibRows.length > 0) {
      const created = await prisma.bibNumber.createMany({
        data: newBibRows,
        skipDuplicates: true,
      });
      stats.newBibsAssigned = created.count;
      stats.photosLinked = linkedPhotos.size;
    }

    // 4. Update event to mark clustering as done
    await prisma.event.update({
      where: { id: eventId },
      data: { faceClusteredAt: new Date() },
    });

    console.log(`[Clustering] Complete! Linked ${stats.photosLinked} orphan photos, assigned ${stats.newBibsAssigned} new bibs`);

    return stats;
  } catch (error) {
    console.error("[Clustering] Fatal error:", error);
    stats.errors.push(`Fatal error: ${error}`);
    return stats;
  }
}

/**
 * Check if an event needs clustering.
 * Returns true if:
 * - Event has photos with faces indexed
 * - Event has orphan photos (no bibs)
 * - Clustering hasn't been run recently (or never)
 */
export async function eventNeedsClustering(eventId: string): Promise<boolean> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: {
          photos: true,
        },
      },
    },
  });

  if (!event) return false;

  // Check if there are orphan photos
  const orphanCount = await prisma.photo.count({
    where: {
      eventId,
      bibNumbers: { none: {} },
      faces: { some: {} },
    },
  });

  if (orphanCount === 0) return false;

  // Check if clustering was run after the last photo was added
  const latestPhoto = await prisma.photo.findFirst({
    where: { eventId },
    orderBy: { createdAt: "desc" },
  });

  if (!latestPhoto) return false;

  // If never clustered, or clustered before latest photo, needs clustering
  if (!event.faceClusteredAt) return true;
  if (event.faceClusteredAt < latestPhoto.createdAt) return true;

  return false;
}

/**
 * Get clustering stats for an event (for display in UI)
 */
export async function getClusteringStats(eventId: string) {
  const [totalPhotos, photosWithBibs, photosWithFaces, orphanPhotos] = await Promise.all([
    prisma.photo.count({ where: { eventId } }),
    prisma.photo.count({ where: { eventId, bibNumbers: { some: {} } } }),
    prisma.photo.count({ where: { eventId, faces: { some: {} } } }),
    prisma.photo.count({ where: { eventId, bibNumbers: { none: {} }, faces: { some: {} } } }),
  ]);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { faceClusteredAt: true },
  });

  return {
    totalPhotos,
    photosWithBibs,
    photosWithFaces,
    orphanPhotos,
    lastClusteredAt: event?.faceClusteredAt,
    needsClustering: orphanPhotos > 0 && (!event?.faceClusteredAt || orphanPhotos > 0),
  };
}
