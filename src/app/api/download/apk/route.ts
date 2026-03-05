import { NextResponse } from "next/server";
import { getFromS3, getS3ObjectSize } from "@/lib/s3";

export async function GET() {
  try {
    const s3Key = "platform/focus-racer.apk";

    const [stream, size] = await Promise.all([
      getFromS3(s3Key),
      getS3ObjectSize(s3Key),
    ]);

    if (!stream) {
      return NextResponse.json(
        { error: "APK non disponible" },
        { status: 404 }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="focus-racer.apk"',
      "Cache-Control": "public, max-age=3600",
    };

    if (size) {
      headers["Content-Length"] = size.toString();
    }

    return new NextResponse(stream, { status: 200, headers });
  } catch (error) {
    console.error("[Download APK] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors du telechargement" },
      { status: 500 }
    );
  }
}
