import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { _sendEmail, _emailLayout, ctaButton, infoBox, infoRow, orderRow, C, FONT, APP_URL } from "@/lib/email";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { to, template } = await request.json();

  if (!to || typeof to !== "string") {
    return NextResponse.json({ error: "Champ 'to' requis" }, { status: 400 });
  }

  let subject = "[Focus Racer] Email de test";
  let body = "";

  if (template === "showcase") {
    // Email vitrine avec tous les composants
    subject = "Bienvenue — Découvrez Focus Racer";
    body = `
      <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Bonjour,</p>
      <p style="margin: 0 0 24px;">Ceci est un <strong style="color: ${C.textPrimary};">email de démonstration</strong> présentant tous les composants du design system Focus Racer.</p>

      ${infoBox(`
        ${infoRow("Événement", "Marathon de Paris 2026")}
        ${infoRow("Date", "12 avril 2026")}
        ${infoRow("Lieu", "Champs-Élysées, Paris")}
        ${infoRow("Dossard", "#4217")}
        ${infoRow("Photos trouvées", "12")}
      `)}

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: ${C.grayLight}; border-radius: 8px; margin: 24px 0;">
        <tr>
          <td style="padding: 20px 24px;">
            ${orderRow("Commande", "#A7B3C4F2")}
            ${orderRow("Pack 5 photos HD", "12,00 €")}
            ${orderRow("Frais de service", "1,00 €")}
            ${orderRow("Total payé", "13,00 €", true)}
          </td>
        </tr>
      </table>

      ${ctaButton(`${APP_URL}`, "Voir mes photos")}

      <p style="font-size: 13px; color: ${C.textMuted}; margin: 0; text-align: center;">
        Sélectionnez vos préférées et commandez-les en haute définition sans filigrane.
      </p>`;
  } else {
    // Email de test simple
    body = `
      <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Bonjour,</p>
      <p style="margin: 0 0 24px;">Ceci est un <strong style="color: ${C.textPrimary};">email de test</strong> envoyé depuis Focus Racer.</p>

      ${infoBox(`
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="font-family: ${FONT}; font-size: 14px; color: ${C.textSecondary};">
              Si vous recevez cet email, la configuration SMTP est opérationnelle.
            </td>
          </tr>
        </table>
      `)}

      <p style="font-size: 13px; color: ${C.textMuted}; margin: 0; text-align: center;">
        Envoyé le ${new Date().toLocaleString("fr-FR")}.
      </p>`;
  }

  const html = _emailLayout({
    body,
    preheader: template === "showcase"
      ? "Découvrez le design system email de Focus Racer"
      : "Email de test — configuration SMTP vérifiée",
  });

  const sent = await _sendEmail({
    to,
    subject,
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
