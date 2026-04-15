import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// "Ce n'est pas moi" — runner reports wrong bib association
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const photoId = params.id;
  const body = await request.json();
  const { bibNumber } = body;

  if (!bibNumber) {
    return NextResponse.json({ error: "Numero de dossard requis" }, { status: 400 });
  }

  // Remove the specific bib-photo association
  const deleted = await prisma.bibNumber.deleteMany({
    where: { photoId, number: bibNumber },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Association non trouvee" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: "Association supprimee. Merci pour le signalement.",
  });
}
