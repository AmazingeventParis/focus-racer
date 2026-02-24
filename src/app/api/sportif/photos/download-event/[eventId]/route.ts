import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import archiver from "archiver";
import path from "path";
import fs from "fs";
import { PassThrough } from "stream";
import { ReadableStream } from "stream/web";
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
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { eventId } = await params;

    // Find all purchased photos for this event
    const items = await prisma.orderItem.findMany({
      where: {
        order: { userId: session.user.id, status: { in: ["PAID", "DELIVERED"] } },
        photo: { eventId },
      },
      include: {
        photo: true,
        order: { include: { event: { select: { name: true } } } },
      },
    });

    if (items.length === 0) {
      return NextResponse.json({ error: "Aucune photo achetée pour cet événement" }, { status: 404 });
    }

    // Deduplicate by photoId
    const seen = new Set<string>();
    const uniqueItems = items.filter((item) => {
      if (seen.has(item.photoId)) return false;
      seen.add(item.photoId);
      return true;
    });

    const eventName = uniqueItems[0].order.event.name;

    // Single photo - return directly
    if (uniqueItems.length === 1) {
      const { photo } = uniqueItems[0];
      const s3Key = getPhotoS3Key(photo);
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
          "Content-Disposition": `attachment; filename="${encodeURIComponent(photo.originalName)}"`,
        },
      });
    }

    // Multiple photos - ZIP
    const passThrough = new PassThrough();
    const archive = archiver("zip", { zlib: { level: 5 } });
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      passThrough.destroy(err);
    });
    archive.pipe(passThrough);

    const usedNames = new Set<string>();
    for (const { photo } of uniqueItems) {
      let finalName = photo.originalName;
      let counter = 1;
      while (usedNames.has(finalName)) {
        const ext = path.extname(photo.originalName);
        const base = path.basename(photo.originalName, ext);
        finalName = `${base}_${counter}${ext}`;
        counter++;
      }
      usedNames.add(finalName);
      try {
        const s3Key = getPhotoS3Key(photo);
        const buffer = await getFromS3AsBuffer(s3Key);
        const watermarked = await applyLogoWatermark(buffer);
        archive.append(watermarked, { name: finalName });
      } catch (err) {
        console.error(`Failed to fetch/watermark ${photo.path}:`, err);
      }
    }

    archive.finalize();

    const eventSlug = eventName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
    const zipName = `FocusRacer_${eventSlug}.zip`;

    const webStream = ReadableStream.from(passThrough as AsyncIterable<Uint8Array>);
    return new NextResponse(webStream as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipName}"`,
      },
    });
  } catch (error) {
    console.error("Event download error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
