import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET — retourne ou crée la horde de l'utilisateur
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;

  let horde = await prisma.horde.findUnique({
    where: { ownerId: userId },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, sportifId: true, faceImagePath: true } },
        },
        orderBy: { invitedAt: "desc" },
      },
    },
  });

  if (!horde) {
    horde = await prisma.horde.create({
      data: { ownerId: userId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, sportifId: true, faceImagePath: true } },
          },
          orderBy: { invitedAt: "desc" },
        },
      },
    });
  }

  return NextResponse.json(horde);
}

// PATCH — modifier le nom de la horde
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  }

  const horde = await prisma.horde.findUnique({ where: { ownerId: session.user.id } });
  if (!horde) {
    return NextResponse.json({ error: "Horde introuvable" }, { status: 404 });
  }

  const updated = await prisma.horde.update({
    where: { id: horde.id },
    data: { name: name.trim() },
  });

  return NextResponse.json(updated);
}
