import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { stripe, getStripe, SERVICE_FEE_EUR } from "@/lib/stripe";
import { randomBytes } from "crypto";
import { sendPurchaseConfirmation } from "@/lib/email";
import { grantXp } from "@/lib/gamification/xp-service";
import { recordStreakActivity } from "@/lib/gamification/streak-service";
import { completeReferral } from "@/lib/gamification/referral-service";

/**
 * Transfer pending payouts to a newly-connected Stripe account.
 * Called when account.updated fires and charges_enabled becomes true.
 */
async function processDeferredPayouts(stripeAccountId: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { stripeAccountId },
      select: { id: true },
    });
    if (!user) return;

    // Find all PAID orders with PENDING payout for events owned by this user
    const pendingOrders = await prisma.order.findMany({
      where: {
        event: { userId: user.id },
        status: { in: ["PAID", "DELIVERED"] },
        payoutStatus: "PENDING",
        photographerPayout: { gt: 0 },
      },
      select: {
        id: true,
        photographerPayout: true,
        totalAmount: true,
      },
    });

    if (pendingOrders.length === 0) return;

    console.log(`Processing ${pendingOrders.length} deferred payouts for account ${stripeAccountId}`);

    const stripeClient = getStripe();

    for (const order of pendingOrders) {
      try {
        const transferAmount = Math.round(order.photographerPayout * 100);
        if (transferAmount <= 0) continue;

        const transfer = await stripeClient.transfers.create({
          amount: transferAmount,
          currency: "eur",
          destination: stripeAccountId,
          metadata: {
            orderId: order.id,
            type: "deferred_payout",
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

        console.log(`Deferred payout transferred: order ${order.id}, amount ${euro(order.photographerPayout)}, transfer ${transfer.id}`);
      } catch (transferErr) {
        console.error(`Failed to transfer deferred payout for order ${order.id}:`, transferErr);
      }
    }
  } catch (err) {
    console.error("Error processing deferred payouts:", err);
  }
}

function euro(amount: number): string {
  return `${amount.toFixed(2)}€`;
}

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

    // Grant XP for purchase (sportif) and sale (photographe)
    try {
      if (order.userId) {
        // Sportif XP: per photo purchased
        for (let i = 0; i < order.items.length; i++) {
          await grantXp(order.userId, "PHOTO_PURCHASE", { orderId: order.id, photoId: order.items[i].photoId });
        }
        // Record purchase streak
        await recordStreakActivity(order.userId, "purchase");
        // Complete referral if first purchase
        await completeReferral(order.userId, "first_purchase");
      }
      // Photographe XP: per photo sold
      if (order.event.userId) {
        for (let i = 0; i < order.items.length; i++) {
          await grantXp(order.event.userId, "PHOTO_SOLD", { orderId: order.id, photoId: order.items[i].photoId });
        }
      }
    } catch (xpErr) {
      console.error("Failed to grant XP:", xpErr);
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

      // Calculate exact Stripe fees and photographer payout
      try {
        const chargeId =
          typeof paymentIntent.latest_charge === "string"
            ? paymentIntent.latest_charge
            : paymentIntent.latest_charge?.id;

        const totalAmount = paymentIntent.amount / 100; // euros
        const serviceFeeAmount = SERVICE_FEE_EUR; // 1€ for platform
        const photographerStripeAccountId = paymentIntent.metadata?.photographerStripeAccountId;

        // Get exact Stripe fee from balance_transaction
        let stripeFee = 0;
        if (chargeId) {
          try {
            const charge = await stripe.charges.retrieve(chargeId, {
              expand: ["balance_transaction"],
            });
            const bt = charge.balance_transaction;
            stripeFee = bt && typeof bt !== "string" ? bt.fee / 100 : 0;
          } catch (feeErr) {
            console.error("Error retrieving Stripe fee:", feeErr);
          }
        }

        // Photographer gets: total - platform fee (1€) - Stripe fees
        const photographerPayout = Math.max(totalAmount - serviceFeeAmount - stripeFee, 0);

        if (photographerStripeAccountId) {
          // Photographer has connected Stripe → create a manual Transfer
          try {
            const transferAmountCents = Math.round(photographerPayout * 100);
            if (transferAmountCents > 0) {
              const stripeClient = getStripe();
              const transfer = await stripeClient.transfers.create({
                amount: transferAmountCents,
                currency: "eur",
                destination: photographerStripeAccountId,
                source_transaction: chargeId || undefined,
                metadata: {
                  orderId,
                  type: "photo_sale_payout",
                },
              });

              await prisma.order.updateMany({
                where: { id: orderId },
                data: {
                  stripeFee,
                  photographerPayout,
                  payoutStatus: "TRANSFERRED",
                  transferredAt: new Date(),
                  stripeTransferId: transfer.id,
                },
              });

              console.log(
                `Payout transferred: order ${orderId}, total ${euro(totalAmount)}, ` +
                `platform ${euro(serviceFeeAmount)}, stripe ${euro(stripeFee)}, ` +
                `photographer ${euro(photographerPayout)}, transfer ${transfer.id}`
              );
            }
          } catch (transferErr) {
            console.error(`Error creating transfer for order ${orderId}:`, transferErr);
            // Still record the fees even if transfer fails
            await prisma.order.updateMany({
              where: { id: orderId },
              data: {
                stripeFee,
                photographerPayout,
                payoutStatus: "PENDING",
              },
            });
          }
        } else {
          // Photographer not connected — deferred payout
          // Record exact amounts, payoutStatus stays PENDING
          await prisma.order.updateMany({
            where: { id: orderId },
            data: {
              stripeFee,
              photographerPayout,
            },
          });
          console.log(
            `Deferred payout: order ${orderId}, total ${euro(totalAmount)}, ` +
            `platform ${euro(serviceFeeAmount)}, stripe ${euro(stripeFee)}, ` +
            `photographer ${euro(photographerPayout)} (pending)`
          );
        }
      } catch (err) {
        console.error("Error processing payment fees:", err);
      }
      break;
    }

    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      if (account.charges_enabled && account.payouts_enabled) {
        const updatedUsers = await prisma.user.updateMany({
          where: { stripeAccountId: account.id, stripeOnboarded: false },
          data: { stripeOnboarded: true },
        });

        // Process deferred payouts when a photographer completes Stripe onboarding
        if (updatedUsers.count > 0) {
          await processDeferredPayouts(account.id);
        }
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
