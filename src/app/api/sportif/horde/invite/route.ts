import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST — inviter par sportifId
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { sportifId } = body;

  if (!sportifId || typeof sportifId !== "string") {
    return NextResponse.json({ error: "ID sportif requis" }, { status: 400 });
  }

  // Find the user to invite
  const invitee = await prisma.user.findUnique({
    where: { sportifId: sportifId.toUpperCase().trim() },
    select: { id: true, name: true, sportifId: true },
  });

  if (!invitee) {
    return NextResponse.json({ error: "Aucun sportif trouvé avec cet identifiant" }, { status: 404 });
  }

  if (invitee.id === session.user.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas vous inviter vous-même" }, { status: 400 });
  }

  // Get or create horde
  let horde = await prisma.horde.findUnique({ where: { ownerId: session.user.id } });
  if (!horde) {
    horde = await prisma.horde.create({ data: { ownerId: session.user.id } });
  }

  // Check if already a member
  const existing = await prisma.hordeMember.findUnique({
    where: { hordeId_userId: { hordeId: horde.id, userId: invitee.id } },
  });

  if (existing) {
    if (existing.status === "DECLINED") {
      // Re-invite
      const updated = await prisma.hordeMember.update({
        where: { id: existing.id },
        data: { status: "PENDING", invitedAt: new Date() },
        include: { user: { select: { id: true, name: true, sportifId: true } } },
      });
      return NextResponse.json(updated);
    }
    return NextResponse.json({ error: "Ce sportif est déjà membre ou invité" }, { status: 400 });
  }

  const member = await prisma.hordeMember.create({
    data: { hordeId: horde.id, userId: invitee.id },
    include: { user: { select: { id: true, name: true, sportifId: true } } },
  });

  return NextResponse.json(member, { status: 201 });
}
