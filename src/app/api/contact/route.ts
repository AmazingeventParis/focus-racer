import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notificationEmitter } from "@/lib/notification-emitter";
import { sendContactConfirmation, sendNewSupportMessageEmail } from "@/lib/email";
import { canSendEmail, generateUnsubscribeUrl } from "@/lib/notification-preferences";

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

  // Send confirmation email (non-blocking)
  sendContactConfirmation({
    to: email,
    name,
    subject,
  }).catch((err) => console.error("[Email] Contact confirmation error:", err));

  // Email all active admins about new contact message
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", isActive: true },
      select: { id: true, email: true },
    });
    for (const admin of admins) {
      const ok = await canSendEmail(admin.id, "newSupportMessage");
      if (ok) {
        sendNewSupportMessageEmail({
          to: admin.email,
          senderName: name,
          senderEmail: email,
          subject,
          category: finalCategory,
          unsubscribeUrl: generateUnsubscribeUrl(admin.id, "newSupportMessage"),
        }).catch((err) => console.error("[Email] Admin notify error:", err));
      }
    }
  } catch (adminEmailErr) {
    console.error("[Email] Admin notification error:", adminEmailErr);
  }

  return NextResponse.json(supportMessage, { status: 201 });
}
