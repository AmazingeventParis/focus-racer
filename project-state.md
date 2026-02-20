# Focus Racer - Etat du Projet

## Vue d'ensemble
Plateforme SaaS B2B2C de tri automatique et vente de photos de courses sportives par IA.

- **URL** : https://focusracer.swipego.app
- **Coolify UUID** : `ms440oowockwkso0k0c8okgc`
- **Repo** : https://github.com/AmazingeventParis/focus-racer.git
- **Volume** : focusracer-uploads:/app/public/uploads
- **Status** : Production, 20 sessions de dev

## Stack
- Next.js 14.2 (App Router) + React 18 + TypeScript + Tailwind + shadcn/ui
- Prisma 5.22 + PostgreSQL 16
- NextAuth.js (JWT, credential provider)
- AWS Rekognition (OCR dossards, detection visages)
- AWS S3 (stockage photos)
- Stripe Connect Express + Payment Element
- Resend (emails)
- Sharp (traitement images, 1 thread, 2GB cache)
- Docker multi-stage + Caddy (reverse proxy, auto-SSL)

## Roles utilisateurs (7)
PHOTOGRAPHER, ORGANIZER, AGENCY, CLUB, FEDERATION, ADMIN, RUNNER

## Pipeline IA (par photo)
1. Pre-filtrage: dedup (pHash), flou (Laplacian < 30)
2. Analyse qualite + watermark + OCR (Rekognition DetectText) + IndexFaces
3. Smart Crop par visage (800px WebP)
4. Auto-linking orphelins (SearchFacesByImage, 85% confiance)
- 16 workers paralleles, ~300ms/photo, ~1000 photos en ~2min

## Versions d'image
- **HD** (path): originale, S3, seulement apres achat
- **Web** (webPath): 1600px, JPEG q80, galerie + IA
- **Thumbnail** (thumbnailPath): 400px watermarke, preview

## Structure principale
```
src/app/
  api/              - REST APIs (auth, events, photos, checkout, admin, webhooks, etc.)
  photographer/     - Dashboard pro (events, upload, photos, packs, analytics, orders)
  organizer/        - Meme que photographer (labels adaptes)
  admin/            - Dashboard admin secret (/focus-mgr-7k9x/)
  account/          - Espace coureur (achats, favoris, RGPD)
  events/[id]/      - Galerie publique + checkout
  marketplace/      - Annonces photographe/organisateur
src/lib/
  auth.ts, ocr.ts, rekognition.ts, s3.ts, storage.ts
  watermark.ts, image-processing.ts, face-clustering.ts
  email.ts, pricing.ts, rate-limit.ts
```

## DB (modeles principaux)
- User, Event, Photo, BibNumber, PhotoFace, StartListEntry
- PricePack, Order, OrderItem
- CreditTransaction, SupportMessage
- MarketplaceListing, MarketplaceApplication, MarketplaceReview
- GdprRequest, GdprAuditLog, ApiKey, PlatformSettings
- Horde, HordeMember, HordeConversation, HordeMessage, Notification

## Stripe
- Payment Element (Apple/Google Pay, SEPA, Card)
- Connect Express (photographe recoit paiements direct)
- Fee: 1 EUR/commande (application_fee_amount: 100)
- Credit Packs: 1000 (19EUR), 5000 (85EUR), 15000 (225EUR)
- Subscriptions: 20000/mois (199EUR), 50000/mois (399EUR)

## Securite
- Admin URL secrete: /focus-mgr-7k9x/
- ProtectedImage (anti-drag, anti-clic-droit)
- Hotlink protection (Caddy Referer)
- Watermarks sur toutes les images publiques
- HD jamais exposees (signed URLs seulement)
- Rate limiting in-memory (60/min events, 30/min search)

## Pages principales
- / : Homepage + carousel events
- /login, /register : Auth
- /events/[id] : Galerie publique + recherche dossard/visage
- /photographer/dashboard : Events, upload, photos, analytics, orders, marketplace
- /admin/dashboard : KPIs, users, events, paiements, messages, RGPD, IA
- /account/* : Profil coureur, achats, favoris, RGPD

## Env vars cles
- DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
- STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
- AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
- AWS_REKOGNITION_COLLECTION_ID, AWS_S3_BUCKET
- RESEND_API_KEY, EMAIL_FROM
- AI_MAX_CONCURRENT=16

## TODO
- [ ] Sync Chrono (donnees course temps reel)
- [ ] Detection emotions
- [ ] Social Teaser (partage reseaux sociaux)
- [ ] QR Code generation
- [ ] Google OAuth
- [ ] Reset password flow

## Deploy
```bash
git push origin master
curl -s -X GET "https://coolify.swipego.app/api/v1/deploy?uuid=ms440oowockwkso0k0c8okgc&force=true" \
  -H "Authorization: Bearer 1|FNcssp3CipkrPNVSQyv3IboYwGsP8sjPskoBG3ux98e5a576"
```
