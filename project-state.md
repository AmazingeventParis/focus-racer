# Focus Racer - État du Projet

> **Dernière mise à jour** : Session 26, 2026-02-26

## Vue d'ensemble
Plateforme SaaS B2B2C de tri automatique et vente de photos de courses sportives par IA.

- **URL** : https://focusracer.swipego.app
- **Coolify UUID** : `ms440oowockwkso0k0c8okgc`
- **Repo** : https://github.com/AmazingeventParis/focus-racer.git (remote `amazingevent`)
- **Serveur** : OVH dédié `217.182.89.133` — AMD EPYC 4344P, 64GB RAM, 2x NVMe 960GB
- **Status** : Production, 26 sessions de dev

## Stack
- Next.js 14.2 (App Router) + React 18 + TypeScript + Tailwind + shadcn/ui
- Prisma 5.22 + PostgreSQL 16
- NextAuth.js (JWT, credential provider)
- AWS Rekognition (OCR dossards, détection visages)
- AWS S3 (stockage photos exclusif — pas de disque local)
- Stripe Connect Express + Payment Element
- Gmail SMTP via Nodemailer (12 templates email, notifications préférences opt-out)
- Sharp (traitement images, 1 thread/worker, 2GB cache)
- next-themes (dark mode)
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
  horde/               - Chat composants (HordeChat, ConversationList, MessageThread, etc.)
  ui/                  - shadcn/ui components
src/lib/
  auth.ts, ocr.ts, rekognition.ts, s3.ts, storage.ts
  watermark.ts, image-processing.ts, face-clustering.ts
  email.ts, pricing.ts, rate-limit.ts, stripe.ts
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
User, Event, Photo, BibNumber, PhotoFace, StartListEntry, PricePack, Order, OrderItem, CreditTransaction, SupportMessage, MarketplaceListing, MarketplaceApplication, MarketplaceReview, GdprRequest, GdprAuditLog, ApiKey, PlatformSettings, Horde, HordeMember, HordeConversation, HordeConversationParticipant, HordeMessage, Notification, FriendRequest, FavoriteEvent, NotificationPreference

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
- 10 badges photographe (Premier Shoot, Œil de Lynx, Marathonien, Photographe d'Or, Best-Seller, Machine à Cash, Multi-Terrain, Fidèle au Poste, Connecté Stripe, Zéro Déchet)
- 10 badges organisateur (Premier Départ, Peloton, Organisateur Série, Galerie Complète, Fan de Data, Importateur Pro, Parrain, Multi-Discipline, Roi du Branding, Vétéran)
- Affiches événements dans dashboard (coverImage en miniature)

### Espace Sportif
- Dashboard personnel + 10 badges (Premier achat, Collectionneur, Passionné, Multi-sport, Fidèle, Explorateur, Social, Leader, Mécène, Pionnier)
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
- Webhooks : payment_intent.succeeded, account.updated, checkout.session.completed, invoice.payment_succeeded, invoice.payment_failed, customer.subscription.deleted, customer.subscription.updated, checkout.session.expired

## Sécurité
- Admin URL secrète : /focus-mgr-7k9x/ (redirect 404 sur /admin/*)
- ProtectedImage (anti-drag, anti-clic-droit, overlay transparent)
- Hotlink protection (Caddy Referer + API côté serveur)
- Watermarks sur toutes les images publiques
- HD jamais exposées (signed URLs 24h seulement)
- Rate limiting in-memory (60/min events, 30/min search, 120/min uploads)
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- DMCA/Legal page

## Env vars clés
```
DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
AWS_REGION (eu-west-1), AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
AWS_REKOGNITION_COLLECTION_ID, AWS_S3_BUCKET (focusracer-1771162064453)
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
AI_MAX_CONCURRENT=16
NODE_OPTIONS="--max-old-space-size=16384 --expose-gc"
UV_THREADPOOL_SIZE=16
```

## TODO restant
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

### Rétention & Gamification (à implémenter)
- [ ] **Système de niveaux / XP** : actions = XP (achat, favori, partage, profil complet), niveaux Débutant→Légende, barre progression, 3 rôles
- [ ] **Classements / Leaderboards** : top sportifs, photographes, organisateurs (hebdo/mensuel avec reset)
- [ ] **Séries (Streaks)** : achats/uploads consécutifs → badge + réduction
- [ ] **Challenges temporaires** : missions hebdo/mensuelles avec countdown + progression + récompenses
- [ ] **Missions onboarding gamifié** : checklist nouveau sportif/photographe/organisateur avec récompense par étape
- [ ] **Parrainage** : code unique, crédits parrain+filleul, tableau de suivi
- [ ] **Réactions sur photos** : likes, "Photo de ouf", notifications photographe/sportif
- [ ] **Partage social avec incentive** : partage watermarké → HD gratuite, story templates auto
- [ ] **Programme fidélité à points** : 1€ = 10 pts, seuils réductions, expirables 12 mois
- [ ] **Réductions dynamiques** : photos invendues -30% après 48h, early bird -15%, bundles multi-courses
- [ ] **Crédits gratuits pour actions** : profil complet, 1ère review, bug signalé
- [x] **Alertes intelligentes** : photos dispo, relance achat, rappel tri, nouvelle vente, nouveau follower, crédits bas (Session 26)
- [ ] **Récap annuel (Wrapped)** : stats personnalisées sportif/photographe/organisateur, partageable social
- [ ] **Carte des courses** : carte interactive événements suivis/couverts, badges régions

## Conventions
- **Toujours** utiliser les accents français : é, è, ê, à, ù, ç, î, ô
- **Jamais** "coureur(s)" → utiliser **"sportif(s)"** (plateforme multi-sport)
- Vérifier chaque chaîne française avant de soumettre

## Seed data (dev/test)
```
admin@focusracer.com / Laurytal2   → /focus-mgr-7k9x/dashboard
photographe@test.com / photo123
coureur@test.com / runner123
orga@test.com / orga123
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
