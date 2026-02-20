> **IMPORTANT** : Lis `project-state.md` au demarrage pour comprendre l'etat complet du projet.

# Focus Racer - Journal de projet

> Version condensée - Suivi de l'avancement du projet Focus Racer

---

## 1. Vue d'ensemble

**Version** : 0.9.12
**URL** : https://focusracer.swipego.app
**Type** : Plateforme SaaS B2B2C de tri automatique et vente de photos de courses sportives

### Trois espaces utilisateurs

| Espace | Rôle | Fonctionnalités clés |
|--------|------|----------------------|
| **Pro (Photographe)** | Photographe, Agence, Club, Fédération | Upload, gestion événements, triage, stats, packs de vente |
| **Pro (Organisateur)** | Organisateur | Espace dédié `/organizer/`, copie de l'espace photographe (à différencier) |
| **Public** | Coureur / Acheteur | Recherche dossard/selfie/nom, achat, téléchargement |
| **Admin** | Administrateur plateforme | Gestion comptes, stats globales, paiements, RGPD, pilotage IA |

---

## 2. Stack technique

**Frontend** : Next.js 14.2 (App Router) • React 18 • TypeScript • Tailwind • shadcn/ui • React Hook Form + Zod

**Backend** : Next.js API Routes • Prisma 5.22 • PostgreSQL (Docker) • NextAuth.js • Sharp 0.33 • Stripe Payment Element • Resend

**IA** : AWS Rekognition (OCR, faces, labels) • Tesseract.js (fallback dev) • Sharp (auto-editing, watermark)

**Storage** : AWS S3 (`focusracer-1771162064453`) — stockage exclusif (pas de disque local) • CloudFront CDN (optionnel)

**Déploiement** : Serveur dédié OVH (`217.182.89.133`) • Coolify (PaaS) • Docker multi-stage • Caddy reverse proxy (auto-SSL) • PostgreSQL Docker

**Serveur** : AMD EPYC 4344P (16 cores / 32 threads) • 64 GB RAM • 2x NVMe 960 GB • Ubuntu 24.04

**Config prod** : Body size 100MB (Caddy + Next.js) • Output standalone • AI workers 16 • NODE_OPTIONS=16384MB • Sharp config centralisée (`src/lib/sharp-config.ts`) concurrency=1/worker cache=2GB • WebP web versions • Chunks 25

---

## 3. Architecture fichiers (simplifiée)

```
Focus Racer/
├── src/
│   ├── app/
│   │   ├── api/              # Auth, Events, Photos, Checkout, Admin, Marketplace, Webhooks
│   │   ├── photographer/     # Interface pro photographe (events, live, marketplace)
│   │   ├── organizer/        # Interface pro organisateur (copie photographe, labels adaptés)
│   │   ├── admin/           # Panel admin (dashboard, paiements, RGPD, IA)
│   │   ├── events/          # Pages publiques + checkout
│   │   ├── account/         # Espace coureur
│   │   └── marketplace/     # Place de marché
│   ├── components/          # UI + stripe-payment + game/bib-runner
│   ├── lib/
│   │   ├── auth.ts          # NextAuth multi-rôles
│   │   ├── ocr.ts           # AWS Rekognition + Tesseract fallback
│   │   ├── rekognition.ts   # AWS Rekognition API
│   │   ├── storage.ts       # Upload S3 + version web WebP (JPEG buffer pour IA)
│   │   ├── s3.ts            # AWS S3 + helpers (s3KeyToPublicPath, publicPathToS3Key)
│   │   ├── watermark.ts     # Watermarking Sharp
│   │   ├── sharp-config.ts       # Config Sharp centralisée (concurrency, cache)
│   │   ├── image-processing.ts  # Auto-retouch, qualité, smart crop, pHash duplicates
│   │   ├── processing-queue.ts  # File d'attente bornée (16 workers)
│   │   ├── auto-cluster.ts      # Clustering debounced 30s
│   │   ├── ai-config.ts         # Config IA centralisée
│   │   └── connectors/          # Njuko, KMS, CSV
│   └── types/               # Types TS + NextAuth extensions
├── prisma/
│   ├── schema.prisma        # 13+ modèles PostgreSQL
│   └── seed.ts             # Données de test
├── scripts/
│   ├── deploy.sh           # Déploiement one-command
│   ├── setup-aws.js        # Test credentials AWS
│   ├── setup-s3.js         # Config S3 automatisée
│   └── reprocess-photos.ts # Retraitement photos
├── Dockerfile
├── Caddyfile                # Reverse proxy prod (auto-SSL Let's Encrypt)
├── docker-compose.yml       # Dev (PostgreSQL)
├── docker-compose.production.yml  # Prod (PostgreSQL + App + Caddy)
└── .env.production.template # Template variables prod
```

