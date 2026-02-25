import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

// GET — Subscription status
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      stripeSubscriptionId: true,
      subscriptionStatus: true,
      subscriptionPlan: true,
      subscriptionStartedAt: true,
      subscriptionEndsAt: true,
      subscriptionCancelRequestedAt: true,
    },
  });

  if (!user?.stripeSubscriptionId) {
    return NextResponse.json({ hasSubscription: false });
  }

  // Fetch next invoice from Stripe for billing info
  let nextInvoiceDate: string | null = null;
  let nextInvoiceAmount: number | null = null;
  try {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    if (subscription.current_period_end) {
      nextInvoiceDate = new Date(subscription.current_period_end * 1000).toISOString();
    }
    if (subscription.items.data[0]?.price?.unit_amount) {
      nextInvoiceAmount = subscription.items.data[0].price.unit_amount / 100;
    }
  } catch {
    // Stripe may fail if subscription was already deleted
  }

  return NextResponse.json({
    hasSubscription: true,
    status: user.subscriptionStatus,
    plan: user.subscriptionPlan,
    startedAt: user.subscriptionStartedAt,
    endsAt: user.subscriptionEndsAt,
    cancelRequestedAt: user.subscriptionCancelRequestedAt,
    nextInvoiceDate,
    nextInvoiceAmount,
  });
}

// POST — Request cancellation (cancel at anniversary date)
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      stripeSubscriptionId: true,
      subscriptionStatus: true,
      subscriptionStartedAt: true,
      subscriptionEndsAt: true,
      subscriptionCancelRequestedAt: true,
    },
  });

  if (!user?.stripeSubscriptionId) {
    return NextResponse.json({ error: "Aucun abonnement actif" }, { status: 400 });
  }

  if (user.subscriptionCancelRequestedAt) {
    return NextResponse.json({ error: "La résiliation a déjà été demandée" }, { status: 400 });
  }

  // Calculate anniversary date (subscriptionStartedAt + 1 year)
  const anniversaryDate = user.subscriptionEndsAt || new Date(
    new Date(user.subscriptionStartedAt!).setFullYear(
      new Date(user.subscriptionStartedAt!).getFullYear() + 1
    )
  );
  const anniversaryTimestamp = Math.floor(new Date(anniversaryDate).getTime() / 1000);

  // Tell Stripe to cancel at anniversary date
  const stripe = getStripe();
  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at: anniversaryTimestamp,
  });

  // Record cancellation request
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      subscriptionCancelRequestedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    cancelAt: anniversaryDate,
  });
}
