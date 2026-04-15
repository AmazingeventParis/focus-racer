import nodemailer from "nodemailer";

// =========== SMTP CONFIG ===========

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
const LOGO_URL = `${APP_URL}/logo-focus-racer-white.png`;
const CURRENT_YEAR = new Date().getFullYear();

// =========== DESIGN TOKENS ===========

const C = {
  navy: "#042F2E",
  navyLight: "#134E4A",
  emerald: "#10B981",
  emeraldDark: "#059669",
  emeraldPale: "#D1FAE5",
  teal: "#14B8A6",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  grayLight: "#F1F5F9",
  grayBorder: "#E2E8F0",
  textPrimary: "#1E293B",
  textSecondary: "#475569",
  textMuted: "#64748B",
  textLight: "#94A3B8",
} as const;

const FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif`;

// =========== HELPERS HTML ===========

/** Bouton CTA compatible Outlook (VML fallback) */
function ctaButton(url: string, label: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 28px auto;">
  <tr>
    <td align="center" style="border-radius: 8px; background: ${C.emerald};" bgcolor="${C.emerald}">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="17%" strokecolor="${C.emeraldDark}" fillcolor="${C.emerald}">
        <w:anchorlock/>
        <center style="color:#ffffff;font-family:${FONT};font-size:16px;font-weight:600;">${label}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; color: ${C.white}; background: ${C.emerald}; text-decoration: none; font-family: ${FONT}; font-size: 16px; font-weight: 600; border-radius: 8px; mso-padding-alt: 0; text-align: center;">
        ${label}
      </a>
      <!--<![endif]-->
    </td>
  </tr>
</table>`;
}

/** Boite info (fond clair + bordure gauche emeraude) */
function infoBox(content: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0;">
  <tr>
    <td style="width: 4px; background: ${C.emerald};" bgcolor="${C.emerald}">&nbsp;</td>
    <td style="padding: 16px 20px; background: ${C.grayLight}; font-family: ${FONT}; font-size: 14px; color: ${C.textSecondary}; line-height: 1.6;" bgcolor="${C.grayLight}">
      ${content}
    </td>
  </tr>
</table>`;
}

/** Ligne info (label + valeur) */
function infoRow(label: string, value: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 4px;">
  <tr>
    <td style="font-family: ${FONT}; font-size: 13px; color: ${C.textMuted}; padding: 2px 0; width: 40%;">${label}</td>
    <td style="font-family: ${FONT}; font-size: 14px; color: ${C.textPrimary}; font-weight: 600; padding: 2px 0;">${value}</td>
  </tr>
</table>`;
}

/** Ligne commande (label + montant aligné droite) */
function orderRow(label: string, value: string, isTotal = false): string {
  const topBorder = isTotal ? `border-top: 2px solid ${C.grayBorder}; padding-top: 12px; margin-top: 8px;` : "";
  const fontSize = isTotal ? "16px" : "14px";
  const fontWeight = isTotal ? "700" : "400";
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${topBorder}">
  <tr>
    <td style="font-family: ${FONT}; font-size: ${fontSize}; color: ${isTotal ? C.textPrimary : C.textSecondary}; font-weight: ${fontWeight}; padding: 6px 0;">${label}</td>
    <td align="right" style="font-family: ${FONT}; font-size: ${fontSize}; color: ${C.textPrimary}; font-weight: 600; padding: 6px 0;">${value}</td>
  </tr>
</table>`;
}

/** Séparateur horizontal */
function divider(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0;"><tr><td style="border-top: 1px solid ${C.grayBorder}; font-size: 0; line-height: 0;" height="1">&nbsp;</td></tr></table>`;
}

// =========== BASE LAYOUT (TABLES, OUTLOOK-SAFE) ===========

