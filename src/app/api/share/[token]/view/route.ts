import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Simple increment without complex dedup for now
    await prisma.shareEvent.update({
      where: { shareToken: params.token },
      data: { viewCount: { increment: 1 } },
    });

    // Check if reward threshold reached
    const shareEvent = await prisma.shareEvent.findUnique({
      where: { shareToken: params.token },
      select: { viewCount: true, rewardGiven: true, userId: true },
    });

    if (shareEvent && shareEvent.viewCount >= 50 && !shareEvent.rewardGiven && shareEvent.userId) {
      await prisma.shareEvent.update({
        where: { shareToken: params.token },
        data: { rewardGiven: true },
      });
      // Grant credits
      await prisma.user.update({
        where: { id: shareEvent.userId },
        data: { credits: { increment: 20 } },
      });
      await prisma.creditTransaction.create({
        data: {
          userId: shareEvent.userId,
          type: "ADMIN_GRANT",
          amount: 20,
          balanceBefore: 0,
          balanceAfter: 0,
          reason: "Bonus partage : 50 vues atteintes",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking view:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
