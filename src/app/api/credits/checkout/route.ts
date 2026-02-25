import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe, APP_URL, SUBSCRIPTION_PLANS } from "@/lib/stripe";
import prisma from "@/lib/prisma";

const VALID_PACKS = [
  { amount: 1000, price: 1900 },
  { amount: 5000, price: 8500 },
  { amount: 15000, price: 22500 },
];

function getCreditsRedirectPath(role: string): string {
  if (role === "ORGANIZER") return "/organizer/credits";
  return "/photographer/credits";
}

async function getOrCreateStripeCustomer(userId: string, email: string, name: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { type, amount, priceValue } = body;
  const userRole = (session.user as { role?: string }).role || "PHOTOGRAPHER";
  const redirectPath = getCreditsRedirectPath(userRole);

  const customerId = await getOrCreateStripeCustomer(
    session.user.id,
    session.user.email!,
    session.user.name || session.user.email!
  );

  if (type === "pack") {
    const pack = VALID_PACKS.find(
      (p) => p.amount === amount && p.price === Math.round(priceValue * 100)
    );
    if (!pack) {
      return NextResponse.json({ error: "Pack invalide" }, { status: 400 });
    }

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: pack.price,
            product_data: {
              name: `${pack.amount.toLocaleString("fr-FR")} crédits Focus Racer`,
              description: "Pack de crédits pour import de photos",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "credit_purchase",
        userId: session.user.id,
        creditAmount: String(pack.amount),
        userRole,
      },
      success_url: `${APP_URL}${redirectPath}?success=true`,
      cancel_url: `${APP_URL}${redirectPath}`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  }

  if (type === "subscription") {
    // Block double subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeSubscriptionId: true, subscriptionStatus: true },
    });
    if (user?.stripeSubscriptionId && user.subscriptionStatus === "active") {
      return NextResponse.json(
        { error: "Vous avez déjà un abonnement actif. Résiliez-le avant d'en souscrire un nouveau." },
        { status: 400 }
      );
    }

    const credits = amount;
    const sub = SUBSCRIPTION_PLANS.find(
      (s) => s.credits === credits && s.priceInCents === Math.round(priceValue * 100)
    );
    if (!sub) {
      return NextResponse.json(
        { error: "Abonnement invalide" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: sub.priceInCents,
            recurring: { interval: "month" },
            product_data: {
              name: `Abonnement ${sub.label}`,
              description:
                "Engagement annuel, paiement mensuel. Crédits rechargés automatiquement chaque mois.",
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          type: "credit_subscription",
          userId: session.user.id,
          creditAmount: String(sub.credits),
          userRole,
        },
      },
      metadata: {
        type: "credit_subscription",
        userId: session.user.id,
        creditAmount: String(sub.credits),
        userRole,
      },
      success_url: `${APP_URL}${redirectPath}?success=true`,
      cancel_url: `${APP_URL}${redirectPath}`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  }

  return NextResponse.json({ error: "Type invalide" }, { status: 400 });
}