function emailLayout({
  body,
  preheader,
  unsubscribeUrl,
  footerNote,
}: {
  body: string;
  preheader?: string;
  unsubscribeUrl?: string;
  footerNote?: string;
}): string {
  const preheaderHtml = preheader
    ? `<div style="display:none;font-size:1px;color:${C.bg};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}${"&nbsp;&zwnj;".repeat(30)}</div>`
    : "";

  const unsubscribeHtml = unsubscribeUrl
    ? `<tr><td style="padding-top: 12px;"><a href="${unsubscribeUrl}" style="font-family: ${FONT}; font-size: 12px; color: ${C.textLight}; text-decoration: underline;">Se d\u00e9sabonner de ces notifications</a></td></tr>`
    : "";

  const footerNoteHtml = footerNote
    ? `<tr><td style="padding-top: 12px; font-family: ${FONT}; font-size: 11px; color: ${C.textLight}; line-height: 1.5;">${footerNote}</td></tr>`
    : "";

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="fr">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>Focus Racer</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <style>table{border-collapse:collapse;}td,th{mso-line-height-rule:exactly;}</style>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; -webkit-font-smoothing: antialiased; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .content-cell { padding-left: 20px !important; padding-right: 20px !important; }
      .stack-column { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${C.bg}; -webkit-font-smoothing: antialiased;" bgcolor="${C.bg}">

  ${preheaderHtml}

  <!-- WRAPPER TABLE -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${C.bg};" bgcolor="${C.bg}">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <!-- EMAIL CONTAINER (600px) -->
        <!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center"><tr><td><![endif]-->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width: 600px; width: 100%;">

          <!-- ======== HEADER (Navy) ======== -->
          <tr>
            <td align="center" style="background: ${C.navy}; padding: 28px 24px; border-radius: 12px 12px 0 0;" bgcolor="${C.navy}">
              <a href="${APP_URL}" target="_blank" style="text-decoration: none;">
                <img src="${LOGO_URL}" alt="Focus Racer" width="160" height="auto" style="display: block; max-width: 160px; height: auto;">
              </a>
            </td>
          </tr>

          <!-- ======== CONTENT (White) ======== -->
          <tr>
            <td class="content-cell" style="background: ${C.white}; padding: 36px 32px; font-family: ${FONT}; font-size: 15px; line-height: 1.7; color: ${C.textSecondary};" bgcolor="${C.white}">
              ${body}
            </td>
          </tr>

          <!-- ======== FOOTER (Navy) ======== -->
          <tr>
            <td style="background: ${C.navy}; padding: 28px 32px; border-radius: 0 0 12px 12px;" bgcolor="${C.navy}">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <!-- Links -->
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="${APP_URL}/faq" style="font-family: ${FONT}; font-size: 13px; color: ${C.emerald}; text-decoration: none; padding: 0 8px;">FAQ</a>
                    <span style="color: ${C.navyLight};">&bull;</span>
                    <a href="${APP_URL}/contact" style="font-family: ${FONT}; font-size: 13px; color: ${C.emerald}; text-decoration: none; padding: 0 8px;">Contact</a>
                    <span style="color: ${C.navyLight};">&bull;</span>
                    <a href="${APP_URL}/legal" style="font-family: ${FONT}; font-size: 13px; color: ${C.emerald}; text-decoration: none; padding: 0 8px;">Mentions l\u00e9gales</a>
                  </td>
                </tr>
                <!-- Tagline -->
                <tr>
                  <td align="center" style="font-family: ${FONT}; font-size: 12px; color: ${C.textLight}; line-height: 1.5;">
                    Plateforme de photos de courses sportives
                  </td>
                </tr>
                <!-- Copyright -->
                <tr>
                  <td align="center" style="font-family: ${FONT}; font-size: 11px; color: ${C.textMuted}; padding-top: 8px;">
                    &copy; ${CURRENT_YEAR} Focus Racer &mdash; Tous droits r\u00e9serv\u00e9s
                  </td>
                </tr>
                ${footerNoteHtml}
                ${unsubscribeHtml}
              </table>
            </td>
          </tr>

        </table>
        <!--[if mso]></td></tr></table><![endif]-->

      </td>
    </tr>
  </table>

</body>
</html>`;
}

// =========== CENTRALIZED SEND ===========

async function sendEmail({
  to,
  subject,
  html,
  headers,
}: {
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
}): Promise<boolean> {
  if (!transporter) {
    console.log(`[Email] SMTP non configur\u00e9, email ignor\u00e9 \u00e0 : ${to} | Sujet : ${subject}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      headers: {
        "X-Mailer": "Focus Racer",
        ...headers,
      },
    });
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
    <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Bonjour ${data.firstName},</p>
    <p style="margin: 0 0 24px;">Vos photos de course sont disponibles ! Nous avons identifi\u00e9 <strong style="color: ${C.textPrimary};">${data.photoCount} photo${data.photoCount > 1 ? "s" : ""}</strong> avec votre dossard <strong style="color: ${C.emerald};">#${data.bibNumber}</strong>.</p>

    ${infoBox(`
      ${infoRow("\u00c9v\u00e9nement", data.eventName)}
      ${infoRow("Date", eventDateFormatted)}
      ${data.eventLocation ? infoRow("Lieu", data.eventLocation) : ""}
      ${infoRow("Dossard", `#${data.bibNumber}`)}
      ${infoRow("Photos trouv\u00e9es", String(data.photoCount))}
    `)}

    ${ctaButton(galleryUrl, "Voir mes photos")}

    <p style="font-size: 13px; color: ${C.textMuted}; margin: 0; text-align: center;">
      S\u00e9lectionnez vos pr\u00e9f\u00e9r\u00e9es et commandez-les en haute d\u00e9finition sans filigrane.
    </p>`;

  const html = emailLayout({
    body,
    preheader: `${data.photoCount} photos trouv\u00e9es pour le dossard #${data.bibNumber} \u2014 ${data.eventName}`,
    footerNote: `Vous recevez cet email car votre adresse est associ\u00e9e au dossard #${data.bibNumber} sur la start-list de ${data.eventName}.`,
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
    itemsHtml = data.items.map(item =>
      orderRow(item.name, `${item.price.toFixed(2).replace(".", ",")} \u20ac`)
    ).join("");
  }

  const body = `
    <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Bonjour ${data.name},</p>
    <p style="margin: 0 0 24px;">Merci pour votre achat ! Vos photos sont pr\u00eates \u00e0 \u00eatre t\u00e9l\u00e9charg\u00e9es.</p>

    <!-- Order details -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: ${C.grayLight}; border-radius: 8px; margin: 24px 0;">
      <tr>
        <td style="padding: 20px 24px;">
          ${orderRow("Commande", `#${orderRef}`)}
          ${orderRow("\u00c9v\u00e9nement", data.eventName)}
          ${data.eventDate ? orderRow("Date", data.eventDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })) : ""}
          ${orderRow("Photos", `${data.photoCount} photo${data.photoCount > 1 ? "s" : ""} HD`)}
          ${itemsHtml}
          ${data.serviceFee ? orderRow("Frais de service", `${data.serviceFee.toFixed(2).replace(".", ",")} \u20ac`) : ""}
          ${orderRow(`Total pay\u00e9`, `${data.totalAmount.toFixed(2).replace(".", ",")} \u20ac`, true)}
        </td>
      </tr>
    </table>

    ${ctaButton(downloadUrl, "T\u00e9l\u00e9charger mes photos")}

    <p style="font-size: 13px; color: ${C.textMuted}; margin: 0; text-align: center;">
      Lien valable jusqu'au ${expiresFormatted}.<br>
      Vous pouvez r\u00e9g\u00e9n\u00e9rer un lien depuis votre espace \u00ab&nbsp;Mes Achats&nbsp;\u00bb.
    </p>`;

  const html = emailLayout({
    body,
    preheader: `Commande #${orderRef} confirm\u00e9e \u2014 ${data.photoCount} photos HD pr\u00eates \u00e0 t\u00e9l\u00e9charger`,
  });

  return sendEmail({
    to: data.to,
    subject: `Commande confirm\u00e9e \u2014 Vos photos de ${data.eventName} sont pr\u00eates !`,
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
    ? ` Votre dossard <strong style="color: ${C.emerald};">#${data.bibNumber}</strong> a \u00e9t\u00e9 rep\u00e9r\u00e9.`
    : "";

  const body = `
    <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">${greeting}</p>
    <p style="margin: 0 0 24px;"><strong style="color: ${C.textPrimary};">${data.photoCount} photo${data.photoCount > 1 ? "s" : ""}</strong> viennent d'\u00eatre publi\u00e9es pour <strong style="color: ${C.textPrimary};">${data.eventName}</strong>.${bibLine}</p>

    ${ctaButton(galleryUrl, "Voir les photos")}

    <p style="font-size: 13px; color: ${C.textMuted}; margin: 0; text-align: center;">
      S\u00e9lectionnez vos pr\u00e9f\u00e9r\u00e9es et commandez-les en haute d\u00e9finition sans filigrane.
    </p>`;

  const html = emailLayout({
    body,
    preheader: `${data.photoCount} nouvelles photos pour ${data.eventName}${data.bibNumber ? ` \u2014 dossard #${data.bibNumber}` : ""}`,
    unsubscribeUrl,
    footerNote: `Vous recevez cet email car vous suivez l'\u00e9v\u00e9nement \u00ab\u00a0${data.eventName}\u00a0\u00bb sur Focus Racer.`,
  });

  return sendEmail({
    to: data.to,
    subject: `Photos disponibles pour ${data.eventName} !`,
    html,
    headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` },
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
    <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Bonjour ${data.firstName},</p>
    <p style="margin: 0 0 24px;">Bienvenue sur <strong style="color: ${C.textPrimary};">Focus Racer</strong> ! Votre compte ${roleLabel} est cr\u00e9\u00e9 et pr\u00eat \u00e0 l'emploi.</p>

    ${infoBox(`
      ${infoRow("Votre espace", roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1))}
      ${infoRow("Cr\u00e9dits offerts", "100 cr\u00e9dits de bienvenue")}
    `)}

    ${ctaButton(dashboardUrl, "Acc\u00e9der \u00e0 mon espace")}

    <p style="font-size: 13px; color: ${C.textMuted}; margin: 0; text-align: center;">
      Besoin d'aide ? <a href="${APP_URL}/faq" style="color: ${C.emerald}; text-decoration: none;">FAQ</a> &bull; <a href="${APP_URL}/contact" style="color: ${C.emerald}; text-decoration: none;">Contact</a>
    </p>`;

  const html = emailLayout({
    body,
    preheader: `Bienvenue ${data.firstName} ! Votre compte ${roleLabel} Focus Racer est pr\u00eat.`,
  });

  return sendEmail({
    to: data.to,
    subject: `Bienvenue sur Focus Racer, ${data.firstName} !`,
    html,
  });
}

export async function sendContactConfirmation(data: ContactConfirmationData) {
  const body = `
    <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Bonjour ${data.name},</p>
    <p style="margin: 0 0 24px;">Nous avons bien re\u00e7u votre message\u00a0: <strong style="color: ${C.textPrimary};">\u00ab\u00a0${data.subject}\u00a0\u00bb</strong>.</p>
    <p style="margin: 0 0 24px;">Notre \u00e9quipe vous r\u00e9pondra dans les plus brefs d\u00e9lais.</p>

    ${infoBox(`
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="font-family: ${FONT}; font-size: 14px; color: ${C.textSecondary};">
            D\u00e9lai moyen de r\u00e9ponse\u00a0: <strong style="color: ${C.textPrimary};">24-48h</strong> en jours ouvr\u00e9s.
          </td>
        </tr>
      </table>
    `)}

    <p style="font-size: 13px; color: ${C.textMuted}; margin: 0; text-align: center;">
      En attendant, consultez notre <a href="${APP_URL}/faq" style="color: ${C.emerald}; text-decoration: none;">FAQ</a> pour des r\u00e9ponses imm\u00e9diates.
    </p>`;

  const html = emailLayout({
    body,
    preheader: `Message re\u00e7u \u2014 nous vous r\u00e9pondrons sous 24-48h.`,
  });

  return sendEmail({
    to: data.to,
    subject: "Nous avons bien re\u00e7u votre message",
    html,
  });
}

export async function sendSmartAlertEmail(data: SmartAlertEmailData) {
  const ctaHtml = data.ctaUrl
    ? ctaButton(data.ctaUrl, data.ctaLabel || "Voir")
    : "";

  const body = `
    <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Bonjour ${data.name},</p>
    <p style="margin: 0 0 24px;">${data.message}</p>
    ${ctaHtml}`;

  const html = emailLayout({
    body,
    preheader: data.title,
  });

  return sendEmail({
    to: data.to,
    subject: data.title,
    html,
  });
}

// =========== TRANSACTIONAL EMAILS (toujours envoyés) ===========

interface SubscriptionPaymentFailedData {
  to: string;
  name: string;
  plan: string;
  amount: string;
}

export async function sendSubscriptionPaymentFailedEmail(data: SubscriptionPaymentFailedData) {
  const billingUrl = `${APP_URL}/photographer/credits`;

  const body = `
    <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Bonjour ${data.name},</p>
    <p style="margin: 0 0 24px;">Le paiement de votre abonnement <strong style="color: ${C.textPrimary};">${data.plan}</strong> a échoué. Veuillez mettre à jour votre moyen de paiement pour conserver vos crédits mensuels.</p>

    ${infoBox(`
      ${infoRow("Abonnement", data.plan)}
      ${infoRow("Montant", data.amount)}
      ${infoRow("Statut", '<span style="color: #EF4444; font-weight: 600;">Paiement échoué</span>')}
    `)}

    ${ctaButton(billingUrl, "Mettre à jour le paiement")}

    <p style="font-size: 13px; color: ${C.textMuted}; margin: 0; text-align: center;">
      Sans action de votre part, votre abonnement sera suspendu sous 7 jours.
    </p>`;

  const html = emailLayout({
    body,
    preheader: `Paiement échoué — mettez à jour votre moyen de paiement`,
  });

  return sendEmail({
    to: data.to,
    subject: "Paiement échoué — mettez à jour votre moyen de paiement",
    html,
  });
}

interface SubscriptionRenewalData {
  to: string;
  name: string;
  plan: string;
  creditAmount: number;
  amount: string;
  nextDate: string;
}

export async function sendSubscriptionRenewalEmail(data: SubscriptionRenewalData) {
  const creditsUrl = `${APP_URL}/photographer/credits`;

  const body = `
    <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Bonjour ${data.name},</p>
    <p style="margin: 0 0 24px;">Votre abonnement <strong style="color: ${C.textPrimary};">${data.plan}</strong> a été renouvelé. <strong style="color: ${C.emerald};">+${data.creditAmount.toLocaleString("fr-FR")} crédits</strong> ont été ajoutés à votre compte.</p>

    ${infoBox(`
      ${infoRow("Abonnement", data.plan)}
      ${infoRow("Crédits ajoutés", `+${data.creditAmount.toLocaleString("fr-FR")}`)}
      ${infoRow("Montant", data.amount)}
      ${infoRow("Prochain renouvellement", data.nextDate)}
    `)}

    ${ctaButton(creditsUrl, "Voir mes crédits")}`;

  const html = emailLayout({
    body,
    preheader: `Abonnement renouvelé — +${data.creditAmount.toLocaleString("fr-FR")} crédits ajoutés`,
  });

  return sendEmail({
    to: data.to,
    subject: `Abonnement renouvelé — +${data.creditAmount.toLocaleString("fr-FR")} crédits`,
    html,
  });
}

interface SubscriptionCanceledData {
  to: string;
  name: string;
  plan: string;
  endsAt: string;
}

export async function sendSubscriptionCanceledEmail(data: SubscriptionCanceledData) {
  const pricingUrl = `${APP_URL}/pricing`;

  const body = `
    <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Bonjour ${data.name},</p>
    <p style="margin: 0 0 24px;">Votre abonnement <strong style="color: ${C.textPrimary};">${data.plan}</strong> a été résilié. Vos crédits restants sont toujours utilisables.</p>

    ${infoBox(`
      ${infoRow("Abonnement", data.plan)}
      ${infoRow("Statut", '<span style="color: #EF4444; font-weight: 600;">Résilié</span>')}
      ${infoRow("Fin d\'accès", data.endsAt)}
    `)}

    <p style="margin: 0 0 24px; font-size: 14px; color: ${C.textSecondary};">
      Vous pouvez réactiver votre abonnement à tout moment ou acheter des packs de crédits à l'unité.
    </p>

    ${ctaButton(pricingUrl, "Voir les offres")}`;

  const html = emailLayout({
    body,
    preheader: `Votre abonnement a été résilié`,
  });

  return sendEmail({
    to: data.to,
    subject: "Votre abonnement a été résilié",
    html,
  });
}

// =========== NON-TRANSACTIONAL EMAILS (préférences + List-Unsubscribe) ===========

interface SupportReplyEmailData {
  to: string;
  name: string;
  subject: string;
  replyContent: string;
  repliedBy: string;
  unsubscribeUrl: string;
}

export async function sendSupportReplyEmail(data: SupportReplyEmailData) {
  const supportUrl = `${APP_URL}/sportif/messagerie`;

  const body = `
    <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Bonjour ${data.name},</p>
    <p style="margin: 0 0 24px;">Vous avez reçu une réponse à votre demande <strong style="color: ${C.textPrimary};">«\u00a0${data.subject}\u00a0»</strong>.</p>

    ${infoBox(`
      <p style="font-family: ${FONT}; font-size: 14px; color: ${C.textPrimary}; margin: 0; white-space: pre-wrap;">${data.replyContent}</p>
      <p style="font-family: ${FONT}; font-size: 12px; color: ${C.textMuted}; margin: 8px 0 0;">— ${data.repliedBy}</p>
    `)}

    ${ctaButton(supportUrl, "Voir la conversation")}`;

  const html = emailLayout({
    body,
    preheader: `Réponse à votre demande «\u00a0${data.subject}\u00a0»`,
    unsubscribeUrl: data.unsubscribeUrl,
    footerNote: "Vous recevez cet email car vous avez un ticket de support ouvert.",
  });

  return sendEmail({
    to: data.to,
    subject: `Réponse à votre demande : ${data.subject}`,
    html,
    headers: { "List-Unsubscribe": `<${data.unsubscribeUrl}>` },
  });
}

interface PhotosAvailableEmailData {
  to: string;
  name: string;
  eventName: string;
  eventId: string;
  photoCount: number;
  unsubscribeUrl: string;
}

export async function sendPhotosAvailableEmail(data: PhotosAvailableEmailData) {
  const galleryUrl = `${APP_URL}/events/${data.eventId}`;

  const body = `
    <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Bonjour ${data.name},</p>
    <p style="margin: 0 0 24px;"><strong style="color: ${C.textPrimary};">${data.photoCount} photo${data.photoCount > 1 ? "s" : ""}</strong> viennent d'être publiées pour <strong style="color: ${C.textPrimary};">${data.eventName}</strong>.</p>

    ${ctaButton(galleryUrl, "Voir les photos")}

    <p style="font-size: 13px; color: ${C.textMuted}; margin: 0; text-align: center;">
      Retrouvez vos photos, sélectionnez vos préférées et commandez-les en haute définition.
    </p>`;

  const html = emailLayout({
    body,
    preheader: `${data.photoCount} nouvelles photos pour ${data.eventName}`,
    unsubscribeUrl: data.unsubscribeUrl,
    footerNote: `Vous recevez cet email car vous suivez l'événement «\u00a0${data.eventName}\u00a0» sur Focus Racer.`,
  });

  return sendEmail({
    to: data.to,
    subject: `${data.photoCount} photos disponibles pour ${data.eventName} !`,
    html,
    headers: { "List-Unsubscribe": `<${data.unsubscribeUrl}>` },
  });
}

interface StripeOnboardedEmailData {
  to: string;
  name: string;
  unsubscribeUrl: string;
}

export async function sendStripeOnboardedEmail(data: StripeOnboardedEmailData) {
  const dashboardUrl = `${APP_URL}/photographer/orders`;

  const body = `
    <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Bonjour ${data.name},</p>
    <p style="margin: 0 0 24px;">Votre compte <strong style="color: ${C.emerald};">Stripe Connect</strong> est maintenant activé ! Vous pouvez recevoir vos paiements directement sur votre compte bancaire.</p>

    ${infoBox(`
      ${infoRow("Statut", '<span style="color: #10B981; font-weight: 600;">Activé ✓</span>')}
      ${infoRow("Virements", "Automatiques après chaque vente")}
      ${infoRow("Frais", "1\u00a0€ de frais de service par commande")}
    `)}

    ${ctaButton(dashboardUrl, "Voir mes ventes")}`;

  const html = emailLayout({
    body,
    preheader: `Votre compte Stripe Connect est activé — recevez vos paiements directement`,
    unsubscribeUrl: data.unsubscribeUrl,
  });

  return sendEmail({
    to: data.to,
    subject: "Stripe Connect activé — recevez vos paiements directement",
    html,
    headers: { "List-Unsubscribe": `<${data.unsubscribeUrl}>` },
  });
}

interface BadgeEarnedEmailData {
  to: string;
  name: string;
  badgeName: string;
  badgeDescription: string;
  unsubscribeUrl: string;
}

export async function sendBadgeEarnedEmail(data: BadgeEarnedEmailData) {
  const badgesUrl = `${APP_URL}/sportif/dashboard`;

  const body = `
    <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Bonjour ${data.name},</p>
    <p style="margin: 0 0 24px;">Félicitations ! Vous venez de gagner votre premier badge 🏆</p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td align="center" style="padding: 24px; background: ${C.grayLight}; border-radius: 12px;">
          <p style="font-family: ${FONT}; font-size: 20px; font-weight: 700; color: ${C.textPrimary}; margin: 0 0 8px;">${data.badgeName}</p>
          <p style="font-family: ${FONT}; font-size: 14px; color: ${C.textSecondary}; margin: 0;">${data.badgeDescription}</p>
        </td>
      </tr>
    </table>

    ${ctaButton(badgesUrl, "Voir mes badges")}

    <p style="font-size: 13px; color: ${C.textMuted}; margin: 0; text-align: center;">
      Continuez à utiliser Focus Racer pour débloquer d'autres badges !
    </p>`;

  const html = emailLayout({
    body,
    preheader: `Nouveau badge débloqué : ${data.badgeName}`,
    unsubscribeUrl: data.unsubscribeUrl,
  });

  return sendEmail({
    to: data.to,
    subject: `Badge débloqué : ${data.badgeName} !`,
    html,
    headers: { "List-Unsubscribe": `<${data.unsubscribeUrl}>` },
  });
}

interface NewSupportMessageEmailData {
  to: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  category: string;
  unsubscribeUrl: string;
}

export async function sendNewSupportMessageEmail(data: NewSupportMessageEmailData) {
  const adminUrl = `${APP_URL}/focus-mgr-7k9x/messages`;

  const body = `
    <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Nouveau message support</p>
    <p style="margin: 0 0 24px;">Un nouveau message a été reçu sur la plateforme.</p>

    ${infoBox(`
      ${infoRow("De", `${data.senderName} (${data.senderEmail})`)}
      ${infoRow("Sujet", data.subject)}
      ${infoRow("Catégorie", data.category)}
    `)}

    ${ctaButton(adminUrl, "Voir les messages")}`;

  const html = emailLayout({
    body,
    preheader: `Nouveau message support de ${data.senderName} — ${data.subject}`,
    unsubscribeUrl: data.unsubscribeUrl,
  });

  return sendEmail({
    to: data.to,
    subject: `[Support] ${data.subject} — ${data.senderName}`,
    html,
    headers: { "List-Unsubscribe": `<${data.unsubscribeUrl}>` },
  });
}

interface EventPublishedEmailData {
  to: string;
  name: string;
  eventName: string;
  eventId: string;
  eventDate: string;
  eventLocation?: string;
  unsubscribeUrl: string;
}

export async function sendEventPublishedEmail(data: EventPublishedEmailData) {
  const eventUrl = `${APP_URL}/events/${data.eventId}`;

  const body = `
    <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Bonjour ${data.name},</p>
    <p style="margin: 0 0 24px;">L'événement <strong style="color: ${C.textPrimary};">${data.eventName}</strong> que vous suivez vient d'être publié !</p>

    ${infoBox(`
      ${infoRow("Événement", data.eventName)}
      ${infoRow("Date", data.eventDate)}
      ${data.eventLocation ? infoRow("Lieu", data.eventLocation) : ""}
    `)}

    ${ctaButton(eventUrl, "Voir l'événement")}

    <p style="font-size: 13px; color: ${C.textMuted}; margin: 0; text-align: center;">
      Les photos seront disponibles prochainement. Nous vous préviendrons !
    </p>`;

  const html = emailLayout({
    body,
    preheader: `${data.eventName} est maintenant publié sur Focus Racer`,
    unsubscribeUrl: data.unsubscribeUrl,
    footerNote: `Vous recevez cet email car vous suivez l'événement «\u00a0${data.eventName}\u00a0» sur Focus Racer.`,
  });

  return sendEmail({
    to: data.to,
    subject: `${data.eventName} est publié !`,
    html,
    headers: { "List-Unsubscribe": `<${data.unsubscribeUrl}>` },
  });
}

// =========== NEW SALE → PHOTOGRAPHER ===========

interface NewSaleEmailData {
  to: string;
  name: string;
  buyerName: string;
  eventName: string;
  photoCount: number;
  totalAmount: string;
  orderId: string;
  unsubscribeUrl: string;
}

export async function sendNewSaleEmail(data: NewSaleEmailData) {
  const salesUrl = `${APP_URL}/photographer/orders`;

  const body = `
    <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Bonjour ${data.name},</p>
    <p style="margin: 0 0 24px;">Bonne nouvelle ! Vous avez réalisé une nouvelle vente sur Focus Racer.</p>

    ${infoBox(`
      ${infoRow("Acheteur", data.buyerName)}
      ${infoRow("Événement", data.eventName)}
      ${infoRow("Photos", `${data.photoCount} photo${data.photoCount > 1 ? "s" : ""}`)}
      ${infoRow("Montant", data.totalAmount)}
    `)}

    ${ctaButton(salesUrl, "Voir mes ventes")}

    <p style="font-size: 13px; color: ${C.textMuted}; margin: 0; text-align: center;">
      Le paiement sera reversé sur votre compte Stripe Connect.
    </p>`;

  const html = emailLayout({
    body,
    preheader: `Nouvelle vente : ${data.photoCount} photo${data.photoCount > 1 ? "s" : ""} — ${data.totalAmount}`,
    unsubscribeUrl: data.unsubscribeUrl,
  });

  return sendEmail({
    to: data.to,
    subject: `Nouvelle vente : ${data.photoCount} photo${data.photoCount > 1 ? "s" : ""} — ${data.eventName}`,
    html,
    headers: { "List-Unsubscribe": `<${data.unsubscribeUrl}>` },
  });
}

// =========== NEW FOLLOWER → PHOTOGRAPHER ===========

interface NewFollowerEmailData {
  to: string;
  name: string;
  followerName: string;
  eventName: string;
  eventId: string;
  totalFollowers: number;
  unsubscribeUrl: string;
}

export async function sendNewFollowerEmail(data: NewFollowerEmailData) {
  const eventUrl = `${APP_URL}/photographer/events/${data.eventId}`;

  const body = `
    <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Bonjour ${data.name},</p>
    <p style="margin: 0 0 24px;">Un nouveau sportif suit votre événement <strong style="color: ${C.textPrimary};">${data.eventName}</strong> !</p>

    ${infoBox(`
      ${infoRow("Sportif", data.followerName)}
      ${infoRow("Événement", data.eventName)}
      ${infoRow("Total followers", `${data.totalFollowers} sportif${data.totalFollowers > 1 ? "s" : ""}`)}
    `)}

    ${ctaButton(eventUrl, "Voir l'événement")}

    <p style="font-size: 13px; color: ${C.textMuted}; margin: 0; text-align: center;">
      Plus vous avez de followers, plus vos photos seront vues !
    </p>`;

  const html = emailLayout({
    body,
    preheader: `${data.followerName} suit votre événement ${data.eventName}`,
    unsubscribeUrl: data.unsubscribeUrl,
  });

  return sendEmail({
    to: data.to,
    subject: `Nouveau follower sur ${data.eventName}`,
    html,
    headers: { "List-Unsubscribe": `<${data.unsubscribeUrl}>` },
  });
}

// =========== LOW CREDITS → PHOTOGRAPHER ===========

interface LowCreditsEmailData {
  to: string;
  name: string;
  creditsRemaining: number;
  unsubscribeUrl: string;
}

export async function sendLowCreditsEmail(data: LowCreditsEmailData) {
  const creditsUrl = `${APP_URL}/photographer/credits`;

  const body = `
    <p style="font-size: 16px; color: ${C.textPrimary}; margin: 0 0 6px;">Bonjour ${data.name},</p>
    <p style="margin: 0 0 24px;">Votre solde de crédits est bas. Pensez à recharger pour continuer à importer vos photos.</p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0;">
      <tr>
        <td align="center" style="padding: 24px; background: #FEF3C7; border-radius: 12px;">
          <p style="font-family: ${FONT}; font-size: 14px; color: #92400E; margin: 0 0 4px;">Crédits restants</p>
          <p style="font-family: ${FONT}; font-size: 32px; font-weight: 700; color: #92400E; margin: 0;">${data.creditsRemaining.toLocaleString("fr-FR")}</p>
        </td>
      </tr>
    </table>

    ${ctaButton(creditsUrl, "Recharger mes crédits")}

    <p style="font-size: 13px; color: ${C.textMuted}; margin: 0; text-align: center;">
      Les packs de crédits commencent à 19 € pour 1 000 crédits.
    </p>`;

  const html = emailLayout({
    body,
    preheader: `Plus que ${data.creditsRemaining} crédits — rechargez votre compte`,
    unsubscribeUrl: data.unsubscribeUrl,
  });

  return sendEmail({
    to: data.to,
    subject: `Crédits bas : plus que ${data.creditsRemaining} crédits`,
    html,
    headers: { "List-Unsubscribe": `<${data.unsubscribeUrl}>` },
  });
}

// Re-export for test endpoint
export { sendEmail as _sendEmail, emailLayout as _emailLayout };
// Export helpers for use in other templates
export { ctaButton, infoBox, infoRow, orderRow, divider, C, FONT, APP_URL };
