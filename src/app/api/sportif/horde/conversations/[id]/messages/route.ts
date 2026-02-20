import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notificationEmitter } from "@/lib/notification-emitter";

// GET — Messages paginés (cursor-based, limit 50)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const conversationId = params.id;
  const userId = session.user.id;

  // Verify user is participant
  const participant = await prisma.hordeConversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participant) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = 50;

  const messages = await prisma.hordeMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      user: { select: { id: true, name: true, faceImagePath: true } },
    },
  });

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();

  return NextResponse.json({
    messages: messages.reverse(),
    nextCursor: hasMore ? messages[0]?.id : null,
  });
}

// POST — Envoyer un message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const conversationId = params.id;
  const userId = session.user.id;

  // Verify user is participant
  const participant = await prisma.hordeConversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participant) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const body = await request.json();
  const { content } = body as { content: string };

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Message vide" }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: "Message trop long (max 2000 caractères)" }, { status: 400 });
  }

  // Create message and update conversation.updatedAt
  const [message] = await Promise.all([
    prisma.hordeMessage.create({
      data: {
        conversationId,
        userId,
        content: content.trim(),
      },
      include: {
        user: { select: { id: true, name: true, faceImagePath: true } },
      },
    }),
    prisma.hordeConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
    // Update sender's lastReadAt
    prisma.hordeConversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: new Date() },
    }),
  ]);

  // Notify other participants via SSE
  const participants = await prisma.hordeConversationParticipant.findMany({
    where: { conversationId, userId: { not: userId } },
    select: { userId: true },
  });

  for (const p of participants) {
    notificationEmitter.notifyUserChat(p.userId, conversationId);
  }

  return NextResponse.json(message, { status: 201 });
}
