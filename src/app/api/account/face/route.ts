import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { uploadToS3 } from "@/lib/s3";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

// Upload face image for runner profile (used for photo matching)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("face") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Image requise" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Resize to standard face image (400x400 max, JPEG)
  const processed = await sharp(buffer)
    .resize(400, 400, { fit: "cover" })
    .jpeg({ quality: 90 })
    .toBuffer();

  const ext = "jpg";
  const s3Key = `users/${session.user.id}/face_${uuidv4()}.${ext}`;

  await uploadToS3(s3Key, processed, `image/jpeg`);

  // Update user profile
  await prisma.user.update({
    where: { id: session.user.id },
    data: { faceImagePath: s3Key },
  });

  return NextResponse.json({
    success: true,
    message: "Photo de profil enregistree. Elle sera utilisee pour retrouver vos photos.",
  });
}

// Get current face image status
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { faceImagePath: true },
  });

  return NextResponse.json({
    hasFaceImage: !!user?.faceImagePath,
  });
}

// Delete face image
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { faceImagePath: null },
  });

  return NextResponse.json({ success: true });
}
