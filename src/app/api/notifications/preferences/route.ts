import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreatePreferences, type PreferenceKey } from "@/lib/notification-preferences";
import prisma from "@/lib/prisma";

// GET — retourne les préférences utilisateur (upsert lazy)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const prefs = await getOrCreatePreferences(session.user.id);
  return NextResponse.json(prefs);
}

// PATCH — met à jour les préférences (body JSON partiel)
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();

  const validKeys: PreferenceKey[] = [
    "photosAvailable", "eventPublished", "supportReply", "badgeEarned",
    "streakAtRisk", "purchaseReminder", "sortingReminder", "stripeOnboarded",
    "newSupportMessage", "newSale", "newFollower", "lowCredits",
    "productUpdates", "referralCompleted", "newsletter",
  ];

  // Filter only valid boolean fields
  const data: Record<string, boolean> = {};
  for (const key of validKeys) {
    if (typeof body[key] === "boolean") {
      data[key] = body[key];
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Aucune préférence valide fournie" }, { status: 400 });
  }

  const prefs = await prisma.notificationPreference.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });

  return NextResponse.json(prefs);
}
