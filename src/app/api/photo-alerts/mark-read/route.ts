import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST: mark all alerts as read (set lastNotifiedCount = photoCount)
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const alerts = await prisma.photoAlert.findMany({
      where: { userId: session.user.id },
    });

    for (const alert of alerts) {
      if (alert.photoCount > alert.lastNotifiedCount) {
        await prisma.photoAlert.update({
          where: { id: alert.id },
          data: { lastNotifiedCount: alert.photoCount },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error marking alerts read:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
