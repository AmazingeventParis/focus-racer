import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET — invitations reçues en PENDING
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const invitations = await prisma.hordeMember.findMany({
    where: { userId: session.user.id, status: "PENDING" },
    include: {
      horde: {
        include: {
          owner: { select: { id: true, name: true, sportifId: true } },
        },
      },
    },
    orderBy: { invitedAt: "desc" },
  });

  return NextResponse.json(invitations);
}
