import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limit: 10/min per IP
  const limited = rateLimit(request, "follow-guest", { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const eventId = params.id;

  // Check event exists and is published
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, status: true, name: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  if (event.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Événement non disponible" }, { status: 400 });
  }

  const body = await request.json();
  const { email, name, bibNumber } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
  }

  const follower = await prisma.guestEventFollower.upsert({
    where: {
      email_eventId: {
        email: email.trim().toLowerCase(),
        eventId,
      },
    },
    create: {
      email: email.trim().toLowerCase(),
      name: name?.trim() || null,
      bibNumber: bibNumber?.trim() || null,
      eventId,
    },
    update: {
      name: name?.trim() || undefined,
      bibNumber: bibNumber?.trim() || undefined,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Vous serez notifié(e) dès que de nouvelles photos seront disponibles.",
    id: follower.id,
  });
}
