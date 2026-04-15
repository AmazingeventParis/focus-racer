import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// DELETE — retirer un membre (owner) ou quitter (self)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const member = await prisma.hordeMember.findUnique({
    where: { id: params.id },
    include: { horde: true },
  });

  if (!member) {
    return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });
  }

  // Allow: owner removes member OR member leaves
  const isOwner = member.horde.ownerId === session.user.id;
  const isSelf = member.userId === session.user.id;

  if (!isOwner && !isSelf) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  await prisma.hordeMember.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
