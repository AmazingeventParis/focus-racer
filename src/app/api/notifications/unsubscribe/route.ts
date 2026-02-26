import { NextRequest, NextResponse } from "next/server";
import { parseUnsubscribeToken } from "@/lib/notification-preferences";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET ?token=xxx — désactive une préférence spécifique via lien email
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${APP_URL}/unsubscribe?status=error`);
  }

  const parsed = parseUnsubscribeToken(token);
  if (!parsed) {
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${APP_URL}/unsubscribe?status=not_found`);
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    await prisma.notificationPreference.upsert({
      where: { userId: parsed.userId },
      create: {
        userId: parsed.userId,
        [parsed.key]: false,
      },
      update: {
        [parsed.key]: false,
      },
    });

    const categoryLabels: Record<string, string> = {
      photosAvailable: "photos disponibles",
      eventPublished: "événements publiés",
      supportReply: "réponses support",
      badgeEarned: "badges gagnés",
      streakAtRisk: "séries en danger",
      purchaseReminder: "rappels d'achat",
      sortingReminder: "rappels de tri",
      stripeOnboarded: "Stripe Connect",
      newSupportMessage: "nouveaux messages support",
      newSale: "nouvelles ventes",
      newFollower: "nouveaux followers",
      lowCredits: "alertes crédits bas",
      productUpdates: "mises à jour produit",
      referralCompleted: "parrainages complétés",
      newsletter: "newsletter",
    };
    const label = categoryLabels[parsed.key] || parsed.key;

    return NextResponse.redirect(
      `${APP_URL}/unsubscribe?status=success&category=${encodeURIComponent(label)}`
    );
  } catch (err) {
    console.error("[Unsubscribe] Error:", err);
    return NextResponse.redirect(`${APP_URL}/unsubscribe?status=error`);
  }
}
