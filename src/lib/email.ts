import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";

const transporter = SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

const EMAIL_FROM = process.env.EMAIL_FROM || `Focus Racer <${SMTP_USER || "noreply@focusracer.swipego.app"}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// =========== BASE LAYOUT ===========

function emailLayout({
  body,
  unsubscribeUrl,
  footerNote,
}: {
  body: string;
  unsubscribeUrl?: string;
  footerNote?: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f9fafb; }
    .wrapper { background: #f9fafb; padding: 24px 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 0 20px; }
    .card { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    .header { text-align: center; padding: 24px 20px 16px; border-bottom: 2px solid #14B8A6; }
    .header h1 { color: #1f2937; margin: 0; font-size: 24px; font-weight: 700; }
    .content { padding: 28px 24px; }
    .info-box { background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #14B8A6; }
    .info-row { padding: 4px 0; }
    .info-label { color: #6b7280; font-size: 14px; }
    .info-value { font-weight: 600; }
    .order-box { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .order-row { padding: 6px 0; }
    .order-row .label { color: #6b7280; }
    .order-row .value { font-weight: 600; float: right; }
    .total-row { border-top: 1px solid #e5e7eb; margin-top: 8px; padding-top: 12px; font-size: 18px; }
    .btn { display: inline-block; background: #14B8A6; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .note { color: #6b7280; font-size: 14px; }
    .footer { padding: 16px 24px; color: #9ca3af; font-size: 12px; text-align: center; }
    .footer a { color: #14B8A6; text-decoration: none; }
    .clearfix::after { content: ""; display: table; clear: both; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="card">
        <div class="header">
          <h1>Focus Racer</h1>
        </div>
        <div class="content">
          ${body}
        </div>
      </div>
      <div class="footer">
        <p>Focus Racer &mdash; Plateforme de photos de courses sportives</p>
        ${footerNote ? `<p style="margin-top: 8px; font-size: 11px;">${footerNote}</p>` : ""}
        ${unsubscribeUrl ? `<p style="margin-top: 8px; font-size: 11px;"><a href="${unsubscribeUrl}">Se d\u00e9sabonner</a></p>` : ""}
      </div>
    </div>
  </div>
</body>
</html>`;
}

// =========== CENTRALIZED SEND ===========

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!transporter) {
    console.log(`[Email] SMTP non configur\u00e9, email ignor\u00e9 \u00e0 : ${to} | Sujet : ${subject}`);
    return false;
  }

  try {
    await transporter.sendMail({ from: EMAIL_FROM, to, subject, html });
    console.log(`[Email] Envoy\u00e9 \u00e0 ${to} : ${subject}`);
    return true;
  } catch (err) {
    console.error(`[Email] Erreur envoi \u00e0 ${to}:`, err);
    return false;
  }
}

// =========== INTERFACES ===========

interface PurchaseEmailData {
  to: string;
  name: string;
  orderId: string;
  eventName: string;
  eventDate?: Date;
  photoCount: number;
  totalAmount: number;
  serviceFee?: number;
  items?: { name: string; price: number }[];
  downloadToken: string;
  expiresAt: Date;
}

interface RunnerNotificationData {
  to: string;
  firstName: string;
  lastName: string;
  bibNumber: string;
  eventName: string;
  eventDate: Date;
  eventLocation: string | null;
  photoCount: number;
  eventId: string;
}

interface GuestPhotoNotificationData {
  to: string;
  name?: string;
  eventName: string;
  eventId: string;
  photoCount: number;
  bibNumber?: string;
  unsubscribeToken: string;
}

interface WelcomeEmailData {
  to: string;
  firstName: string;
  role: string;
}

interface ContactConfirmationData {
  to: string;
  name: string;
  subject: string;
}

interface SmartAlertEmailData {
  to: string;
  name: string;
  alertType: string;
  title: string;
  message: string;
  ctaUrl?: string;
  ctaLabel?: string;
}

// =========== TEMPLATES ===========

