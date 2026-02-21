import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notificationEmitter } from "@/lib/notification-emitter";

// PATCH - User replies to a conversation or closes it
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const msg = await prisma.supportMessage.findUnique({
    where: { id: params.id },
  });

  if (!msg) {
    return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
  }

  // Allow both the original sender (userId) and the recipient to reply
  if (msg.userId !== session.user.id && msg.recipientId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  if (msg.status === "CLOSED") {
    return NextResponse.json({ error: "Conversation clôturée" }, { status: 400 });
  }

  const body = await request.json();
  const { action, reply } = body;

  // Close the conversation
  if (action === "close") {
    const updated = await prisma.supportMessage.update({
      where: { id: params.id },
      data: { status: "CLOSED" },
    });
    // Notify admin that a message was closed (count may change)
    notificationEmitter.notifyAdmin();
    return NextResponse.json(updated);
  }

  // User reply
  if (!reply?.trim()) {
    return NextResponse.json({ error: "Réponse requise" }, { status: 400 });
  }

  const isOriginalSender = msg.userId === session.user.id;
  const currentReplies = (msg.replies as any[]) || [];
  const newReply = {
    role: isOriginalSender ? "user" : "recipient",
    content: reply.trim(),
    date: new Date().toISOString(),
    author: session.user.name || session.user.email,
  };

  const updated = await prisma.supportMessage.update({
    where: { id: params.id },
    data: {
      replies: [...currentReplies, newReply],
      status: isOriginalSender ? "OPEN" : "IN_PROGRESS",
      readByUser: isOriginalSender,
      readByRecipient: !isOriginalSender,
    },
  });

  // Notify the other party + admin
  notificationEmitter.notifyAdmin();
  if (isOriginalSender && msg.recipientId) {
    // Sportif replied → notify the photographer
    notificationEmitter.notifyUser(msg.recipientId);
  } else if (!isOriginalSender && msg.userId) {
    // Photographer replied → notify the sportif
    notificationEmitter.notifyUser(msg.userId);
  }

  return NextResponse.json(updated);
}
