import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

// Optimize Sharp for low memory environments
sharp.cache(false);
sharp.concurrency(1);

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./public/uploads";

function generateWatermarkSvg(width: number, height: number): Buffer {
  const fontSize = Math.max(Math.round(width / 20), 16);
  const watermarkText = "FOCUS RACER";
  const lines: string[] = [];

  for (let y = -height; y < height * 2; y += fontSize * 3) {
    for (let x = -width; x < width * 2; x += fontSize * 8) {
      lines.push(
        `<text x="${x}" y="${y}" font-size="${fontSize}" fill="white" opacity="0.3" font-family="Arial, sans-serif" font-weight="bold" transform="rotate(-30, ${x}, ${y})">${watermarkText}</text>`
      );
    }
  }

  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${lines.join("\n")}
    </svg>`
  );
}

/**
 * Generate a watermarked thumbnail for public display with static "FOCUS RACER" watermark.
 * Uses the web-optimized source (already resized) for fast processing.
 * The HD original is kept untouched for delivery after purchase.
 *
 * @param eventId - Event ID for output directory
 * @param imageBuffer - Image buffer (from web-optimized version)
 * @param sourceFilename - Original filename for thumbnail naming
 */
export async function generateWatermarkedThumbnail(
  eventId: string,
  imageBuffer: Buffer,
  sourceFilename: string
): Promise<string> {
  const thumbDir = path.join(UPLOAD_DIR, eventId, "thumbs");
  await fs.mkdir(thumbDir, { recursive: true });

  const sourceBasename = path.parse(sourceFilename).name;
  const thumbFilename = `wm_${sourceBasename}.jpg`;
  const thumbPath = path.join(thumbDir, thumbFilename);

  // Get image dimensions from buffer
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 800;
  const height = metadata.height || 600;

  // Generate SVG watermark overlay (static "FOCUS RACER")
  const svgOverlay = generateWatermarkSvg(width, height);

  // Source is already web-optimized (max 1600px), resize to 1200px for thumbnail
  await sharp(imageBuffer)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .composite([
      {
        input: await sharp(svgOverlay)
          .resize(
            Math.min(width, 1200),
            Math.round(Math.min(width, 1200) * (height / width)),
            { fit: "fill" }
          )
          .png()
          .toBuffer(),
        gravity: "center",
      },
    ])
    .jpeg({ quality: 80 })
    .toFile(thumbPath);

  return `/uploads/${eventId}/thumbs/${thumbFilename}`;
}
