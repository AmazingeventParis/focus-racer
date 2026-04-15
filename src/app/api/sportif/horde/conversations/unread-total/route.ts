import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET — Total messages non lus dans toutes les conversations horde
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get all conversations where user is participant
  const participations = await prisma.hordeConversationParticipant.findMany({
    where: { userId },
    select: { conversationId: true, lastReadAt: true },
  });

  if (participations.length === 0) {
    return NextResponse.json({ count: 0 });
  }

  // Count unread messages across all conversations
  let total = 0;
  for (const p of participations) {
    const count = await prisma.hordeMessage.count({
      where: {
        conversationId: p.conversationId,
        createdAt: { gt: p.lastReadAt },
        userId: { not: userId },
      },
    });
    total += count;
  }

  return NextResponse.json({ count: total });
}
