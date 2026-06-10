# Focus Racer - État du Projet

> **Dernière mise à jour** : Session 29, 2026-06-10 — audit complet + correctifs déployés en prod (sécurité, Stripe, RGPD/S3, perf, SEO). Détail dans CLAUDE.md Session 29.
> ⚠️ Entre Session 27 et 28, une gamification complète (XP, niveaux, classements, badges, streaks, réactions, parrainage, partage, Wrapped) a été codée sans être consignée. Session 28 a retiré badges + XP + niveaux + classements. **Le code fait foi** (`src/lib/gamification/`, `prisma/schema.prisma`).
> ⚠️ **Pipeline deploy** : le conteneur prod exécute `prisma db push --accept-data-loss` + `node prisma/seed.js` à CHAQUE démarrage (pas `migrate deploy`). Les fichiers `prisma/migrations/` ne sont pas exécutés en prod ; toute modif de seed doit toucher seed.js ET seed.ts.

## Vue d'ensemble
Plateforme SaaS B2B2C de tri automatique et vente de photos de courses sportives par IA.

- **URL** : https://focusracer.swipego.app
- **Coolify UUID** : `ms440oowockwkso0k0c8okgc`
- **Repo** : https://github.com/AmazingeventParis/focus-racer.git (remote `amazingevent`)
- **Serveur** : OVH dédié `217.182.89.133` — AMD EPYC 4344P, 64GB RAM, 2x NVMe 960GB
- **Status** : Production, 28 sessions de dev

## Stack
- Next.js 14.2 (App Router) + React 18 + TypeScript + Tailwind + shadcn/ui
- Prisma 5.22 + PostgreSQL 16
- NextAuth.js (JWT, credential provider)
- AWS Rekognition (OCR dossards, détection visages)
- **OVH Object Storage** (stockage photos, bucket `focusracer`/GRA, depuis 2026-06-10) — bascule via `STORAGE_S3_*` ; AWS S3 conservé en fallback/rollback (vidé)
- Stripe Connect Express + Payment Element
- Gmail SMTP via Nodemailer (12 templates email, notifications préférences opt-out)
- Sharp (traitement images, 1 thread/worker, 2GB cache)
- next-themes (dark mode)
- Cloudflare Turnstile (CAPTCHA invisible) + bot detection + brute force protection
- Docker multi-stage + Caddy (reverse proxy, auto-SSL)

## Rôles utilisateurs (7)
PHOTOGRAPHER, ORGANIZER, AGENCY, CLUB, FEDERATION, ADMIN, RUNNER

## Pipeline IA (par photo)
1. Pré-filtrage : dédup (pHash hamming ≤5), flou (Laplacian < 30)
2. Analyse qualité + watermark + OCR (Rekognition DetectText) + IndexFaces — en parallèle
3. Smart Crop par visage (bbox + padding, 800px WebP)
4. Auto-retouch (normalize + brightness + saturation + sharpen)
5. Auto-linking orphelins (SearchFacesByImage, 85% confiance)
- 16 workers parallèles, ~300ms/photo, ~1000 photos en ~2min
- 1 crédit/photo (mode unique)

## Versions d'image (S3 exclusif)
- **HD** (path) : originale, S3, seulement après achat (signed URLs)
- **Web** (webPath) : 1600px WebP q80, galerie + IA
- **Thumbnail** (thumbnailPath) : watermarkée WebP, preview
- **Micro** : 400px, grille admin
- **Crop** (PhotoFace.cropPath) : recadrage visage individuel

## Structure S3
```
events/{eventId}/originals/{uuid}.jpg
events/{eventId}/web/web_{name}.webp
events/{eventId}/thumbs/wm_{name}.webp
events/{eventId}/thumbs/micro_{name}.webp
events/{eventId}/crops/{photoId}_face{i}.webp
events/{eventId}/branding/{type}_{uuid}.ext
platform/watermark.png
```

