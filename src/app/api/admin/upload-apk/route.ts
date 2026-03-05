import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToS3 } from "@/lib/s3";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("apk") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier APK requis" }, { status: 400 });
    }

    if (!file.name.endsWith(".apk")) {
      return NextResponse.json({ error: "Le fichier doit etre un .apk" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadToS3(buffer, "platform/focus-racer.apk", "application/vnd.android.package-archive");

    return NextResponse.json({
      success: true,
      size: buffer.length,
      key: "platform/focus-racer.apk",
    });
  } catch (error) {
    console.error("[Upload APK] Error:", error);
    return NextResponse.json({ error: "Erreur upload" }, { status: 500 });
  }
}
