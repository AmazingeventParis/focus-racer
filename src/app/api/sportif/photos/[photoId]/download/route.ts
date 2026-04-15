import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import path from "path";
import fs from "fs";
import sharp from "@/lib/sharp-config";
import { getFromS3AsBuffer, publicPathToS3Key } from "@/lib/s3";

function getPhotoS3Key(photo: { path: string; s3Key?: string | null }): string {
  if (photo.path.startsWith("events/")) return photo.path;
  if (photo.s3Key) return photo.s3Key;
  return publicPathToS3Key(photo.path);
}

let cachedLogo: Buffer | null = null;

async function getLogoPNG(): Promise<Buffer | null> {
  if (cachedLogo) return cachedLogo;
  try {
    const logoPath = path.join(process.cwd(), "public", "logo-focus-racer-white.png");
    cachedLogo = fs.readFileSync(logoPath);
    return cachedLogo;
  } catch {
    return null;
  }
}

async function applyLogoWatermark(photoBuffer: Buffer): Promise<Buffer> {
  const logoPNG = await getLogoPNG();
  if (!logoPNG) return photoBuffer;
  try {
    const image = sharp(photoBuffer);
    const metadata = await image.metadata();
    const width = metadata.width || 1600;
    const height = metadata.height || 1200;
    const logoWidth = Math.round(width * 0.15);
    const resizedLogo = await sharp(logoPNG).resize(logoWidth, null, { fit: "inside" }).toBuffer();
    const logoMeta = await sharp(resizedLogo).metadata();
    const logoH = logoMeta.height || 40;
    const logoW = logoMeta.width || logoWidth;
    const padding = 12;
    const bgWidth = logoW + padding * 2;
    const bgHeight = logoH + padding * 2;
    const background = await sharp({
      create: { width: bgWidth, height: bgHeight, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0.4 } },
    })
      .composite([{ input: resizedLogo, left: padding, top: padding }])
      .png()
      .toBuffer();
    const margin = 20;
    return await image
      .composite([{ input: background, left: margin, top: Math.max(0, height - bgHeight - margin) }])
      .jpeg({ quality: 95 })
      .toBuffer();
  } catch {
    return photoBuffer;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { photoId } = await params;

    // Verify user purchased this photo
    const item = await prisma.orderItem.findFirst({
      where: {
        photoId,
        order: { userId: session.user.id, status: { in: ["PAID", "DELIVERED"] } },
      },
      include: { photo: true },
    });

    if (!item) {
      return NextResponse.json({ error: "Photo non achetée" }, { status: 403 });
    }

    const s3Key = getPhotoS3Key(item.photo);
    let buffer: Buffer;
    try {
      buffer = await getFromS3AsBuffer(s3Key);
    } catch {
      return NextResponse.json({ error: "Fichier non trouvé" }, { status: 404 });
    }

    const watermarked = await applyLogoWatermark(buffer);

    return new NextResponse(watermarked as unknown as BodyInit, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(item.photo.originalName)}"`,
      },
    });
  } catch (error) {
    console.error("Sportif photo download error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
