import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { collectPhotoS3Keys } from "@/lib/storage";
import { deleteMultipleFromS3 } from "@/lib/s3";
import { deleteIndexedFaces } from "@/lib/rekognition";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: photoId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        event: true,
        faces: { select: { faceId: true, cropPath: true } },
      },
    });

    if (!photo || (photo.event.userId !== session.user.id && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Clean up S3 objects + Rekognition face vectors BEFORE deleting the DB
    // record (the record holds the keys; once deleted they are unrecoverable)
    try {
      const s3Keys = collectPhotoS3Keys(photo);
      if (s3Keys.length > 0) {
        await deleteMultipleFromS3(s3Keys);
      }
      await deleteIndexedFaces(photo.faces.map((f) => f.faceId));
    } catch (cleanupErr) {
      console.error(`[Photo Delete] S3/Rekognition cleanup error for ${photoId}:`, cleanupErr);
      // Continue: DB deletion must still happen
    }

    await prisma.photo.delete({ where: { id: photoId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