---

## 4. Modèles de données (PostgreSQL)

**User** • Event • Photo • BibNumber • StartListEntry • PricePack • Order • OrderItem • GdprRequest • GdprAuditLog • MarketplaceListing • MarketplaceApplication • MarketplaceReview • PhotoFace • CreditTransaction • PlatformSettings

**Photo** : path (HD), webPath (1600px optimisée), thumbnailPath (watermark), s3Key, qualityScore, isBlurry, autoEdited, labels (JSON), faceIndexed, ocrProvider, creditDeducted, creditRefunded

**PhotoFace** : photoId, faceId, confidence, boundingBox (JSON), cropPath (smart crop WebP)

**User** : 7 rôles (PHOTOGRAPHER, ORGANIZER, AGENCY, CLUB, FEDERATION, ADMIN, RUNNER), stripeAccountId, stripeOnboarded, credits

**Order** : serviceFee, stripeFee, photographerPayout, stripeTransferId (champs Stripe Connect)

**SupportMessage** : userId, subject, message, category (BILLING/SORTING/GDPR/ACCOUNT/TECHNICAL/EVENT/OTHER), status (OPEN/IN_PROGRESS/RESOLVED/CLOSED), adminReply, readByUser

---

## 5. Fonctionnalités implémentées

### ✅ Phases 1-6 (complètes)
- PostgreSQL + multi-rôles + RBAC
- Dashboard pro + upload + start-list + triage + watermark + branding + price packs
- Galerie publique + recherche (dossard/nom/selfie) + favoris + viewer + SEO
- Stripe Payment Element (Apple/Google Pay, SEPA) + panier + upselling + téléchargement ZIP + emails
- Admin dashboard + KPIs + paiements + analytics + litiges + export CSV
- AWS Rekognition OCR + reconnaissance faciale + label detection + auto-editing + filtrage qualité + S3 + admin IA

### ✅ Phase 7 (7/11 features)
- [x] Apple Pay / Google Pay
- [x] Notifications email coureurs
- [x] RGPD complet (formulaire, suppression cascade, audit)
- [x] Upload Live SSE temps réel
- [x] Marketplace photographes ↔ organisateurs
- [x] Connecteurs API (Njuko, KMS, CSV)
- [x] Smart Crop (recadrage individuel par visage détecté)
- [ ] Sync Chrono • Détection émotions • Social Teaser • QR Codes

### ✅ Optimisations (Session 3+)
- Version web optimisée (1600px, JPEG q80, ~200-400KB)
- Pipeline IA sur version web (< 4MB AWS safe)
- OCR : AWS prod uniquement, Tesseract dev-only
- File d'attente bornée (8 workers en prod)
- Auto-clustering debounced (30s)

### ✅ UX Upload (Session 5, optimisé Session 14)
- Compression client-side Canvas parallèle (pool 4, 2400px, JPEG q85)
- Phase uploading avec XHR progress
- Progression granulaire (sous-étapes visibles)
- Mini-jeu "Bib Runner" pendant traitement
- API route `/api/uploads/[...path]` (streaming)
- Rewrite `/uploads/*` → `/api/uploads/*`

### ✅ Production (Session 6-8)
- Retraitement photos (web/thumbnails + OCR)
- AWS Rekognition production (85-95% détection, 0.3s/photo)
- AWS S3 stockage permanent (bucket `focusracer-1771162064453`)
- Debug tools OCR (`/api/debug/ocr`, `/photographer/events/[id]/debug-ocr`)
- Analytics UI redesign (vue par défaut, infographie élégante)
- Page miniatures dédiée (`/photographer/events/[id]/photos`)
- Fix upload JPEG anciens (normalizeImage avec fallback gracieux)

### ✅ Optimisations mémoire Render (Session 9) — HISTORIQUE, retiré en Session 12
- **Contexte** : OOM crashes sur Render free tier (512MB), contournés par des limitations agressives
- **Session 12** : Toutes les limitations Render ont été retirées — Sharp config centralisée, cache activé, 12 workers, BATCH_SIZE=15, body limit 100MB

### ✅ UX & IA avancée (Session 9)
- **Timeline visuelle** : 4 étapes (Compression → Upload → Traitement → Terminé) avec progress rings
- **63 fun facts sportifs** : enrichissement "Le saviez-vous" (records, physiologie, trails, olympisme)
- **Lien automatique par visage Premium** : orphelines auto-liées si visage reconnu avec dossard existant
- Source trackée : "face_recognition" (confidence 95%)
- Bouton manuel "Lier par visage" retiré (100% automatique)

