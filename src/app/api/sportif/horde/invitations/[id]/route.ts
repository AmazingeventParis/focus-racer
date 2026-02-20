import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH — accepter ou décliner une invitation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body;

  if (!["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  const invitation = await prisma.hordeMember.findUnique({
    where: { id: params.id },
  });

  if (!invitation || invitation.userId !== session.user.id) {
    return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });
  }

  if (invitation.status !== "PENDING") {
    return NextResponse.json({ error: "Cette invitation a déjà été traitée" }, { status: 400 });
  }

  const updated = await prisma.hordeMember.update({
    where: { id: params.id },
    data: {
      status: action === "accept" ? "ACCEPTED" : "DECLINED",
      joinedAt: action === "accept" ? new Date() : null,
    },
  });

  return NextResponse.json(updated);
}
