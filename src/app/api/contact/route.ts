import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notificationEmitter } from "@/lib/notification-emitter";
import { sendContactConfirmation, sendNewSupportMessageEmail } from "@/lib/email";
import { canSendEmail, generateUnsubscribeUrl } from "@/lib/notification-preferences";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit: 3 requests per minute
  const rateLimited = rateLimit(request, "contact", { limit: 3 });
  if (rateLimited) return rateLimited;

  const body = await request.json();
  const { name, email, subject, message, category, turnstileToken, website } = body;

  // Honeypot check — bots fill hidden fields
  if (website) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  // Verify Turnstile token
  const ip =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim();
  const turnstileValid = await verifyTurnstileToken(turnstileToken, ip || undefined);
  if (!turnstileValid) {
    return NextResponse.json(
      { error: "Vérification de sécurité échouée. Veuillez réessayer." },
      { status: 403 }
    );
  }

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
