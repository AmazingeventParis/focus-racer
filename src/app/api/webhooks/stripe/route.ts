import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { stripe, getStripe, SERVICE_FEE_EUR } from "@/lib/stripe";
import { randomBytes } from "crypto";
import {
  sendPurchaseConfirmation,
  sendSubscriptionPaymentFailedEmail,
  sendSubscriptionRenewalEmail,
  sendSubscriptionCanceledEmail,
  sendStripeOnboardedEmail,
  sendNewSaleEmail,
} from "@/lib/email";
import { grantXp } from "@/lib/gamification/xp-service";
import { recordStreakActivity } from "@/lib/gamification/streak-service";
import { completeReferral } from "@/lib/gamification/referral-service";
import { canSendEmail, generateUnsubscribeUrl } from "@/lib/notification-preferences";

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
        for (let i = 0; i < order.items.length; i++) {
          await grantXp(order.userId, "PHOTO_PURCHASE", { orderId: order.id, photoId: order.items[i].photoId });
        }
        await recordStreakActivity(order.userId, "purchase");
        await completeReferral(order.userId, "first_purchase");
      }
      if (order.event.userId) {
        for (let i = 0; i < order.items.length; i++) {
          await grantXp(order.event.userId, "PHOTO_SOLD", { orderId: order.id, photoId: order.items[i].photoId });
        }
      }
    } catch (xpErr) {
      console.error("Failed to grant XP:", xpErr);
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

  // Idempotent + atomic credit fulfillment
  async function fulfillCreditPurchase(userId: string, creditAmount: number, reason: string, stripeSessionId: string) {
    // 1. Check idempotence via stripeSessionId unique constraint
    const existing = await prisma.creditTransaction.findUnique({
      where: { stripeSessionId },
    });
    if (existing) {
      console.log(`Credit fulfillment already processed for session ${stripeSessionId}, skipping`);
      return;
    }

    // 2. Atomic credit update via raw SQL (no read-then-write race)
    await prisma.$executeRaw`UPDATE "User" SET credits = credits + ${creditAmount} WHERE id = ${userId}`;

    // 3. Read updated balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    // 4. Create transaction with stripeSessionId (unique constraint protects against duplicates)
    try {
      await prisma.creditTransaction.create({
        data: {
          userId,
          type: "PURCHASE",
          amount: creditAmount,
          balanceBefore: (user?.credits || 0) - creditAmount,
          balanceAfter: user?.credits || 0,
          reason,
          stripeSessionId,
        },
      });
    } catch (err) {
      // If unique constraint violation, another webhook already processed this
      if ((err as { code?: string }).code === "P2002") {
        console.log(`Credit transaction already exists for session ${stripeSessionId} (race condition caught)`);
        return;
      }
      throw err;
    }

    console.log(`Credits fulfilled: +${creditAmount} for user ${userId} (balance now ${user?.credits || 0})`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Credit pack purchase fulfillment
      if (session.metadata?.type === "credit_purchase") {
        const userId = session.metadata.userId;
        const creditAmount = parseInt(session.metadata.creditAmount, 10);
        if (userId && creditAmount > 0) {
          await fulfillCreditPurchase(
            userId,
            creditAmount,
            `Achat de ${creditAmount.toLocaleString("fr-FR")} crédits`,
            session.id
          );
        }
        break;
      }

      // Credit subscription: save subscription info on User, do NOT credit here
      // Credits will come via invoice.payment_succeeded
      if (session.metadata?.type === "credit_subscription") {
        const userId = session.metadata.userId;
        const creditAmount = session.metadata.creditAmount;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          const now = new Date();
          const endsAt = new Date(now);
          endsAt.setFullYear(endsAt.getFullYear() + 1);

          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: "active",
              subscriptionPlan: creditAmount,
              subscriptionStartedAt: now,
              subscriptionEndsAt: endsAt,
              subscriptionCancelRequestedAt: null,
            },
          });

          console.log(`Subscription created: user ${userId}, plan ${creditAmount} credits/month, ends ${endsAt.toISOString()}`);
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
        break; // Not our payment intent (could be subscription payment)
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
        // Find user before update to send email
        const userBefore = await prisma.user.findFirst({
          where: { stripeAccountId: account.id, stripeOnboarded: false },
          select: { id: true, email: true, name: true },
        });

        const updatedUsers = await prisma.user.updateMany({
          where: { stripeAccountId: account.id, stripeOnboarded: false },
          data: { stripeOnboarded: true },
        });

        if (updatedUsers.count > 0) {
          await processDeferredPayouts(account.id);

          // Send Stripe onboarded email
          if (userBefore) {
            try {
              const ok = await canSendEmail(userBefore.id, "stripeOnboarded");
              if (ok) {
                await sendStripeOnboardedEmail({
                  to: userBefore.email,
                  name: userBefore.name || "photographe",
                  unsubscribeUrl: generateUnsubscribeUrl(userBefore.id, "stripeOnboarded"),
                });
              }
              // Push notification
              const { notifyStripeOnboarded } = await import("@/lib/notify");
              await notifyStripeOnboarded(userBefore.id);
            } catch (emailErr) {
              console.error("[Email] Stripe onboarded error:", emailErr);
            }
          }
        }
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;

      // Metadata can be in multiple places depending on Stripe API version:
      // 1. invoice.subscription_details.metadata (newer API)
      // 2. invoice.lines.data[0].metadata (line item metadata from subscription_data)
      // 3. Fallback: fetch subscription directly
      let subMeta = invoice.subscription_details?.metadata as Record<string, string> | undefined;

      if (!subMeta?.type) {
        // Try line items metadata
        const lines = (invoice as unknown as { lines?: { data?: Array<{ metadata?: Record<string, string> }> } }).lines;
        const lineMeta = lines?.data?.[0]?.metadata;
        if (lineMeta?.type === "credit_subscription") {
          subMeta = lineMeta;
        }
      }

      if (!subMeta?.type && invoice.subscription) {
        // Fallback: fetch subscription metadata from Stripe
        try {
          const stripeClient = getStripe();
          const subId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription.id;
          const sub = await stripeClient.subscriptions.retrieve(subId);
          if (sub.metadata?.type === "credit_subscription") {
            subMeta = sub.metadata as Record<string, string>;
          }
        } catch (fetchErr) {
          console.error("Error fetching subscription metadata:", fetchErr);
        }
      }

      if (subMeta?.type === "credit_subscription") {
        const userId = subMeta.userId;
        const creditAmount = parseInt(subMeta.creditAmount, 10);
        if (userId && creditAmount > 0) {
          const isFirstMonth = invoice.billing_reason === "subscription_create";
          const label = isFirstMonth ? "premier mois" : "renouvellement";
          await fulfillCreditPurchase(
            userId,
            creditAmount,
            `Abonnement ${creditAmount.toLocaleString("fr-FR")} crédits/mois — ${label}`,
            invoice.id
          );

          // Send renewal email (only for renewals, not first subscription)
          if (!isFirstMonth) {
            try {
              const subUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, name: true },
              });
              if (subUser) {
                const planLabel = `${creditAmount.toLocaleString("fr-FR")} crédits/mois`;
                const amountEur = invoice.amount_paid ? `${(invoice.amount_paid / 100).toFixed(2).replace(".", ",")} €` : "—";
                // next_payment_attempt is null when payment succeeded — calculate next date manually
                const nextRenewal = new Date();
                nextRenewal.setMonth(nextRenewal.getMonth() + 1);
                const nextDate = nextRenewal.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
                await sendSubscriptionRenewalEmail({
                  to: subUser.email,
                  name: subUser.name || "photographe",
                  plan: planLabel,
                  creditAmount,
                  amount: amountEur,
                  nextDate,
                });
              }
            } catch (emailErr) {
              console.error("[Email] Subscription renewal error:", emailErr);
            }
          }
        }
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subMeta = invoice.subscription_details?.metadata;
      if (subMeta?.type === "credit_subscription" && subMeta.userId) {
        await prisma.user.update({
          where: { id: subMeta.userId },
          data: { subscriptionStatus: "past_due" },
        });
        console.log(`Subscription payment failed for user ${subMeta.userId}, status set to past_due`);

        // Send payment failed email (transactional — always sent)
        try {
          const failedUser = await prisma.user.findUnique({
            where: { id: subMeta.userId },
            select: { email: true, name: true, subscriptionPlan: true },
          });
          if (failedUser) {
            const creditAmount = subMeta.creditAmount || failedUser.subscriptionPlan || "—";
            const planLabel = `${parseInt(creditAmount, 10).toLocaleString("fr-FR")} crédits/mois`;
            const amountEur = invoice.amount_due ? `${(invoice.amount_due / 100).toFixed(2).replace(".", ",")} €` : "—";
            await sendSubscriptionPaymentFailedEmail({
              to: failedUser.email,
              name: failedUser.name || "photographe",
              plan: planLabel,
              amount: amountEur,
            });
          }
        } catch (emailErr) {
          console.error("[Email] Payment failed notification error:", emailErr);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (userId) {
        const canceledUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true, subscriptionPlan: true, subscriptionEndsAt: true },
        });

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: "ended",
            stripeSubscriptionId: null,
          },
        });
        console.log(`Subscription ended for user ${userId}`);

        // Send cancellation email (transactional — always sent)
        if (canceledUser) {
          try {
            const creditAmount = canceledUser.subscriptionPlan || "—";
            const planLabel = `${parseInt(creditAmount, 10).toLocaleString("fr-FR")} crédits/mois`;
            const endsAt = canceledUser.subscriptionEndsAt
              ? canceledUser.subscriptionEndsAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
              : "immédiatement";
            await sendSubscriptionCanceledEmail({
              to: canceledUser.email,
              name: canceledUser.name || "photographe",
              plan: planLabel,
              endsAt,
            });
          } catch (emailErr) {
            console.error("[Email] Subscription canceled error:", emailErr);
          }
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: subscription.status,
          },
        });
        console.log(`Subscription updated for user ${userId}: status=${subscription.status}`);
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
