import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { aiConfig } from "./ai-config";
import { uploadToS3, deleteFromS3, getS3Key } from "./s3";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./public/uploads";

/** Max dimension for the web-optimized version (used by AI pipeline + display) */
const WEB_MAX_DIMENSION = 1600;
const WEB_JPEG_QUALITY = 80;

export async function ensureUploadDir(eventId: string): Promise<string> {
  const eventDir = path.join(UPLOAD_DIR, eventId);
  await fs.mkdir(eventDir, { recursive: true });
  return eventDir;
}

/**
 * Normalize problematic images (old JPEG formats, corrupted headers, etc.)
 * by converting them to a standard format first.
 * Exported for use in other modules (watermark, image-processing, etc.)
 */
export async function normalizeImage(inputPath: string): Promise<Buffer> {
  const strategies = [
    // Strategy 1: Try with failOnError: false
    () => sharp(inputPath, { failOnError: false })
      .jpeg({ quality: 95, force: true })
      .toBuffer(),

    // Strategy 2: Try with raw input
    () => sharp(inputPath, { failOnError: false, unlimited: true })
      .toFormat("jpeg", { quality: 95 })
      .toBuffer(),

    // Strategy 3: Try to extract raw pixels first
    () => sharp(inputPath, { failOnError: false })
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) =>
        sharp(data, {
          raw: {
            width: info.width,
            height: info.height,
            channels: info.channels
          }
        })
        .jpeg({ quality: 95 })
        .toBuffer()
      ),
  ];

  for (let i = 0; i < strategies.length; i++) {
    try {
      return await strategies[i]();
    } catch (error) {
      console.warn(`Normalization strategy ${i + 1} failed:`, error instanceof Error ? error.message : error);
      if (i === strategies.length - 1) {
        // Last strategy failed
        throw new Error(`Unable to normalize image after ${strategies.length} attempts`);
      }
    }
  }

  throw new Error("All normalization strategies failed");
}

/**
 * Generate a web-optimized version of the photo.
 * Resized to max 1600px, JPEG quality 80 → typically 200-400 KB.
 * Used for: AI pipeline (OCR, face), web gallery display.
 * IMPORTANT: Must be JPEG for AWS Rekognition compatibility (WebP not supported).
 */
async function generateWebVersion(
  originalPath: string,
  eventDir: string,
  filename: string
): Promise<{ webFilename: string; webRelativePath: string; webBuffer: Buffer }> {
  const webDir = path.join(eventDir, "web");
  await fs.mkdir(webDir, { recursive: true });

  const webFilename = `web_${path.parse(filename).name}.jpg`;
  const webPath = path.join(webDir, webFilename);

  let webBuffer: Buffer;

  try {
    // Try normal processing first
    webBuffer = await sharp(originalPath)
      .resize(WEB_MAX_DIMENSION, WEB_MAX_DIMENSION, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: WEB_JPEG_QUALITY, mozjpeg: true })
      .toBuffer();

    await fs.writeFile(webPath, webBuffer);
  } catch (standardError) {
    console.warn(`Standard processing failed for ${filename}:`, standardError instanceof Error ? standardError.message : standardError);
    console.warn(`Attempting normalization...`);

    try {
      // If standard processing fails, normalize the image first
      const normalizedBuffer = await normalizeImage(originalPath);

      // Then process the normalized version
      webBuffer = await sharp(normalizedBuffer)
        .resize(WEB_MAX_DIMENSION, WEB_MAX_DIMENSION, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: WEB_JPEG_QUALITY, mozjpeg: true })
        .toBuffer();

      await fs.writeFile(webPath, webBuffer);

      console.log(`Successfully normalized and processed ${filename}`);
    } catch (normalizeError) {
      const errorMsg = normalizeError instanceof Error ? normalizeError.message : String(normalizeError);
      console.error(`Failed to normalize ${filename}:`, errorMsg);
      throw new Error(`Unable to process image: ${filename}. Error: ${errorMsg}`);
    }
  }

  const eventId = path.basename(eventDir);
  return {
    webFilename,
    webRelativePath: `/uploads/${eventId}/web/${webFilename}`,
    webBuffer, // Return buffer for immediate use (no re-read needed)
  };
}

/**
 * Save a file to local disk (and optionally to S3).
 * Creates both the HD original and a web-optimized version.
 * Returns the web buffer for immediate use (no re-read needed).
 */
export async function saveFile(
  file: File,
  eventId: string
): Promise<{
  filename: string;
  path: string;
  webPath: string;
  webBuffer: Buffer;
  s3Key: string | null;
}> {
  const eventDir = await ensureUploadDir(eventId);

  const ext = path.extname(file.name);
  const filename = `${uuidv4()}${ext}`;
  const filePath = path.join(eventDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  // Generate web-optimized version (for AI pipeline + web display)
  const { webRelativePath, webBuffer } = await generateWebVersion(filePath, eventDir, filename);

  const relativePath = `/uploads/${eventId}/${filename}`;
  let s3Key: string | null = null;

  // Also upload to S3 if configured
  if (aiConfig.s3Enabled) {
    try {
      const contentType = file.type || "image/jpeg";
      s3Key = getS3Key(eventId, filename, "original");
      await uploadToS3(buffer, s3Key, contentType);
    } catch (err) {
      console.error("S3 upload error (continuing with local):", err);
      s3Key = null;
    }
  }

  return { filename, path: relativePath, webPath: webRelativePath, webBuffer, s3Key };
}

export async function deleteFile(relativePath: string, s3Key?: string | null): Promise<void> {
  // Delete local
  const fullPath = path.join("./public", relativePath);
  try {
    await fs.unlink(fullPath);
  } catch (error) {
    console.error("Error deleting local file:", error);
  }

  // Delete web version if it exists
  try {
    const dir = path.dirname(fullPath);
    const basename = path.parse(path.basename(fullPath)).name;
    const webFile = path.join(dir, "web", `web_${basename}.jpg`);
    await fs.unlink(webFile);
  } catch {
    // Web version may not exist
  }

  // Delete from S3 if applicable
  if (s3Key && aiConfig.s3Enabled) {
    try {
      await deleteFromS3(s3Key);
    } catch (error) {
      console.error("Error deleting S3 file:", error);
    }
  }
}

export async function getUploadedFilePath(relativePath: string): Promise<string> {
  return path.join(process.cwd(), "public", relativePath);
}
