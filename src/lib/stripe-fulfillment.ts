import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import {
  sendPurchaseConfirmation,
  sendNewSaleEmail,
} from "@/lib/email";
import { recordStreakActivity } from "@/lib/gamification/streak-service";
import { completeReferral } from "@/lib/gamification/referral-service";
import { canSendEmail, generateUnsubscribeUrl } from "@/lib/notification-preferences";

/**
 * Fulfill a photo-pack order atomically and idempotently.
 *
 * Uses a single `updateMany` guarded on `status: "PENDING"` so that concurrent
 * Stripe webhook retries (checkout.session.completed + payment_intent.succeeded
 * can both fire for the same payment) only ever run the side effects once.
 *
 * The caller that gets `count === 1` owns the fulfillment; every other caller
 * (count === 0) returns immediately without touching emails, streaks, or referrals.
 */
export async function fulfillOrder(orderId: string, paymentId: string): Promise<void> {
  const downloadToken = randomBytes(32).toString("hex");
  const downloadExpiresAt = new Date();
  downloadExpiresAt.setHours(downloadExpiresAt.getHours() + 72);

  // Atomic claim: only the first caller that flips PENDING -> PAID proceeds.
  const claim = await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: { status: "PAID", stripePaymentId: paymentId, downloadToken, downloadExpiresAt },
  });
  if (claim.count === 0) {
    return; // already fulfilled by another (retried) delivery, or order missing
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { event: true, items: { include: { photo: true } }, user: true },
  });
  if (!order) return;

  const recipientEmail = order.user?.email || order.guestEmail;
  const recipientName = order.user?.name || order.guestName || "Client";

  if (recipientEmail) {
    try {
      await sendPurchaseConfirmation({
        to: recipientEmail,
        name: recipientName,
        orderId: order.id,
        eventName: order.event.name,
        photoCount: order.items.length,
        totalAmount: order.totalAmount,
        downloadToken: order.downloadToken!,
        expiresAt: order.downloadExpiresAt!,
      });
    } catch (emailErr) {
      console.error("Failed to send confirmation email:", emailErr);
    }
  }

  // Record purchase streak (sportif) and complete referral
  try {
    if (order.userId) {
      await recordStreakActivity(order.userId, "purchase");
      await completeReferral(order.userId, "first_purchase");
    }
  } catch (xpErr) {
    console.error("Failed post-purchase gamification:", xpErr);
  }

  // Notify photographer of new sale
  if (order.event.userId) {
    try {
      const photographer = await prisma.user.findUnique({
        where: { id: order.event.userId },
        select: { email: true, name: true },
      });
      if (photographer) {
        const ok = await canSendEmail(order.event.userId, "newSale");
        if (ok) {
          const buyerName = order.user?.name || order.guestName || "Un sportif";
          const totalStr = `${order.totalAmount.toFixed(2).replace(".", ",")} €`;
          await sendNewSaleEmail({
            to: photographer.email,
            name: photographer.name || "photographe",
            buyerName,
            eventName: order.event.name,
            photoCount: order.items.length,
            totalAmount: totalStr,
            orderId: order.id,
            unsubscribeUrl: generateUnsubscribeUrl(order.event.userId, "newSale"),
          });
        }
      }
      // Push notification
      const { notifyNewSale } = await import("@/lib/notify");
      await notifyNewSale(
        order.event.userId,
        `${order.totalAmount.toFixed(2).replace(".", ",")} €`,
        order.event.name
      );
    } catch (saleEmailErr) {
      console.error("[Email] New sale notification error:", saleEmailErr);
    }
  }
}