## Architecture fichiers
```
src/app/
  (public)/           - Route group : Header + Footer unifiés (layout.tsx)
    page.tsx           - Homepage (12 sections, animations, stats)
    explore/           - Recherche photos (dossard/visage/nom)
    pricing/           - Tarifs (packs crédits)
    faq/               - 18 Q&A, 6 sections accordéon
    contact/           - Formulaire catégorisé (guest + auth)
    about/             - Page À propos (mission, timeline, tech)
    solutions/
      sportifs/        - Landing sportifs (widgets animés)
      photographes/    - Landing photographes (pipeline IA)
      organisateurs/   - Landing organisateurs (connecteurs)
    account/           - Profil sportif, achats, stats, support, RGPD
    marketplace/       - Annonces photographe/organisateur
    legal/             - Mentions légales, CGU, confidentialité
    gdpr/              - Formulaire RGPD public
  events/[id]/         - Galerie publique + checkout (hors route group, layout custom)
  login/, register/    - Auth (hors route group, pas de nav)
  photographer/        - Dashboard pro photographe
  organizer/           - Dashboard pro organisateur (copie photographer, labels adaptés)
  sportif/             - Espace sportif (dashboard, courses, photos, horde, messagerie, paiements, réglages)
  focus-mgr-7k9x/     - Admin secret (dashboard, users, events, messages, paiements, RGPD, IA, settings)
  api/                 - REST APIs
src/components/
  layout/
    Header.tsx         - Header unifié (nav + dropdown Solutions + session-aware)
    Footer.tsx         - Footer unifié (4 colonnes liens + socials)
    MobileNav.tsx      - Navigation mobile (header fixe + bottom tab bar + sheet "Plus")
    SportifSidebar.tsx - Sidebar sportif desktop
    OrganizerSidebar.tsx - Sidebar organisateur desktop
  providers/
    ThemeProvider.tsx   - next-themes (dark mode, attribute="class")
    LocaleProvider.tsx  - i18n FR/EN (context + dictionnaires)
  TurnstileWidget.tsx  - Cloudflare Turnstile CAPTCHA (refs stables, script dedup)
  horde/               - Chat composants (HordeChat, ConversationList, MessageThread, etc.)
  ui/                  - shadcn/ui components
src/lib/
  auth.ts, ocr.ts, rekognition.ts, s3.ts, storage.ts
  watermark.ts, image-processing.ts, face-clustering.ts
  email.ts, pricing.ts, rate-limit.ts, stripe.ts
  turnstile.ts, login-protection.ts, bot-detection.ts, request-context.ts
  i18n.ts              - Dictionnaires FR/EN
  sharp-config.ts      - Config Sharp centralisée
  processing-queue.ts  - File d'attente bornée (16 workers)
  auto-cluster.ts      - Clustering debounced 30s
  ai-config.ts         - Config IA centralisée
  notification-emitter.ts - SSE temps réel
  notification-preferences.ts - Préférences email opt-out (canSendEmail, unsubscribe tokens)
src/hooks/
  usePWAInstall.ts     - Hook PWA (beforeinstallprompt)
  useFontScale.ts      - Hook taille texte (localStorage)
```

## DB (modèles Prisma)
User, Event, Photo, BibNumber, PhotoFace, StartListEntry, PricePack, Order, OrderItem, CreditTransaction, SupportMessage, MarketplaceListing, MarketplaceApplication, MarketplaceReview, GdprRequest, GdprAuditLog, ApiKey, PlatformSettings, Horde, HordeMember, HordeConversation, HordeConversationParticipant, HordeMessage, Notification, FriendRequest, FavoriteEvent, NotificationPreference, PhotoAlert, DeviceToken, GuestEventFollower

**Gamification conservée (Session 28)** : UserStreak, PhotoReaction (enum ReactionType), Referral (enum ReferralStatus), ShareEvent, CreditReward, SmartAlert (enum AlertType), WrappedRecap
**Gamification supprimée (Session 28)** : ~~UserBadge, XpEvent, UserLevel, LeaderboardEntry~~ + enums ~~XpActionType, LeaderboardPeriod~~

## Fonctionnalités complètes

