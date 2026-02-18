import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

  if (msg.userId !== session.user.id) {
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
    return NextResponse.json(updated);
  }

  // User reply
  if (!reply?.trim()) {
    return NextResponse.json({ error: "Réponse requise" }, { status: 400 });
  }

  const currentReplies = (msg.replies as any[]) || [];
  const newReply = {
    role: "user",
    content: reply.trim(),
    date: new Date().toISOString(),
    author: session.user.name || session.user.email,
  };

  const updated = await prisma.supportMessage.update({
    where: { id: params.id },
    data: {
      replies: [...currentReplies, newReply],
      status: "OPEN",
      readByUser: true,
    },
  });

  return NextResponse.json(updated);
}
