import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { rateLimit } from "@/lib/rate-limit";
import { getFromS3WithMeta } from "@/lib/s3";
import { isServableUploadKey } from "../upload-key-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Rate limit: 120 images/minute per IP (prevents bulk scraping)
  const limited = rateLimit(request, "uploads", { limit: 120 });
  if (limited) return limited;

  // Hotlink protection: block requests from external sites.
  // Strict hostname comparison — a substring check would let
  // "focusracer.swipego.app.attacker.com" through.
  const referer = request.headers.get("referer") || "";
  let isAllowed = !referer;
  if (referer) {
    try {
      const refHost = new URL(referer).hostname;
      isAllowed =
        refHost === "focusracer.swipego.app" ||
        refHost === "localhost" ||
        refHost === "127.0.0.1";
    } catch {
      isAllowed = false;
    }
  }
  if (!isAllowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const segments = params.path;
  if (segments.some((s) => s.includes("..") || s.includes("\0"))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  // Map URL segments to S3 key
  // URL: /uploads/{eventId}/thumbs/wm_xxx.webp → S3: events/{eventId}/thumbs/wm_xxx.webp
  // URL: /uploads/platform/watermark.png → S3: platform/watermark.png
  let s3Key: string;
  if (segments[0] === "platform") {
    s3Key = segments.join("/");
  } else {
    s3Key = `events/${segments.join("/")}`;
  }

  // HD originals are the paid product — never served through this public proxy.
  // Return 404 (not 403) to avoid leaking the existence of the file.
  if (!isServableUploadKey(s3Key)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const s3Object = await getFromS3WithMeta(s3Key);
    if (!s3Object) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const { stream, size } = s3Object;

    const filename = segments[segments.length - 1];
    const ext = path.extname(filename).toLowerCase();
    const contentType =
      ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".png"
          ? "image/png"
          : ext === ".webp"
            ? "image/webp"
            : ext === ".gif"
              ? "image/gif"
              : "application/octet-stream";

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    };

    // Content length comes with the GET response (no extra HeadObject call)
    if (size) {
      headers["Content-Length"] = size.toString();
    }

    return new Response(stream, { headers });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
