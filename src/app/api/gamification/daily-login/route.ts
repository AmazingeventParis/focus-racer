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
    const todayKey = today.toISOString().slice(0, 10); // "2026-02-25"

    // Use a unique daily key to prevent race conditions
    // grantXp already checks for one-time via findFirst, but we add an extra
    // check with metadata containing today's date to prevent duplicates
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

    // Use metadata with day key for de-duplication
    const result = await grantXp(userId, "DAILY_LOGIN", { day: todayKey });

    // Auto-claim profile_complete if applicable
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, phone: true },
      });
      if (user && user.name && user.email && user.phone) {
        const { claimCreditReward } = await import("@/lib/gamification/credit-reward-service");
        await claimCreditReward(userId, "profile_complete");
      }
    } catch {
      // non-blocking
    }

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
