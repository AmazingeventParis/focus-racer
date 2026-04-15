import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notificationEmitter } from "@/lib/notification-emitter";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const [r1, r2] = await Promise.all([
      prisma.supportMessage.updateMany({
        where: { userId: session.user.id, readByUser: false },
        data: { readByUser: true },
      }),
      prisma.supportMessage.updateMany({
        where: { recipientId: session.user.id, readByRecipient: false },
        data: { readByRecipient: true },
      }),
    ]);

    // If messages were marked read, notify user's other tabs to update badge
    if (r1.count + r2.count > 0) {
      notificationEmitter.notifyUser(session.user.id);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
