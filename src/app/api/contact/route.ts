import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notificationEmitter } from "@/lib/notification-emitter";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, subject, message, category } = body;

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Nom, email, sujet et message sont requis" },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Adresse email invalide" },
      { status: 400 }
    );
  }

  const validCategories = [
    "BILLING",
    "SORTING",
    "GDPR",
    "ACCOUNT",
    "TECHNICAL",
    "EVENT",
    "OTHER",
  ];
  const finalCategory =
    category && validCategories.includes(category) ? category : "OTHER";

  // Check if user is logged in
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || null;

  const supportMessage = await prisma.supportMessage.create({
    data: {
      userId,
      guestName: userId ? null : name,
      guestEmail: userId ? null : email,
      subject,
      message,
      category: finalCategory,
    },
  });

  notificationEmitter.notifyAdmin();

  return NextResponse.json(supportMessage, { status: 201 });
}
