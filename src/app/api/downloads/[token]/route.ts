import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import archiver from "archiver";
import path from "path";
import fs from "fs";
import { PassThrough } from "stream";
import { ReadableStream } from "stream/web";
import sharp from "@/lib/sharp-config";
import { getFromS3AsBuffer, publicPathToS3Key } from "@/lib/s3";

// --- Logo watermark for downloaded HD photos ---

let cachedLogo: Buffer | null = null;

async function getLogoPNG(): Promise<Buffer | null> {
  if (cachedLogo) return cachedLogo;
  try {
    // In Docker/standalone builds, process.cwd() is /app
    const logoPath = path.join(process.cwd(), "public", "logo-focus-racer-white.png");
    cachedLogo = fs.readFileSync(logoPath);
    return cachedLogo;
  } catch {
    console.warn("Logo watermark file not found, downloads will not be watermarked");
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

    // Resize logo to ~15% of photo width
    const logoWidth = Math.round(width * 0.15);
    const resizedLogo = await sharp(logoPNG)
      .resize(logoWidth, null, { fit: "inside" })
      .toBuffer();

    // Get resized logo dimensions
    const logoMeta = await sharp(resizedLogo).metadata();
    const logoH = logoMeta.height || 40;
    const logoW = logoMeta.width || logoWidth;

    // Create a semi-transparent dark background behind the logo for readability
    const padding = 12;
    const bgWidth = logoW + padding * 2;
    const bgHeight = logoH + padding * 2;
    const background = await sharp({
      create: {
        width: bgWidth,
        height: bgHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0.4 },
      },
    })
      .composite([
        {
          input: resizedLogo,
          left: padding,
          top: padding,
        },
      ])
      .png()
      .toBuffer();

    // Bottom-left corner with margin
    const margin = 20;
    const left = margin;
    const top = Math.max(0, height - bgHeight - margin);

    return await image
      .composite([
        {
          input: background,
          left,
          top,
        },
      ])
      .jpeg({ quality: 95 })
      .toBuffer();
  } catch (err) {
    console.error("Failed to apply logo watermark, returning original:", err);
    return photoBuffer;
  }
}

/** Get the S3 key for a photo, handling both new (S3 key) and legacy (local path) formats */
function getPhotoS3Key(photo: { path: string; s3Key?: string | null }): string {
  // New format: path IS the S3 key (starts with "events/")
  if (photo.path.startsWith("events/")) return photo.path;
  // Legacy: use s3Key field if available
  if (photo.s3Key) return photo.s3Key;
  // Fallback: convert local path to S3 key
  return publicPathToS3Key(photo.path);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const order = await prisma.order.findUnique({
      where: { downloadToken: token },
      include: {
        event: true,
        items: {
          include: {
            photo: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Lien invalide" }, { status: 404 });
    }

    if (order.status !== "PAID") {
      return NextResponse.json(
        { error: "Commande non payée" },
        { status: 403 }
      );
    }

    if (order.downloadExpiresAt && new Date() > order.downloadExpiresAt) {
      return NextResponse.json(
        { error: "Lien expiré. Rendez-vous dans votre espace achats pour régénérer un lien." },
        { status: 410 }
      );
    }

    // Collect valid photos (those with a path/S3 key)
    const photoItems = order.items.filter((item) => item.photo.path);

    if (photoItems.length === 0) {
      return NextResponse.json(
        { error: "Aucune photo disponible" },
        { status: 404 }
      );
    }

    // Update download stats
    await prisma.order.update({
      where: { id: order.id },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadAt: new Date(),
      },
    });

    // If single photo, fetch from S3, apply logo watermark, then send
    if (photoItems.length === 1) {
      const { photo } = photoItems[0];
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

    // Multiple photos: create ZIP
    const passThrough = new PassThrough();
    const archive = archiver("zip", { zlib: { level: 5 } });

    archive.on("error", (err) => {
      console.error("Archive error:", err);
      passThrough.destroy(err);
    });

    archive.pipe(passThrough);

    // Deduplicate filenames and append buffers from S3
    const usedNames = new Set<string>();
    for (const { photo } of photoItems) {
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
        console.error(`Failed to fetch/watermark ${photo.path} from S3:`, err);
      }
    }

    archive.finalize();

    const eventSlug = order.event.name
      .replace(/[^a-zA-Z0-9]/g, "_")
      .slice(0, 30);
    const zipName = `FocusRacer_${eventSlug}_${order.id.slice(-6)}.zip`;

    const webStream = ReadableStream.from(passThrough as AsyncIterable<Uint8Array>);

    return new NextResponse(webStream as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipName}"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
