import { NextRequest, NextResponse } from "next/server";
import { authenticateApiKey, deductApiCredit } from "@/lib/api-key-auth";
import { detectTextFromImage } from "@/lib/rekognition";
import { indexFaces } from "@/lib/rekognition";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // 1. Auth
  const authResult = await authenticateApiKey(request);
  if ("error" in authResult) return authResult.error;
  const { user, apiKey } = authResult.auth;

  // 2. Parse input
  let imageBuffer: Buffer;
  let detectBib = true;
  let detectFace = true;
  let minConfidence = 0.7;

  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("image") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "Missing 'image' field in form data", code: "BAD_REQUEST" },
          { status: 400 }
        );
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: `Image too large (max ${MAX_IMAGE_SIZE / 1024 / 1024} MB)`, code: "BAD_REQUEST" },
          { status: 400 }
        );
      }
      imageBuffer = Buffer.from(await file.arrayBuffer());

      // Optional params from form data
      const dbParam = formData.get("detect_bib");
      if (dbParam !== null) detectBib = dbParam !== "false" && dbParam !== "0";
      const dfParam = formData.get("detect_face");
      if (dfParam !== null) detectFace = dfParam !== "false" && dfParam !== "0";
      const mcParam = formData.get("min_confidence");
      if (mcParam !== null) minConfidence = Math.max(0, Math.min(1, parseFloat(mcParam as string) || 0.7));
    } else if (contentType.includes("application/json")) {
      const body = await request.json();

      if (body.image_url) {
        const res = await fetch(body.image_url);
        if (!res.ok) {
          return NextResponse.json(
            { error: "Failed to fetch image from URL", code: "BAD_REQUEST" },
            { status: 400 }
          );
        }
        const arrayBuf = await res.arrayBuffer();
        if (arrayBuf.byteLength > MAX_IMAGE_SIZE) {
          return NextResponse.json(
            { error: `Image too large (max ${MAX_IMAGE_SIZE / 1024 / 1024} MB)`, code: "BAD_REQUEST" },
            { status: 400 }
          );
        }
        imageBuffer = Buffer.from(arrayBuf);
      } else {
        return NextResponse.json(
          { error: "Provide 'image' (multipart) or 'image_url' (JSON)", code: "BAD_REQUEST" },
          { status: 400 }
        );
      }

      if (body.detect_bib !== undefined) detectBib = !!body.detect_bib;
      if (body.detect_face !== undefined) detectFace = !!body.detect_face;
      if (body.min_confidence !== undefined) minConfidence = Math.max(0, Math.min(1, body.min_confidence));
    } else {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data or application/json", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }

  // 3. Deduct credit
  const creditResult = await deductApiCredit(user.id, `API analyze (key: ${apiKey.name})`);
  if (!creditResult) {
    return NextResponse.json(
      { error: "Insufficient credits", code: "PAYMENT_REQUIRED", credits_remaining: 0 },
      { status: 402 }
    );
  }

  // 4. Run analysis in parallel
  const taskId = `api_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  const promises: Promise<any>[] = [];
  if (detectBib) promises.push(detectTextFromImage(imageBuffer).catch(() => null));
  else promises.push(Promise.resolve(null));

  if (detectFace) promises.push(indexFaces(imageBuffer, taskId).catch(() => null));
  else promises.push(Promise.resolve(null));

  const [ocrResult, facesResult] = await Promise.all(promises);

  // 5. Format response
  const bibNumbers = ocrResult
    ? ocrResult.rawDetections
        .filter((d: any) => d.type === "LINE" && d.confidence / 100 >= minConfidence)
        .flatMap((d: any) => {
          const matches = d.text.match(/\b\d{1,5}\b/g) || [];
          return matches.map((num: string) => ({
            number: num,
            confidence: d.confidence / 100,
          }));
        })
        .filter((b: any) => {
          const n = parseInt(b.number, 10);
          return n >= 1 && n <= 99999 && !(n >= 1900 && n <= 2100);
        })
    : [];

  // Deduplicate bib numbers (keep highest confidence)
  const bibMap = new Map<string, any>();
  for (const b of bibNumbers) {
    if (!bibMap.has(b.number) || bibMap.get(b.number).confidence < b.confidence) {
      bibMap.set(b.number, b);
    }
  }

  const faces = facesResult
    ? facesResult
        .filter((f: any) => f.confidence / 100 >= minConfidence)
        .map((f: any) => ({
          face_id: f.faceId,
          confidence: f.confidence / 100,
          bounding_box: f.boundingBox,
        }))
    : [];

  return NextResponse.json({
    task_id: taskId,
    bib_numbers: Array.from(bibMap.values()),
    faces,
    processing_time_ms: Date.now() - startTime,
    credits_remaining: creditResult.creditsRemaining,
  });
}
