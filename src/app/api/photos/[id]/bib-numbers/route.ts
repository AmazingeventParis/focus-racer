import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const photoId = params.id;
    const body = await request.json();
    const { number } = body;

    if (!number || typeof number !== "string") {
      return NextResponse.json(
        { error: "Numéro de dossard requis" },
        { status: 400 }
      );
    }

    // Verify photo ownership
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: { event: true },
    });

    if (!photo) {
      return NextResponse.json(
        { error: "Photo non trouvée" },
        { status: 404 }
      );
    }

    if (photo.event.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Create the bib number
    const bibNumber = await prisma.bibNumber.create({
      data: {
        number: number.trim(),
        photoId,
        confidence: 100, // Manual entry = 100% confidence
        source: "MANUAL",
      },
    });

    return NextResponse.json(bibNumber);
  } catch (error) {
    console.error("Error adding bib number:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout du dossard" },
      { status: 500 }
    );
  }
}