export async function sendRunnerNotification(data: RunnerNotificationData) {
  const eventDateFormatted = data.eventDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const galleryUrl = `${APP_URL}/explore/${data.eventId}/search?bib=${data.bibNumber}`;

  const body = `
    <p>Bonjour ${data.firstName},</p>
    <p>Vos photos de course sont disponibles ! Nous avons identifi\u00e9 <strong>${data.photoCount} photo${data.photoCount > 1 ? "s" : ""}</strong> avec votre dossard <strong>#${data.bibNumber}</strong>.</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">\u00c9v\u00e9nement</span><br>
        <span class="info-value">${data.eventName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date</span><br>
        <span class="info-value">${eventDateFormatted}</span>
      </div>
      ${data.eventLocation ? `
      <div class="info-row">
        <span class="info-label">Lieu</span><br>
        <span class="info-value">${data.eventLocation}</span>
      </div>` : ""}
      <div class="info-row">
        <span class="info-label">Dossard</span><br>
        <span class="info-value">#${data.bibNumber}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Photos trouv\u00e9es</span><br>
        <span class="info-value">${data.photoCount}</span>
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${galleryUrl}" class="btn">Voir mes photos</a>
    </div>

    <p class="note">
      Retrouvez toutes vos photos, s\u00e9lectionnez vos pr\u00e9f\u00e9r\u00e9es et commandez-les en haute d\u00e9finition sans filigrane.
    </p>`;

  const html = emailLayout({
    body,
    footerNote: `Vous recevez cet email car votre adresse est associ\u00e9e au dossard #${data.bibNumber} sur la start-list de ${data.eventName}. Si ce n'est pas vous, ignorez simplement cet email.`,
  });

  return sendEmail({
    to: data.to,
    subject: `${data.firstName}, vos ${data.photoCount} photos de ${data.eventName} sont disponibles !`,
    html,
  });
}

