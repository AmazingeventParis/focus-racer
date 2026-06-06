import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    // Auto-claim profile_complete credit reward if profile is complete
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

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error daily login:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
