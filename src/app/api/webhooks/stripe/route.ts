import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { randomBytes } from "crypto";
import { sendPurchaseConfirmation } from "@/lib/email";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Helper to fulfill an order (shared by checkout.session.completed and payment_intent.succeeded)
  async function fulfillOrder(orderId: string, paymentId: string) {
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!existing || existing.status !== "PENDING") {
      return; // Already processed or not found
    }

    const downloadToken = randomBytes(32).toString("hex");
    const downloadExpiresAt = new Date();
    downloadExpiresAt.setHours(downloadExpiresAt.getHours() + 72);

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        stripePaymentId: paymentId,
        downloadToken,
        downloadExpiresAt,
      },
      include: {
        event: true,
        items: { include: { photo: true } },
        user: true,
      },
    });

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
  }

  // Helper to fulfill a credit purchase
  async function fulfillCreditPurchase(userId: string, creditAmount: number, reason: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });
    if (!user) {
      console.error("Credit fulfillment: user not found", userId);
      return;
    }
    const balanceBefore = user.credits;
    const balanceAfter = balanceBefore + creditAmount;
    await prisma.user.update({
      where: { id: userId },
      data: { credits: balanceAfter },
    });
    await prisma.creditTransaction.create({
      data: {
        userId,
        type: "PURCHASE",
        amount: creditAmount,
        balanceBefore,
        balanceAfter,
        reason,
      },
    });
    console.log(`Credits fulfilled: +${creditAmount} for user ${userId} (${balanceBefore} -> ${balanceAfter})`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Credit purchase fulfillment
      if (session.metadata?.type === "credit_purchase") {
        const userId = session.metadata.userId;
        const creditAmount = parseInt(session.metadata.creditAmount, 10);
        if (userId && creditAmount > 0) {
          await fulfillCreditPurchase(
            userId,
            creditAmount,
            `Achat de ${creditAmount.toLocaleString("fr-FR")} credits`
          );
        }
        break;
      }

      // Credit subscription first payment (checkout completed)
      if (session.metadata?.type === "credit_subscription") {
        const userId = session.metadata.userId;
        const creditAmount = parseInt(session.metadata.creditAmount, 10);
        if (userId && creditAmount > 0) {
          await fulfillCreditPurchase(
            userId,
            creditAmount,
            `Abonnement ${creditAmount.toLocaleString("fr-FR")} credits/mois - premier mois`
          );
        }
        break;
      }

      // Photo order fulfillment
      const orderId = session.metadata?.orderId;
      if (!orderId) {
        console.error("No orderId in session metadata");
        break;
      }
      await fulfillOrder(orderId, session.payment_intent as string);
      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;
      if (!orderId) {
        break; // Not our payment intent
      }
      await fulfillOrder(orderId, paymentIntent.id);

      // Track Connect fees if this was a Connect payment
      if (paymentIntent.transfer_data?.destination) {
        try {
          const chargeId =
            typeof paymentIntent.latest_charge === "string"
              ? paymentIntent.latest_charge
              : paymentIntent.latest_charge?.id;

          if (chargeId) {
            const charge = await stripe.charges.retrieve(chargeId, {
              expand: ["balance_transaction"],
            });

            const bt = charge.balance_transaction;
            const stripeFee =
              bt && typeof bt !== "string" ? bt.fee / 100 : 0;
            const appFee = (paymentIntent.application_fee_amount || 0) / 100;
            const totalAmount = paymentIntent.amount / 100;
            const photographerPayout = totalAmount - appFee - stripeFee;

            await prisma.order.updateMany({
              where: { id: orderId },
              data: {
                stripeFee,
                photographerPayout: Math.max(photographerPayout, 0),
                stripeTransferId:
                  typeof paymentIntent.transfer_data.destination === "string"
                    ? paymentIntent.transfer_data.destination
                    : undefined,
              },
            });
          }
        } catch (feeErr) {
          console.error("Error tracking Connect fees:", feeErr);
        }
      }
      break;
    }

    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      if (account.charges_enabled && account.payouts_enabled) {
        await prisma.user.updateMany({
          where: { stripeAccountId: account.id, stripeOnboarded: false },
          data: { stripeOnboarded: true },
        });
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subMeta = invoice.subscription_details?.metadata;
      if (subMeta?.type === "credit_subscription") {
        const userId = subMeta.userId;
        const creditAmount = parseInt(subMeta.creditAmount, 10);
        if (userId && creditAmount > 0) {
          await fulfillCreditPurchase(
            userId,
            creditAmount,
            `Abonnement ${creditAmount.toLocaleString("fr-FR")} credits/mois - renouvellement`
          );
        }
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await prisma.order.updateMany({
          where: { id: orderId, status: "PENDING" },
          data: { status: "EXPIRED" },
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
