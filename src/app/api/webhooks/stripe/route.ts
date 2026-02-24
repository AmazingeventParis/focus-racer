import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { stripe, getStripe, SERVICE_FEE_EUR } from "@/lib/stripe";
import { randomBytes } from "crypto";
import { sendPurchaseConfirmation } from "@/lib/email";

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
                payoutStatus: "TRANSFERRED",
                transferredAt: new Date(),
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
      } else if (orderId) {
        // No Connect transfer — deferred payout scenario
        // photographerPayout was already set at order creation time
        // payoutStatus stays PENDING (set at order creation)
        try {
          const totalAmount = paymentIntent.amount / 100;
          const serviceFeeAmount = SERVICE_FEE_EUR;
          const estimatedPayout = totalAmount - serviceFeeAmount;
          await prisma.order.updateMany({
            where: { id: orderId },
            data: {
              photographerPayout: Math.max(estimatedPayout, 0),
            },
          });
        } catch (err) {
          console.error("Error updating deferred payout estimate:", err);
        }
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
