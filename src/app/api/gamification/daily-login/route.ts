import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { grantXp } from "@/lib/gamification/xp-service";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already logged in today
    const existing = await prisma.xpEvent.findFirst({
      where: {
        userId,
        action: "DAILY_LOGIN",
        createdAt: { gte: today },
      },
    });

    if (existing) {
      return NextResponse.json({ alreadyClaimed: true, xpGained: 0 });
    }

    const result = await grantXp(userId, "DAILY_LOGIN");

    return NextResponse.json({
      alreadyClaimed: false,
      xpGained: result?.xpGained ?? 0,
      levelUp: result?.levelUp ?? false,
      newLevel: result?.newLevel,
    });
  } catch (error) {
    console.error("Error daily login:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
