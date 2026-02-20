import { NextResponse } from "next/server";
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
