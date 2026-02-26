import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { _sendEmail, _emailLayout } from "@/lib/email";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { to } = await request.json();

  if (!to || typeof to !== "string") {
    return NextResponse.json({ error: "Champ 'to' requis" }, { status: 400 });
  }

  const html = _emailLayout({
    body: `
      <p>Bonjour,</p>
      <p>Ceci est un <strong>email de test</strong> envoyé depuis Focus Racer.</p>
      <div style="background:#f0f9ff; border-radius:8px; padding:16px; margin:16px 0; border-left:4px solid #14B8A6;">
        <p style="margin:0; font-size:14px;">Si vous recevez cet email, la configuration email est opérationnelle.</p>
      </div>
      <p style="color:#6b7280; font-size:14px;">Envoyé le ${new Date().toLocaleString("fr-FR")}.</p>
    `,
  });

  const sent = await _sendEmail({
    to,
    subject: "[Focus Racer] Email de test",
    html,
  });

  if (sent) {
    return NextResponse.json({ success: true, message: `Email envoyé à ${to}` });
  } else {
    return NextResponse.json(
      { success: false, message: "SMTP non configuré ou erreur d'envoi" },
      { status: 500 }
    );
  }
}
