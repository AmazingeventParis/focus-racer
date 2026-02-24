import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteMultipleFromS3 } from "@/lib/s3";

const RETENTION_DAYS = 30;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    // Find published events whose date is older than 30 days
    const expiredEvents = await prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        date: { lt: cutoffDate },
      },
      select: {
        id: true,
        name: true,
        coverImage: true,
        bannerImage: true,
        logoImage: true,
        photos: {
          select: {
            id: true,
            path: true,
            webPath: true,
            thumbnailPath: true,
            faces: {
              select: { cropPath: true },
            },
          },
        },
      },
    });

    if (expiredEvents.length === 0) {
      return NextResponse.json({
        archived: 0,
        photosDeleted: 0,
        s3KeysDeleted: 0,
      });
    }

    let totalPhotosDeleted = 0;
    let totalS3KeysDeleted = 0;

    for (const event of expiredEvents) {
      // Collect all S3 keys for this event
      const s3Keys: string[] = [];

      for (const photo of event.photos) {
        if (photo.path) s3Keys.push(photo.path);
        if (photo.webPath) s3Keys.push(photo.webPath);
        if (photo.thumbnailPath) s3Keys.push(photo.thumbnailPath);
        for (const face of photo.faces) {
          if (face.cropPath) s3Keys.push(face.cropPath);
        }
      }

      // Event branding images
      if (event.coverImage) s3Keys.push(event.coverImage);
      if (event.bannerImage) s3Keys.push(event.bannerImage);
      if (event.logoImage) s3Keys.push(event.logoImage);

      // Delete S3 objects
      if (s3Keys.length > 0) {
        await deleteMultipleFromS3(s3Keys);
      }

      // Delete OrderItems referencing these photos (avoid FK constraint)
      const photoIds = event.photos.map((p) => p.id);
      if (photoIds.length > 0) {
        await prisma.orderItem.deleteMany({
          where: { photoId: { in: photoIds } },
        });
      }

      // Delete photos (BibNumber + PhotoFace cascade automatically)
      const deleteResult = await prisma.photo.deleteMany({
        where: { eventId: event.id },
      });

      // Archive the event and clear branding paths
      await prisma.event.update({
        where: { id: event.id },
        data: {
          status: "ARCHIVED",
          coverImage: null,
          bannerImage: null,
          logoImage: null,
        },
      });

      totalPhotosDeleted += deleteResult.count;
      totalS3KeysDeleted += s3Keys.length;

      console.log(
        `[auto-archive] Archived event "${event.name}" (${event.id}): ${deleteResult.count} photos, ${s3Keys.length} S3 keys deleted`
      );
    }

    return NextResponse.json({
      archived: expiredEvents.length,
      photosDeleted: totalPhotosDeleted,
      s3KeysDeleted: totalS3KeysDeleted,
    });
  } catch (error) {
    console.error("[auto-archive] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
