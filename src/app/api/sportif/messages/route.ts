import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notificationEmitter } from "@/lib/notification-emitter";

// POST — envoyer un message à un photographe
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { recipientId, subject, message, eventId } = body;

  if (!recipientId || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Destinataire, sujet et message requis" }, { status: 400 });
  }

  // Verify recipient exists and is a photographer/pro
  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { id: true, role: true },
  });

  if (!recipient) {
    return NextResponse.json({ error: "Destinataire introuvable" }, { status: 404 });
  }

  const supportMessage = await prisma.supportMessage.create({
    data: {
      userId: session.user.id,
      recipientId,
      subject: subject.trim(),
      message: message.trim(),
      category: "EVENT",
      eventId: eventId || null,
    },
  });

  // Notify recipient
  notificationEmitter.notifyUser(recipientId);

  return NextResponse.json(supportMessage, { status: 201 });
}