export async function sendPurchaseConfirmation(data: PurchaseEmailData) {
  const orderRef = data.orderId.slice(-8).toUpperCase();
  const downloadUrl = `${APP_URL}/api/downloads/${data.downloadToken}`;
  const expiresFormatted = data.expiresAt.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let itemsHtml = "";
  if (data.items && data.items.length > 0) {
    itemsHtml = data.items.map(item => `
      <div class="order-row clearfix">
        <span class="label">${item.name}</span>
        <span class="value">${item.price.toFixed(2).replace(".", ",")} \u20ac</span>
      </div>`).join("");
  }

  const body = `
    <p>Bonjour ${data.name},</p>
    <p>Merci pour votre achat ! Vos photos sont pr\u00eates \u00e0 \u00eatre t\u00e9l\u00e9charg\u00e9es.</p>

    <div class="order-box">
      <div class="order-row clearfix">
        <span class="label">Commande</span>
        <span class="value">#${orderRef}</span>
      </div>
      <div class="order-row clearfix">
        <span class="label">\u00c9v\u00e9nement</span>
        <span class="value">${data.eventName}</span>
      </div>
      ${data.eventDate ? `
      <div class="order-row clearfix">
        <span class="label">Date</span>
        <span class="value">${data.eventDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
      </div>` : ""}
      <div class="order-row clearfix">
        <span class="label">Photos</span>
        <span class="value">${data.photoCount} photo${data.photoCount > 1 ? "s" : ""} HD</span>
      </div>
      ${itemsHtml}
      ${data.serviceFee ? `
      <div class="order-row clearfix">
        <span class="label">Frais de service</span>
        <span class="value">${data.serviceFee.toFixed(2).replace(".", ",")} \u20ac</span>
      </div>` : ""}
      <div class="order-row total-row clearfix">
        <span class="label">Total pay\u00e9</span>
        <span class="value">${data.totalAmount.toFixed(2).replace(".", ",")} \u20ac</span>
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${downloadUrl}" class="btn">T\u00e9l\u00e9charger mes photos</a>
    </div>

    <p class="note">
      Ce lien est valable jusqu'au ${expiresFormatted}.
      Si vous avez un compte, vous pouvez r\u00e9g\u00e9n\u00e9rer un lien depuis votre espace "Mes Achats".
    </p>`;

  const html = emailLayout({ body });

  return sendEmail({
    to: data.to,
    subject: `Vos photos de ${data.eventName} sont pr\u00eates !`,
    html,
  });
}

export async function sendGuestPhotoNotification(data: GuestPhotoNotificationData) {
  const galleryUrl = data.bibNumber
    ? `${APP_URL}/explore/${data.eventId}/search?bib=${data.bibNumber}`
    : `${APP_URL}/events/${data.eventId}`;
  const unsubscribeUrl = `${APP_URL}/api/events/${data.eventId}/unsubscribe?token=${data.unsubscribeToken}`;

  const greeting = data.name ? `Bonjour ${data.name},` : "Bonjour,";
  const bibLine = data.bibNumber
    ? ` Votre dossard <strong>#${data.bibNumber}</strong> a \u00e9t\u00e9 rep\u00e9r\u00e9.`
    : "";

  const body = `
    <p>${greeting}</p>
    <p><strong>${data.photoCount} photo${data.photoCount > 1 ? "s" : ""}</strong> viennent d'\u00eatre publi\u00e9es pour <strong>${data.eventName}</strong>.${bibLine}</p>

    <div style="text-align: center;">
      <a href="${galleryUrl}" class="btn">Voir les photos</a>
    </div>

    <p class="note">
      Retrouvez vos photos, s\u00e9lectionnez vos pr\u00e9f\u00e9r\u00e9es et commandez-les en haute d\u00e9finition sans filigrane.
    </p>`;

  const html = emailLayout({
    body,
    unsubscribeUrl,
    footerNote: `Vous recevez cet email car vous suivez l'\u00e9v\u00e9nement "${data.eventName}" sur Focus Racer.`,
  });

  return sendEmail({
    to: data.to,
    subject: `Photos disponibles pour ${data.eventName} !`,
    html,
  });
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const roleLabels: Record<string, string> = {
    PHOTOGRAPHER: "photographe",
    ORGANIZER: "organisateur",
    AGENCY: "agence",
    CLUB: "club",
    FEDERATION: "f\u00e9d\u00e9ration",
    RUNNER: "sportif",
  };
  const roleLabel = roleLabels[data.role] || "utilisateur";
  const dashboardUrl = data.role === "RUNNER"
    ? `${APP_URL}/account`
    : `${APP_URL}/photographer/dashboard`;

  const body = `
    <p>Bonjour ${data.firstName},</p>
    <p>Bienvenue sur <strong>Focus Racer</strong> ! Votre compte ${roleLabel} est cr\u00e9\u00e9 et pr\u00eat \u00e0 l'emploi.</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Votre espace</span><br>
        <span class="info-value">${roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Cr\u00e9dits offerts</span><br>
        <span class="info-value">100 cr\u00e9dits de bienvenue</span>
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${dashboardUrl}" class="btn">Acc\u00e9der \u00e0 mon espace</a>
    </div>

    <p class="note">
      Besoin d'aide ? Consultez notre <a href="${APP_URL}/faq" style="color:#14B8A6;">FAQ</a> ou contactez-nous via la page <a href="${APP_URL}/contact" style="color:#14B8A6;">Contact</a>.
    </p>`;

  const html = emailLayout({ body });

  return sendEmail({
    to: data.to,
    subject: "Bienvenue sur Focus Racer !",
    html,
  });
}

export async function sendContactConfirmation(data: ContactConfirmationData) {
  const body = `
    <p>Bonjour ${data.name},</p>
    <p>Nous avons bien re\u00e7u votre message : <strong>"${data.subject}"</strong>.</p>
    <p>Notre \u00e9quipe vous r\u00e9pondra dans les plus brefs d\u00e9lais.</p>

    <div class="info-box">
      <p style="margin: 0; font-size: 14px; color: #6b7280;">
        D\u00e9lai moyen de r\u00e9ponse : <strong>24-48h</strong> en jours ouvr\u00e9s.
      </p>
    </div>

    <p class="note">
      En attendant, consultez notre <a href="${APP_URL}/faq" style="color:#14B8A6;">FAQ</a> pour des r\u00e9ponses imm\u00e9diates.
    </p>`;

  const html = emailLayout({ body });

  return sendEmail({
    to: data.to,
    subject: "Nous avons bien re\u00e7u votre message",
    html,
  });
}

export async function sendSmartAlertEmail(data: SmartAlertEmailData) {
  const ctaHtml = data.ctaUrl
    ? `<div style="text-align: center;">
        <a href="${data.ctaUrl}" class="btn">${data.ctaLabel || "Voir"}</a>
      </div>`
    : "";

  const body = `
    <p>Bonjour ${data.name},</p>
    <p>${data.message}</p>
    ${ctaHtml}`;

  const html = emailLayout({ body });

  return sendEmail({
    to: data.to,
    subject: data.title,
    html,
  });
}

// Re-export for test endpoint
export { sendEmail as _sendEmail, emailLayout as _emailLayout };
