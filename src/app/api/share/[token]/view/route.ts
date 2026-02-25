import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Atomic increment
    const shareEvent = await prisma.shareEvent.update({
      where: { shareToken: params.token },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true, rewardGiven: true, userId: true },
    });

    // Check if reward threshold reached — use atomic updateMany with condition
    // to prevent double-granting on concurrent requests
    if (shareEvent && shareEvent.viewCount >= 50 && !shareEvent.rewardGiven && shareEvent.userId) {
      const updated = await prisma.shareEvent.updateMany({
        where: {
          shareToken: params.token,
          rewardGiven: false, // Atomic condition: only succeeds once
        },
        data: { rewardGiven: true },
      });

      // Only grant credits if we were the one to flip rewardGiven
      if (updated.count > 0) {
        const user = await prisma.user.findUnique({
          where: { id: shareEvent.userId },
          select: { credits: true },
        });
        const balanceBefore = user?.credits ?? 0;

        await prisma.user.update({
          where: { id: shareEvent.userId },
          data: { credits: { increment: 20 } },
        });
        await prisma.creditTransaction.create({
          data: {
            userId: shareEvent.userId,
            type: "ADMIN_GRANT",
            amount: 20,
            balanceBefore,
            balanceAfter: balanceBefore + 20,
            reason: "Bonus partage : 50 vues atteintes",
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking view:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
