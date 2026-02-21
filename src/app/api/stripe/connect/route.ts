import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe, APP_URL } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, stripeAccountId: true, role: true },
    });

    if (!user || !["PHOTOGRAPHER", "ORGANIZER", "AGENCY", "CLUB", "FEDERATION"].includes(user.role)) {
      return NextResponse.json({ error: "Rôle non autorisé" }, { status: 403 });
    }

    const stripe = getStripe();
    let accountId = user.stripeAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "FR",
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: { userId: user.id },
      });

      accountId = account.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeAccountId: accountId },
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${APP_URL}/photographer/orders`,
      return_url: `${APP_URL}/photographer/orders?stripe=complete`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error("Stripe Connect onboarding error:", error);
    const message = error?.message || "Erreur lors de la configuration Stripe";
    const stripeCode = error?.code || error?.type || "";
    return NextResponse.json(
      { error: message, code: stripeCode },
      { status: error?.statusCode || 500 }
    );
  }
}