### Espace Photographe / Organisateur
- Dashboard KPIs + graphiques tendance
- Création/gestion événements + affiche (poster image)
- Upload photos (compression client, chunks 25, timeline, mini-jeu BibRunner)
- 4 options import : dédup pHash, filtre flou, retouche auto, smart crop
- Triage auto (OCR dossard + visage) + clustering
- Start-list (import Njuko, KMS, CSV, manuel)
- Packs de vente (prix, contenus)
- Page Ventes (7 KPIs, graphiques, filtres, export CSV, Stripe Connect intégré)
- Branding (logo, watermark custom)
- Statistiques détaillées
- Marketplace (annonces, candidatures, avis)
- Messagerie support
- Streaks (séries) + StreakCard sur le dashboard
- Affiches événements dans dashboard (coverImage en miniature)
- ~~Badges photographe/organisateur~~ : supprimés Session 28

### Espace Sportif
- Dashboard personnel (StreakCard, réactions, parrainage — ~~badges supprimés Session 28~~)
- Mes courses + photos
- Ma Horde (membres, chat temps réel groupe/DM, demandes d'ami)
- Messagerie (support bidirectionnel)
- Paiements
- Réglages (profil, photo visage, préférences : dark mode, taille texte, langue FR/EN, PWA, partage profil)

### Espace Public
- Homepage (12 sections animées, stats, témoignages, FAQ)
- Recherche photos (dossard, selfie, nom)
- Galerie événement + checkout (Stripe Payment Element)
- Pages Solutions (sportifs, photographes, organisateurs)
- FAQ, Contact, À propos, Pricing
- Legal (mentions, CGU, confidentialité, RGPD)

### Admin (/focus-mgr-7k9x/)
- Dashboard KPIs globaux + revenus plateforme
- Gestion utilisateurs CRUD (créer, éditer, supprimer, toggle actif, crédits manuels)
- Gestion événements (stats, modération)
- Messagerie support (répondre, clôturer, badge non lus)
- Paiements détaillés (Stripe Connect, export CSV)
- RGPD (demandes, suppression cascade, audit)
- Pilotage IA (config, seuils)
- Watermark custom (upload PNG)

### Mobile
- MobileNav responsive (header fixe h-14 + bottom tab bar h-16 + sheet "Plus")
- Badges SSE temps réel (messagerie, horde)
- Safe area bottom (appareils à encoche)
- Appliqué aux 4 espaces (photographe, organisateur, sportif, admin)
- Dark mode toggle dans sheet "Plus" + réglages
- PWA installable (manifest.json, hook usePWAInstall)

### Notifications email (Session 26)
- **15 préférences opt-out** : modèle NotificationPreference (tout activé par défaut, l'utilisateur désactive)
- **12 templates email** : table-based, Outlook-safe, Gmail SMTP (`swipegoapp@gmail.com`)
  - Transactionnels (toujours envoyés) : confirmation achat, paiement échoué, renouvellement, résiliation
  - Non-transactionnels : réponse support, photos disponibles, Stripe Connect, badge gagné, message admin, événement publié, nouvelle vente, nouveau follower, crédits bas
- **13 triggers** : support reply, photos available, 4 Stripe webhooks, smart alerts (3 types), premier badge, message admin, événement publié, nouvelle vente, nouveau follower, crédits bas
- **canSendEmail(userId, key)** : vérifie préférence avant chaque envoi non-transactionnel
- **One-click unsubscribe** : header List-Unsubscribe + token base64url → `/api/notifications/unsubscribe`
- **UI accordéon** : `NotificationPreferencesCard` avec panneaux déroulants fermés par défaut, badge compteur
- **Prochaine recharge** : date + heure dans carte "Solde disponible" (fix Stripe API 2025+ : current_period_end → invoice line period.end → billing_cycle_anchor fallback)

### Transversal
- Dark mode (next-themes, attribute="class", persisté localStorage)
- i18n FR/EN (dictionnaires, LocaleProvider, labels navigation traduits)
- Taille texte configurable (4 niveaux, persisté localStorage)
- Header + Footer unifiés via route group `(public)/layout.tsx`
- Notifications SSE temps réel
- Protection médias (ProtectedImage, anti-hotlink, watermarks, signed URLs HD)
- Rate limiting in-memory

## Stripe
- Payment Element (Apple/Google Pay, SEPA, Card, Link)
- Connect Express (photographe reçoit paiements direct)
- Fee : 1€/commande (application_fee_amount: 100)
- Credit Packs : 1000 (19€), 5000 (85€), 15000 (225€)
- Subscriptions : 20000/mois (199€), 50000/mois (399€)
- Checkout Sessions (redirect Stripe hébergé) pour crédits
- Webhooks (11 events depuis Session 29) : payment_intent.succeeded/payment_failed, account.updated, checkout.session.completed/expired, invoice.payment_succeeded/payment_failed, customer.subscription.deleted/updated, **charge.refunded** (REFUNDED + révocation downloadToken), **charge.dispute.created** (révocation token)
- Webhook : 500 sur échec fulfillment (retry Stripe), échecs email non-bloquants
- Anti double abonnement : check subscriptions.list côté Stripe avant Checkout Session
- Accès commande post-paiement : preuve de possession (`?proof=` client_secret ou session_id) — plus d'accès "récent < 1h"
- Remboursement auto crédits si saveFile S3 échoue (batch-upload)
- Payouts Connect PENDING rejoués par cron `/api/cron/retry-payouts`

## Sécurité
- Admin URL secrète : /focus-mgr-7k9x/ (redirect 404 sur /admin/*)
- **requireAdmin()** (`src/lib/admin-guard.ts`, Session 29) : double verrou dans CHAQUE handler /api/admin/* — tout nouveau handler admin DOIT l'appeler en première ligne
- **Preuve de possession commandes** (Session 29) : /api/orders/[id] exige owner/admin OU `?proof=` (client_secret PI ou session_id Checkout)
- **Token unsubscribe HMAC-SHA256** (clé NEXTAUTH_SECRET, Session 29)
- **Turnstile fail-closed en prod** si TURNSTILE_SECRET_KEY absent (Session 29)
- **Seed prod** : désactive les comptes de test à chaque démarrage (Session 29)
- **report-wrong rate-limité** 5/min/IP (Session 29)
- **Cloudflare Turnstile** : CAPTCHA invisible sur login, register, contact (`src/lib/turnstile.ts`, `src/components/TurnstileWidget.tsx`)
- **Brute force login** : lockout progressif 5→15min, 10→1h, dual IP+email (`src/lib/login-protection.ts`)
- **Bot detection middleware** : 25+ UA bloqués, crawlers agressifs, validation headers navigateur, anti-scraping 15req/10s (`src/lib/bot-detection.ts`)
- **Honeypot** : champ caché sur login, register, contact — fake success si rempli
- **Rate limiting** : 13 routes protégées (contact 3/min, register 3/h, checkout 10/min, search 15/min, profil 20/min, marketplace 30/min, search-face 5/min, GDPR 3/h, etc.)
- **robots.txt** : bloque 12 crawlers agressifs, Disallow /api/ /photographer/ /organizer/ /sportif/
- **CSP** : script-src self + Turnstile, frame-src Stripe + Turnstile, connect-src self + Stripe + S3
- **HSTS** : max-age=63072000 (2 ans), includeSubDomains, preload
- ProtectedImage (anti-drag, anti-clic-droit, overlay transparent)
- Hotlink protection (Caddy Referer + API côté serveur)
- Watermarks sur toutes les images publiques
- HD jamais exposées (signed URLs 24h seulement)
- Security headers (X-Frame-Options, X-Content-Type-Options, Permissions-Policy, Referrer-Policy)
- DMCA/Legal page

## Env vars clés
```
DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
AWS_REGION (eu-west-1), AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
AWS_REKOGNITION_COLLECTION_ID, AWS_S3_BUCKET (focusracer-1771162064453)
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
NEXT_PUBLIC_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY
AI_MAX_CONCURRENT=16
NODE_OPTIONS="--max-old-space-size=16384 --expose-gc"
UV_THREADPOOL_SIZE=16
```

## TODO restant
- [ ] **Crontab serveur OVH** (Session 29) : curl quotidien sur /api/cron/auto-archive + process-alerts + retry-payouts avec CRON_SECRET (var créée dans Coolify) — AUCUN cron ne tourne tant que ce n'est pas fait
- [ ] **Rotation mot de passe admin prod** (publié dans l'historique git du repo public)
- [ ] **Migration Resend** : RESEND_API_KEY existe dans Coolify mais le code utilise Gmail SMTP (~500 mails/jour max)
- [x] **Migration OVH Object Storage** : faite 2026-06-10 (bucket focusracer/GRA, STORAGE_S3_* dans Coolify, données de test purgées, AWS gardé fallback). Reste : upload de test réel pour valider le bout-en-bout
- [ ] **Vider/supprimer le bucket AWS** une fois OVH validé en conditions réelles (déjà vidé des tests, mais conservé pour rollback)
- [ ] Basculer le deploy vers `prisma migrate deploy` (nécessite baseline) au lieu de `db push --accept-data-loss`
- [ ] Différencier espace organisateur vs photographe (dashboard, upload, marketplace, crédits, branding, équipe)
- [x] Configurer Stripe webhook sur serveur dédié (Session 24 — webhook créé `we_1T4NAdFeQbxycmAHy48wZwSb`)
- [ ] Sync Chrono (données course temps réel)
- [ ] Détection émotions
- [ ] Social Teaser (partage réseaux sociaux)
- [ ] QR Code generation
- [ ] Google OAuth
- [ ] Reset password flow
- [ ] Brancher detectLabels() dans le pipeline ou retirer le flag
- [ ] CloudFront CDN (optionnel, S3 direct pour l'instant)

### Rétention & Gamification (état réel Session 28)
> Implémentée en entier hors-journal, puis retrait badges + XP + niveaux + classements en Session 28. Reste dans `src/lib/gamification/`.
- [x] ~~**Système de niveaux / XP**~~ : implémenté hors-journal, **SUPPRIMÉ Session 28** (XpEvent, UserLevel, « Stagiaire »→« Légende »)
- [x] ~~**Classements / Leaderboards**~~ : implémentés hors-journal, **SUPPRIMÉS Session 28** (dépendaient des XP)
- [x] ~~**Badges**~~ : implémentés (Session 24), **SUPPRIMÉS Session 28** (UserBadge, 30 PNG, APIs)
- [x] **Séries (Streaks)** : conservé, décâblé des XP (`streak-service.ts`, StreakCard)
- [x] **Parrainage** : conservé (codes uniques + crédits parrain/filleul, `referral-service.ts`)
- [x] **Réactions sur photos** : conservé (LIKE/LOVE/FIRE/WOW, `PhotoReaction`)
- [x] **Partage social** : conservé (ShareEvent + tokens, `photos/[id]/share`)
- [x] **Crédits gratuits pour actions** : conservé (profil complet, 1ère réaction, 1er événement, `credit-reward-service.ts`)
- [x] **Alertes intelligentes** : photos dispo, relance achat, rappel tri, nouvelle vente, nouveau follower, crédits bas (Session 26)
- [x] **Récap annuel (Wrapped)** : conservé, sans niveau/XP/badges (`wrapped-service.ts`)
- [ ] **Challenges temporaires** : missions hebdo/mensuelles avec countdown + récompenses
- [ ] **Missions onboarding gamifié** : checklist avec récompense par étape
- [ ] **Programme fidélité à points** : 1€ = 10 pts, seuils réductions, expirables 12 mois
- [ ] **Réductions dynamiques** : photos invendues -30% après 48h, early bird -15%, bundles
- [ ] **Carte des courses** : carte interactive événements suivis/couverts (RaceMap + geocoding présents)

## Conventions
- **Toujours** utiliser les accents français : é, è, ê, à, ù, ç, î, ô
- **Jamais** "coureur(s)" → utiliser **"sportif(s)"** (plateforme multi-sport)
- Vérifier chaque chaîne française avant de soumettre

## Seed data (dev/test)
> Session 29 : mots de passe via env vars (`SEED_*_PASSWORD`) sinon générés aléatoirement (affichés dans les logs). En prod le seed **désactive** les comptes de test. Rotation du mot de passe admin prod recommandée (`npx tsx scripts/update-admin-password.ts`).
```
admin@focusracer.com        → /focus-mgr-7k9x/dashboard
photographe@test.com        (dev uniquement)
coureur@test.com            (dev uniquement)
orga@test.com               (dev uniquement)
```

## Deploy
```bash
git push amazingevent master
curl -s "http://217.182.89.133:8000/api/v1/deploy?uuid=ms440oowockwkso0k0c8okgc&force=true" \
  -H "Authorization: Bearer 1|FNcssp3CipkrPNVSQyv3IboYwGsP8sjPskoBG3ux98e5a576"
```

## Historique sessions
| Session | Réalisations clés |
|---------|-------------------|
| 1-2 | Setup projet, CDC, roadmap, Phase 7 (Payment Element, notifications, RGPD, SSE, marketplace, connecteurs) |
| 3-9 | Optimisations pipeline, UX upload (timeline, BibRunner), AWS Rekognition prod, S3, analytics, fun facts, face recognition auto |
| 10-14 | Migration serveur OVH dédié, Sharp centralisé, 16 workers, WebP, performances, sécurité médias |
| 15-16 | Admin complet, messagerie support, Smart Crop, auto-retouch, dédup pHash, filtre flou |
| 17-18 | Migration S3-only, Stripe Connect Express, admin CRUD users, pastilles messages |
| 19 | Stripe Checkout crédits, affiche événement, espace organisateur, sidebar simplifiée |
| 20 | FAQ, API contact, footer restructuré |
| 21 | Chat Horde (groupe + DM, SSE), page Horde 3 onglets, nouvelle homepage React |
| 22 | Navigation mobile (MobileNav), dashboard Ventes, fusion orders+payments, messagerie sportif, pricing |
| 23 | Dark mode, PWA, i18n FR/EN, taille texte, partage profil, pages Solutions (sportifs/photographes/organisateurs), page À propos, Header/Footer unifiés (route group public), fix header readability |
| 24 | Fix affichage financier (centimes→euros), KPIs ventes (total/packs/unitaires), Stripe webhook configuré, badges PNG (10 sportif + 10 photographe + 10 organisateur avec artwork custom), affiches événements dans dashboard |
| 26 | Système notifications complet (15 préférences opt-out, 12 templates email, 13 triggers, UI accordéon, one-click unsubscribe), prochaine recharge crédits (date+heure), fix Stripe API 2025+ (current_period_end supprimé) |
| 27 | Protection anti-bot complète : Cloudflare Turnstile CAPTCHA (vraies clés prod), brute force login (lockout progressif), bot detection middleware (25+ UA, anti-scraping), honeypot 3 formulaires, rate limiting 13 routes, robots.txt, CSP + HSTS |
| 28? | **(hors-journal)** Gamification complète codée sans être consignée : XP + niveaux, classements, streaks, réactions, parrainage, partage, Wrapped, smart alerts, crédits-récompenses (migration `20260225000000_add_gamification`) |
| 28 | **Retrait gamification partiel** : suppression badges + XP + niveaux + classements (UserBadge/XpEvent/UserLevel/LeaderboardEntry + enums droppés, migration `20260604120000_remove_badges_xp_leaderboards`). Conservés (décâblés des XP) : streaks, réactions, parrainage, partage, Wrapped, smart alerts, crédits-récompenses. Comptes de test réintégrés au seed |
| 29 | **Audit complet + correctifs prod** (4 commits déployés + smoke tests) : requireAdmin() 14 routes admin, IDOR commandes → preuve Stripe, HMAC unsubscribe, seed prod désactive comptes de test, webhook Stripe 500-sur-échec + charge.refunded/dispute/session.expired abonnés, remboursement auto crédits si S3 échoue, nettoyage S3+DeleteFaces sur DELETE photo/event/RGPD/auto-archive, fix spam emails followers (par chunk → par upload), crons process-alerts/retry-payouts + CRON_SECRET, sharp.concurrency(2), clustering parallèle ~10×, N+1 sportif, index Photo ×3, sitemap.xml, cache API public ×10, xlsx dynamic |
