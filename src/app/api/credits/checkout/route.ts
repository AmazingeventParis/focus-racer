import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe, APP_URL } from "@/lib/stripe";

const VALID_PACKS = [
  { amount: 1000, price: 1900 },
  { amount: 5000, price: 8500 },
  { amount: 15000, price: 22500 },
];

const VALID_SUBSCRIPTIONS = [
  { credits: 20000, price: 19900 },
  { credits: 50000, price: 39900 },
];

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await request.json();
  const { type, amount, priceValue } = body;

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
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: pack.price,
            product_data: {
              name: `${pack.amount.toLocaleString("fr-FR")} credits Focus Racer`,
              description: "Pack de credits pour import de photos",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "credit_purchase",
        userId: session.user.id,
        creditAmount: String(pack.amount),
      },
      success_url: `${APP_URL}/photographer/credits?success=true`,
      cancel_url: `${APP_URL}/photographer/credits`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  }

  if (type === "subscription") {
    const credits = amount;
    const sub = VALID_SUBSCRIPTIONS.find(
      (s) => s.credits === credits && s.price === Math.round(priceValue * 100)
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
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: sub.price,
            recurring: { interval: "month" },
            product_data: {
              name: `Abonnement ${sub.credits.toLocaleString("fr-FR")} credits/mois`,
              description:
                "Credits recharges automatiquement chaque mois",
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
        },
      },
      metadata: {
        type: "credit_subscription",
        userId: session.user.id,
        creditAmount: String(sub.credits),
      },
      success_url: `${APP_URL}/photographer/credits?success=true`,
      cancel_url: `${APP_URL}/photographer/credits`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  }

  return NextResponse.json({ error: "Type invalide" }, { status: 400 });
}