### ✅ Admin complet + Messagerie (Session 15)
- **Gestion utilisateurs admin** : liste, recherche, filtre par rôle, activation/désactivation, modification crédits manuels
- **Messagerie support** : API CRUD, page admin avec réponse, page utilisateur avec formulaire catégorisé
- **Gestion événements admin** : vue globale, stats par événement, actions modération
- **Paiements détaillés** : page admin avec vue par transaction, export CSV
- **Pages agence/fédération** : interface dédiée pour gestion équipes et photographes
- **Statistiques photographe** : KPIs, graphiques, historique crédits, performance par événement

### ✅ Options import + Facturation (Session 16)
- **Smart Crop** : recadrage individuel par visage (bbox Rekognition → Sharp extract, padding généreux, 800px WebP)
- **Auto-retouch** : normalize + brightness/saturation boost + sharpen sur version web (Sharp, gratuit)
- **Suppression doublons** : pHash 8x8 (hamming ≤5), AVANT appels AWS, crédits conservés — option cochée par défaut
- **Filtre photos floues** : Laplacian variance (seuil 30), AVANT appels AWS, crédits conservés — option cochée par défaut
- **Mode Lite supprimé** : un seul mode avec IA complète (OCR + faces + watermark + qualité)
- **Remboursement orphelines supprimé** : photos sans dossard restent facturées
- **Facturation : 1 crédit/photo** (anciennement 2 en Premium)
- **PhotoFace.cropPath** : nouveau champ pour stocker le chemin du smart crop

### ✅ Migration S3-only (Session 17)
- **Stockage 100% S3** : plus aucune écriture disque local, DB fields `path`/`webPath`/`thumbnailPath` stockent des clés S3
- **Helpers S3** : `s3KeyToPublicPath()` (S3 key → URL `/uploads/...`), `publicPathToS3Key()` (reverse)
- **Proxy upload** : `/api/uploads/[...path]` fetch depuis S3 au lieu du disque local
- **Backward compat** : `getPhotoS3Key()` gère clés S3 et legacy `/uploads/...` paths
- **storage.ts** : `saveFile()` upload HD + web vers S3, retourne clés S3
- **watermark.ts** : upload thumb + micro vers S3, lecture watermark custom depuis S3
- **image-processing.ts** : `autoRetouchWebVersion()` lit/écrit S3, `smartCropFace()` upload S3, `autoEditImage()` supprimé
- **Docker** : volume upload supprimé, `UPLOAD_DIR` env var supprimé

### ✅ Stripe Connect Express + Frais de service (Session 17-18)
- **Stripe Connect Express** : photographe connecte son Stripe en ~3 min, reçoit paiements directement
- **1€ frais de service** : ajouté au total coureur, encaissé par plateforme via `application_fee_amount`
- **Flux** : Pack 15€ → coureur paie 16€ → plateforme 1€ → photographe ~14.46€ (15€ − frais Stripe)
- **API Connect** : onboarding (`/api/stripe/connect`), status (`/api/stripe/connect/status`), dashboard (`/api/stripe/connect/dashboard`)
- **Checkout modifié** : si photographe connecté → `transfer_data` + `application_fee_amount: 100` (1€)
- **Webhook enrichi** : `account.updated` + tracking fees sur `payment_intent.succeeded`
- **Page photographe** : `/photographer/payments` — section Connect (onboarding/dashboard) + statistiques revenus
- **Admin enrichi** : KPIs revenus plateforme, reversé photographes, colonnes commandes enrichies

### ✅ Admin utilisateurs CRUD + Messagerie améliorée (Session 18)
- **Création utilisateurs** : modal création (nom, email, MDP, rôle) avec hash bcrypt
- **Suppression utilisateurs** : hard delete avec cascade complète de toutes les relations (séquentiel, pas de transaction)
- **Édition profil** : inline edit sur page détail (nom, email, téléphone, société)
- **Toggle actif/inactif** : bouton rapide dans la liste
- **Pastille messages non lus** : badge rouge admin (OPEN) + badge rouge user (messages avec réponse non lue)
- **Tracking lecture** : champ `readByUser` sur SupportMessage, marqué `false` quand admin répond, `true` quand user visite la page
- **Workflow simplifié** : message reçu = OPEN → admin répond = IN_PROGRESS → bouton "Clôturer" = CLOSED
- **Filtre par défaut** : admin voit uniquement les messages actifs (OPEN + IN_PROGRESS), fermés masqués

