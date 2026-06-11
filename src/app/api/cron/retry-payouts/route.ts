import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { isAuthorizedCron } from "@/lib/cron-auth";

export const maxDuration = 300;

/**
 * Cron endpoint: retry pending Stripe Connect payouts.
 * A transfer can fail transiently (webhook error, account just connected) and
 * the only other retry path is the account.updated webhook — which may never
 * fire again. This cron guarantees photographers eventually get paid.
 * Schedule daily: curl -H "Authorization: Bearer $CRON_SECRET" "https://.../api/cron/retry-payouts"
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // PAID/DELIVERED orders awaiting payout whose event owner has a connected,
    // onboarded Stripe account
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: { in: ["PAID", "DELIVERED"] },
        payoutStatus: "PENDING",
        photographerPayout: { gt: 0 },
        event: {
          user: {
            stripeAccountId: { not: null },
            stripeOnboarded: true,
          },
        },
      },
      select: {
        id: true,
        photographerPayout: true,
        event: {
          select: {
            user: { select: { stripeAccountId: true } },
          },
        },
      },
      take: 100,
    });

    if (pendingOrders.length === 0) {
      return NextResponse.json({ retried: 0, transferred: 0, failed: 0 });
    }

    const stripeClient = getStripe();
    let transferred = 0;
    let failed = 0;

    for (const order of pendingOrders) {
      const destination = order.event.user.stripeAccountId;
      if (!destination) continue;

      const transferAmount = Math.round(order.photographerPayout * 100);
      if (transferAmount <= 0) continue;

      try {
        const transfer = await stripeClient.transfers.create({
          amount: transferAmount,
          currency: "eur",
          destination,
          metadata: {
            orderId: order.id,
            type: "retry_payout",
          },
        });

        await prisma.order.update({
          where: { id: order.id },
          data: {
            payoutStatus: "TRANSFERRED",
            transferredAt: new Date(),
            stripeTransferId: transfer.id,
          },
        });

        transferred++;
        console.log(`[cron/retry-payouts] Order ${order.id}: ${order.photographerPayout.toFixed(2)}€ transferred (${transfer.id})`);
      } catch (transferErr) {
        failed++;
        console.error(`[cron/retry-payouts] Transfer failed for order ${order.id}:`, transferErr);
      }
    }

    if (failed > 0) {
      console.warn(`[cron/retry-payouts] ${failed} payout(s) still failing — check Stripe dashboard`);
    }

    return NextResponse.json({
      retried: pendingOrders.length,
      transferred,
      failed,
    });
  } catch (error) {
    console.error("[cron/retry-payouts] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
