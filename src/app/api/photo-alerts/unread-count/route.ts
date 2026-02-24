import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 });
    }

    const alerts = await prisma.photoAlert.findMany({
      where: { userId: session.user.id },
      select: { eventId: true, bibNumber: true, lastNotifiedCount: true },
    });

    if (alerts.length === 0) {
      return NextResponse.json({ count: 0 });
    }

    let count = 0;
    for (const alert of alerts) {
      const photoCount = await prisma.photo.count({
        where: {
          eventId: alert.eventId,
          bibNumbers: { some: { number: alert.bibNumber } },
        },
      });
      if (photoCount > alert.lastNotifiedCount) count++;
    }

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