### ✅ Stripe Checkout Crédits + Affiche événement + Espace Organisateur (Session 19)
- **Stripe Checkout Crédits** : achat de packs et abonnements via Stripe Checkout Sessions (redirect vers page Stripe hébergée)
  - `POST /api/credits/checkout` : crée une Checkout Session (mode `payment` pour packs, `subscription` pour abonnements)
  - Fulfillment via webhook `checkout.session.completed` + `invoice.payment_succeeded` (abonnements récurrents)
  - `POST /api/credits` supprimé (plus d'ajout gratuit de crédits)
  - Page `/photographer/credits` : redirect vers Stripe Checkout, gestion `?success=true`
- **Affiche événement** : upload poster image (JPG/PNG/WebP) sur la page événement photographe
  - Zone d'upload proéminente sur le header de la page événement (avec hover "Changer")
  - Fallback : fond blanc + nom de l'événement si pas d'affiche
  - Ajout à postériori de la création de l'événement
- **Événements récents sur homepage** : composant `HomeEvents` affichant les 6 derniers événements publics
- **Sidebar photographe simplifiée** : suppression onglets Commandes et Marketplace, renommage Paiements→Commandes, Statistiques→Data
- **Espace Organisateur** : duplication complète de `/photographer/` vers `/organizer/`
  - `OrganizerSidebar` dédié avec chemins `/organizer/...`
  - Middleware protège `/organizer/:path*` (mêmes rôles PRO)
  - Tous les labels "photographe" remplacés par "organisateur" dans l'UI
  - API partagées (mêmes endpoints que photographe)
- **Déploiement** : migration repo vers `AmazingeventParis/focus-racer` (public), remote `amazingevent`

### ✅ Footer + FAQ + Contact API (Session 20)
- **Page FAQ** : `/faq` — 18 questions/réponses en 6 sections accordéon (Coureurs, Photographes, Organisateurs, Paiements, Technique & IA, RGPD)
- **API Contact** : `POST /api/contact` — pas d'auth requise, guest OK (guestName + guestEmail), crée un SupportMessage
- **Page Contact refonte** : connectée au vrai backend (plus de faux setTimeout), sélecteur de catégorie (6 catégories), pré-remplissage nom/email si connecté, section FAQ teaser
- **Schema Prisma** : `SupportMessage.userId` rendu optionnel (`String?`), ajout `guestName` et `guestEmail` (`String?`)
- **Admin messages** : gestion des messages guest (affichage "Visiteur" badge, recherche par guestName/guestEmail)
- **Footer restructuré** : liens corrigés — FAQ → `/faq`, Centre d'aide → `/faq`, Contact → `/contact`, suppression liens morts

### ✅ Migration serveur dédié (Session 10)
- **Migration** : Render.com (512MB) → Serveur dédié OVH via Coolify
- **Serveur** : AMD EPYC 4344P, 64 GB RAM, 2x NVMe 960 GB
- **URL** : `https://focusracer.swipego.app` (domaine wildcard `*.swipego.app`)
- **docker-compose.production.yml** : PostgreSQL + App + Caddy (auto-SSL)
- **AI_MAX_CONCURRENT** : 1 → 8 workers parallèles
- **NODE_OPTIONS** : 400MB → 8192MB (8 Go)
- **Caddy** : remplace Nginx, auto-SSL Let's Encrypt, max upload 100MB
- **Stockage local persistant** : volume Docker (plus de stockage éphémère)
- **⚠️ Pipeline partiellement optimisé** : voir section "Optimisations restantes"

---

## 6. Variables d'environnement

**Database** : `DATABASE_URL`, `DB_PASSWORD`
**NextAuth** : `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (https://focusracer.swipego.app)
**Stripe** : `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
**Email** : `RESEND_API_KEY`, `EMAIL_FROM`
**AWS** : `AWS_REGION` (eu-west-1), `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REKOGNITION_COLLECTION_ID`, `AWS_S3_BUCKET` (focusracer-1771162064453), `AWS_CLOUDFRONT_URL`
**IA** : `AI_OCR_CONFIDENCE_THRESHOLD` (70), `AI_QUALITY_THRESHOLD` (30), `AI_AUTO_EDIT_ENABLED`, `AI_FACE_INDEX_ENABLED`, `AI_LABEL_DETECTION_ENABLED`, `AI_MAX_CONCURRENT` (16)
**Node.js** : `NODE_OPTIONS` (--max-old-space-size=16384 --expose-gc), `UV_THREADPOOL_SIZE` (16)

---

## 7. Historique condensé

| Session | Date | Réalisations clés |
|---------|------|-------------------|
| **1** | 2026-02-05 | Exploration projet, consolidation dossiers, CDC V2, roadmap 7 phases |
| **2** | 2026-02-05 | Phase 7 : Payment Element, notifications email, RGPD, upload live SSE, marketplace, connecteurs API |
| **3** | 2026-02-06 | Optimisations pipeline (version web, AWS-only OCR, queue bornée), auto-clustering, déploiement Docker |
| **4** | 2026-02-06 | Oracle Cloud bloqué (capacité ARM saturée Paris) → décision Render.com |
| **5** | 2026-02-11 | UX upload (compression client, XHR progress, BibRunner), fix Render (timeout Tesseract, API route /uploads), déploiement Render, GitHub Actions keep-alive |
| **6** | 2026-02-12 | Retraitement photos (API + script CLI), fix watermark SVG, découverte stockage éphémère Render |
| **7** | 2026-02-15 | Fix Tesseract worker, AWS Rekognition production (IAM user, Free Tier), debug tools, S3 setup automatisé (script, bucket, CORS, tests) |
| **8** | 2026-02-15 | Analytics UI redesign (vue par défaut, infographie élégante, page miniatures), fix upload JPEG anciens (normalizeImage fallback) |
| **9** | 2026-02-16 | Optimisations mémoire Render (OOM fix: 550MB→280MB), timeline upload visuelle, 63 fun facts sportifs, lien automatique orphelines par face recognition Premium |
| **10** | 2026-02-17 | Migration serveur dédié OVH (Coolify), AI_MAX_CONCURRENT=8, NODE_OPTIONS=8192MB, Caddy auto-SSL, docker-compose.production.yml |
| **12** | 2026-02-17 | Optimisation pipeline serveur dédié : Sharp centralisé + cache 2GB, 12 workers, pipeline parallélisé (Promise.all), BATCH_SIZE=15, body limit 100MB, heap 16GB, UV_THREADPOOL_SIZE=16, connection_limit=40, suppression vestiges Render |
| **13** | 2026-02-17 | Workers 16, WebP web versions, chunks 25, watermark admin custom (PlatformSettings, API, page admin /admin/settings) |
| **14** | 2026-02-17 | Performances (buffer direct, pagination, micro-thumbnails, streaming, Brotli, compression parallèle) + Sécurité médias (ProtectedImage, hotlink, rate limiting, anti-theft CSS, security headers, DMCA/legal) |
| **15** | 2026-02-18 | Admin complet : gestion utilisateurs + crédits manuels, messagerie support (API + admin + user), gestion événements admin, paiements détaillés, pages agence/fédération, statistiques photographe |
| **16** | 2026-02-18 | Options import : Smart Crop (par visage), Auto-retouch, suppression doublons (pHash), filtre flou (Laplacian). Suppression mode Lite (1 seul mode). Suppression remboursement orphelines. Facturation 1 crédit/photo |
| **17** | 2026-02-18 | Migration S3-only (plus de disque local), Stripe Connect Express + 1€ frais service, page photographe paiements, admin paiements enrichi, checkout avec frais service |
| **18** | 2026-02-18 | Admin CRUD utilisateurs (créer/supprimer/éditer/toggle), pastilles messages non lus (admin + user), workflow messagerie simplifié (OPEN→IN_PROGRESS→CLOSED), filtre actifs par défaut |
| **19** | 2026-02-19 | Stripe Checkout crédits (packs + abonnements), affiche événement (upload poster), événements récents homepage, sidebar simplifiée, espace organisateur (duplication complète /photographer/ → /organizer/), migration repo GitHub |
| **20** | 2026-02-20 | Page FAQ (18 Q&A, 6 sections accordéon), API contact guest+auth, refonte page contact (catégories, pré-remplissage), footer restructuré, admin messages guest |

**Fichiers clés créés** : `src/app/api/credits/checkout/route.ts`, `src/components/home-events.tsx`, `src/app/organizer/` (22 pages copiées de photographer), `src/components/layout/OrganizerSidebar.tsx`, `src/lib/sharp-config.ts`, `src/components/stripe-payment.tsx`, `src/lib/auto-cluster.ts`, `src/lib/processing-queue.ts`, `src/components/game/bib-runner.tsx`, `src/app/api/uploads/[...path]/route.ts`, `src/app/api/admin/reprocess-photos/route.ts`, `scripts/setup-aws.js`, `scripts/setup-s3.js`, `src/app/api/debug/ocr/route.ts`, `src/components/analytics-visual.tsx`, `src/app/photographer/events/[id]/photos/page.tsx`, `src/components/upload-timeline.tsx`, `docker-compose.production.yml`, `Caddyfile`, `.env.production.template`, `src/app/api/admin/settings/watermark/route.ts`, `src/app/admin/settings/page.tsx`, `src/app/api/admin/users/route.ts`, `src/app/api/admin/users/[id]/route.ts`, `src/app/api/admin/users/[id]/credits/route.ts`, `src/app/api/support/route.ts`, `src/app/api/admin/messages/route.ts`, `src/app/api/admin/messages/[id]/route.ts`, `src/app/api/admin/messages/unread-count/route.ts`, `src/app/api/support/unread-count/route.ts`, `src/app/api/support/mark-read/route.ts`, `src/app/api/stripe/connect/route.ts`, `src/app/api/stripe/connect/status/route.ts`, `src/app/api/stripe/connect/dashboard/route.ts`, `src/app/photographer/payments/page.tsx`, `src/app/api/admin/payments-stats/route.ts`, `src/app/api/contact/route.ts`, `src/app/faq/page.tsx`

---

## 8. Notes techniques essentielles

### Pipeline IA (état réel vérifié — `batch-upload/route.ts`)
- **Facturation** : 1 crédit/photo (mode unique, pas de Lite/Premium)
- **3 versions photo** : HD originale (achat) • web WebP (1600px, q80, galerie) + JPEG buffer (pipeline IA) • thumbnail watermarkée WebP (galerie)
- **Sharp config** : centralisée dans `src/lib/sharp-config.ts` — concurrency(1) par worker, cache 2 GB activé
- **Pré-filtrage AVANT appels AWS** (économie de coûts API, crédits NON remboursés) :
  1. **Suppression doublons** : pHash (8x8 grayscale → hamming distance ≤5) — option cochée par défaut
  2. **Filtre photos floues** : Laplacian variance (256x256, seuil 30/100) — option cochée par défaut
  3. Photos supprimées de la DB, crédits déjà déduits conservés
- **Pipeline par photo** (fonction `processPhotoWithProgress`) :
  1. **En parallèle (Promise.all)** : `analyzeQuality()` + `generateWatermarkedThumbnail()` + `detectTextFromImage()` (OCR) + `indexFaces()`
  2. DB update batch unique (qualityScore, thumbnailPath, ocrProvider, faceIndexed)
  3. **Smart Crop** (option) : recadrage individuel par visage (bbox Rekognition → Sharp extract, padding 80% côtés / 50% haut / 200% bas, 800px max WebP) → `PhotoFace.cropPath`
  4. **Auto-retouch** (option) : normalize + brightness 1.02 + saturation 1.05 + sharpen σ0.8 → overwrite webPath
  5. `searchFaceByImage()` — auto-link orphelines si OCR=0 bibs (seuil 85%, source "face_recognition")
- **Pas de remboursement** : les photos orphelines (sans dossard) restent facturées (coût AWS engagé)
- **NON utilisé dans le pipeline** : `detectLabels()` (flag activé mais non branché)
- **OCR** : AWS Rekognition prod (85-95%, 0.3s) • Tesseract dev-only (retiré du Dockerfile)
- **Queue** : 16 workers parallèles (AI_MAX_CONCURRENT=16 via env), GC tous les 10 traitements
- **Upload** : client chunke 25 photos → serveur BATCH_SIZE=15 → pré-filtre → enqueue processing queue
- **Watermark** : custom PNG uploadable via admin (`/admin/settings`), cache mémoire, fallback SVG "FOCUS RACER"
- **Auto-clustering** : debounced 30s après dernier traitement (`scheduleAutoClustering`)
- **4 options photographe** (avant import) : Suppression doublons (ON), Filtre flou (ON), Retouche auto (OFF), Smart Crop (OFF)

### Optimisations restantes (non critiques)
| Sujet | Détails |
|-------|---------|
| **detectLabels absent** | `ai-config.ts:38` — flag activé mais non utilisé dans le pipeline |
| **Build checks off** | `next.config.mjs:5-9` — TS + ESLint désactivés (réactiver si souhaité) |

### AWS Free Tier
- **Rekognition** : 1000 images/mois pendant 12 mois (DetectText, IndexFaces, SearchFaces, DetectLabels)
- **S3** : 5 GB stockage + 20k GET + 2k PUT/mois pendant 12 mois
- **Après** : ~0,003€/photo OCR + ~0,50€/mois pour 10 000 photos stockées
- **IAM user** : `focusracer-rekognition` avec Rekognition + S3 FullAccess

### Stockage (S3-only depuis Session 17)
- **S3 exclusif** : bucket `focusracer-1771162064453` (eu-west-1), plus aucun stockage disque local
- **Structure S3** : `events/{eventId}/{originals|web|thumbs|crops|branding}/`, `platform/watermark.png`
- **DB fields** : `path`, `webPath`, `thumbnailPath` stockent des clés S3 (pas des chemins fichiers)
- **Helpers** : `s3KeyToPublicPath()` (clé S3 → URL `/uploads/...`), `publicPathToS3Key()` (reverse)
- **Proxy** : `/api/uploads/[...path]` fetch depuis S3 (backward compat URLs)
- **URLs signées** : 24h pour téléchargements sécurisés
- **CDN** : CloudFront optionnel (non configuré actuellement)

### Stripe (Connect Express depuis Session 17)
- Payment Element embarqué (Apple Pay, Google Pay, Link, SEPA, CB)
- **Stripe Connect Express** : photographe connecte son Stripe, reçoit paiements directement
- **1€ frais de service** : `application_fee_amount: 100` (centimes), encaissé par plateforme
- **Flux** : prix photos + 1€ → `transfer_data.destination` = photographe, `application_fee_amount` = 1€
- **Fallback** : si photographe non connecté, paiement classique (tout va à la plateforme, pas de frais service)
- **Constantes** : `SERVICE_FEE_CENTS = 100`, `SERVICE_FEE_DISPLAY = "1,00 €"` (dans `src/lib/stripe.ts`)
- Checkout guest avec guestEmail/guestName
- Webhooks : payment_intent.succeeded, account.updated (Connect), checkout.session.completed (crédits), invoice.payment_succeeded (abonnements)
- **Stripe Checkout Crédits** : `POST /api/credits/checkout` → Checkout Session → fulfillment via webhook
- **Packs valides** : 1000 crédits (19€), 5000 (85€), 15000 (225€)
- **Abonnements** : 20000 crédits/mois (199€), 50000 crédits/mois (399€)

### Performance (optimisé Session 14)
- **Queue** : 16 workers parallèles (AI_MAX_CONCURRENT=16), Sharp concurrency(1)/worker + cache 2 GB
- **Pipeline** : 4 étapes parallèles par photo (quality + watermark + OCR + faces) via Promise.all — ~300ms/photo
- **Buffer direct** : generateWebVersion reçoit Buffer (pas re-lecture disque), ~15ms économisés/photo
- **Débit estimé** : ~1000 photos en ~2 min (16 workers × pipeline parallélisé)
- **Node.js** : heap 16 GB, UV_THREADPOOL_SIZE=16, --expose-gc
- **Prisma** : connection_limit=40 (16 workers × ~3 queries/photo)
- **Serveur** : AMD EPYC 4344P (16c/32t), 64 GB DDR5, 2x NVMe 960 GB
- **Compression** : Caddy Brotli + zstd + gzip (~15-20% plus léger que gzip seul)
- **Images** : WebP partout, micro-thumbnails 400px (grille admin), SVG watermark cache par dimensions
- **Galerie publique** : pagination cursor (100/page) + infinite scroll IntersectionObserver
- **Grille admin** : progressive rendering (120 photos, lazy DOM) + micro-thumbnails
- **Lightbox** : prefetch images adjacentes on hover
- **File serve** : streaming (createReadStream → ReadableStream, pas de chargement mémoire)
- **Cache-Control** : API JSON (s-maxage=60, stale-while-revalidate=300), images (immutable 1 an)
- **Fonts** : GeistSans variable (local), plus de Google Fonts externe
- **Next.js Image** : formats WebP, deviceSizes/imageSizes optimisés, srcset automatique
- Version web < 4MB (AWS Rekognition safe)
- Gallery serve order : micro-thumbnail (grille) > thumbnailPath > webPath > path (HD)
- **Lien automatique** : 95%+ photos liées (OCR + face recognition Premium)

### Protection médias (Session 14)
- **ProtectedImage** : composant React (overlay transparent, onContextMenu, onDragStart, pointer-events:none)
- **Anti-theft CSS** : user-select:none, -webkit-touch-callout:none, -webkit-user-drag:none sur la galerie
- **Keyboard blocking** : Ctrl+S, Ctrl+U, Ctrl+Shift+I bloqués sur la page galerie publique
- **Hotlink protection** : Caddy bloque /api/uploads/* et /_next/image* sans Referer valide (403)
- **Hotlink API** : route /api/uploads/ vérifie le Referer côté serveur (double protection)
- **X-Robots-Tag** : noindex/nofollow sur /api/uploads/* (empêche indexation Google Images)
- **Security headers** : X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, Permissions-Policy, Referrer-Policy
- **Watermarks** : protection principale — toutes les images publiques sont watermarkées (1200px max)
- **HD originals** : jamais exposés publiquement, uniquement après achat via signed URLs
- **Rate limiting** : sliding window in-memory (`src/lib/rate-limit.ts`) — events 60/min, search 30/min, uploads 120/min, list 30/min
- **DMCA / Legal** : page `/legal` avec sections protection photos, droits d'auteur, procédure DMCA, sanctions (Code PI)
- **Copyright notice** : mention discrète en bas de chaque galerie publique avec lien vers `/legal#protection-photos`
- **Admin slug secret** : `/focus-mgr-7k9x/` remplace `/admin/` — URL non devinable, redirect 404 sur `/admin/*`

### Déploiement
- **Coolify** : PaaS sur `217.182.89.133`, app UUID `ms440oowockwkso0k0c8okgc`
- **Docker** : `docker-compose.production.yml` (PostgreSQL + App + Caddy)
- **SSL** : automatique via Caddy + Let's Encrypt
- **Stockage** : S3 uniquement (pas de volume upload Docker)
- **Domaine** : `focusracer.swipego.app` (wildcard `*.swipego.app` → 217.182.89.133)
- **Git remote** : `amazingevent` → `https://github.com/AmazingeventParis/focus-racer.git` (public)
- **Deploy** : `git push amazingevent master` puis `curl` API Coolify deploy

### UX Upload
- **Timeline visuelle** : 4 étapes avec progress rings (Compression → Upload → Traitement → Terminé)
- **Fun facts** : 63 faits sportifs affichés pendant traitement (tous les 10% de progression)
- **BibRunner game** : animation runner sur piste pendant traitement
- **Progression granulaire** : SSE temps réel avec sous-étapes visibles
- **Upload chunké** : 25 photos/chunk côté client, BATCH_SIZE=15 côté serveur
- **Compression parallèle** : pool de 4 workers Canvas, 2400px max, JPEG q85, libération mémoire Canvas

### Debug
- `/api/debug/ocr?eventId=xxx` : inspect OCR results
- `/photographer/events/[id]/debug-ocr` : visual OCR stats
- `npm run reprocess` : regenerate web/thumbs + re-run OCR

### Seed data
```
admin@focusracer.com / Laurytal2   (admin → /focus-mgr-7k9x/dashboard)
photographe@test.com / photo123
coureur@test.com / runner123
orga@test.com / orga123
```

### Admin secret
- **URL** : `https://focusracer.swipego.app/focus-mgr-7k9x/dashboard`
- **Login** : `admin@focusracer.com` / `Laurytal2`
- **Slug defini dans** : `next.config.mjs` (constante `ADMIN_SLUG`) + `middleware.ts`
- **Redirect 404** : `/admin/*` redirige vers 404 (direct access bloqué)
- **Script MDP prod** : `npx tsx scripts/update-admin-password.ts`

---

## 9. TODO Production

### ~~Priorité 1 — Exploiter le serveur dédié~~ ✅ (Session 12)
- [x] Sharp config centralisée (`src/lib/sharp-config.ts`) : concurrency(1)/worker + cache 2 GB
- [x] BATCH_SIZE : 5 → 15
- [x] Body limit : 10 MB → 100 MB (aligné avec Caddy)
- [x] Keep-alive supprimé (`keep-alive.ts`, `instrumentation.ts`, `keep-alive.yml`)
- [x] Commentaires "Render 512MB" mis à jour
- [x] Queue : 8 → 12 → 16 workers, GC tous les 10 traitements
- [x] Pipeline parallélisé (Promise.all : quality + watermark + OCR + faces)
- [x] Node.js : heap 16 GB, UV_THREADPOOL_SIZE=16, --expose-gc
- [x] Prisma : connection_limit=40
- [x] WebP web versions (JPEG buffer gardé en mémoire pour AWS Rekognition)
- [x] Chunks client : 10 → 25 photos/chunk
- [x] Watermark admin custom (PlatformSettings, API, page admin)

### ~~Priorité 2 — Nettoyage~~ ✅ (Session 12)
- [x] Supprimé `render.yaml`, `nginx.conf`, `docker-compose.prod.yml`, `.github/workflows/keep-alive.yml`
- [x] `autoEditImage()` remplacée par `autoRetouchWebVersion()` branchée dans le pipeline (option photographe)
- [ ] Décider : brancher `detectLabels()` dans le pipeline ou retirer le flag `AI_LABEL_DETECTION_ENABLED`

### Priorité 3 — Fonctionnel
- [x] Activer Stripe Connect Express pour split payment réel (Session 17)
- [x] Supprimer `autoEditImage()` morte dans `image-processing.ts` (Session 17)
- [x] Stripe Checkout pour achat crédits (packs + abonnements) (Session 19)
- [x] Espace organisateur dupliqué depuis photographe (Session 19)
- [ ] Configurer Stripe webhook sur serveur dédié (env `STRIPE_WEBHOOK_SECRET`)
- [ ] Différencier espace organisateur vs photographe (dashboard, upload, marketplace, crédits, branding, équipe)
- [ ] Implémenter features Phase 7 restantes (Sync Chrono, Détection émotions, Social Teaser, QR Codes)

---

**Dernière mise à jour** : Session 20, 2026-02-20 (FAQ, contact API guest, footer restructuré, admin messages guest)
