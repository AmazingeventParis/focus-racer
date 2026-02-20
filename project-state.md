# Focus Racer - Etat du Projet (mise a jour 2026-02-20)

## Infos
- **URL** : https://focusracer.swipego.app
- **Coolify UUID** : `ms440oowockwkso0k0c8okgc`
- **Repo** : https://github.com/AmazingeventParis/focus-racer
- **Version** : 0.9.12
- **Type** : Plateforme SaaS B2B2C de tri automatique et vente de photos de courses sportives

## Stack
- **Frontend** : Next.js 14.2 (App Router) + React 18 + TypeScript + Tailwind + shadcn/ui
- **Backend** : Next.js API Routes + Prisma 5.22 + PostgreSQL + NextAuth.js
- **IA** : AWS Rekognition (OCR, faces, labels) + Tesseract.js (fallback dev)
- **Storage** : AWS S3 (bucket `focusracer-1771162064453`) — 100% S3, pas de disque local
- **Paiements** : Stripe Connect Express + Payment Element (Apple/Google Pay, SEPA)
- **Emails** : Resend
- **Deploy** : Docker multi-stage + Caddy (auto-SSL) + Coolify

## Espaces utilisateurs
| Espace | URL | Description |
|--------|-----|-------------|
| Pro Photographe | /photographer/ | Upload, evenements, triage, stats, packs, paiements |
| Pro Organisateur | /organizer/ | Copie de photographe avec labels adaptes |
| Public/Coureur | /events/ | Recherche dossard/selfie/nom, achat, telechargement |
| Admin | /focus-mgr-7k9x/ | Dashboard, paiements, RGPD, IA, utilisateurs, messagerie |

## Comptes
- Admin : admin@focusracer.com / Laurytal2
- Photographe : photographe@test.com / photo123
- Coureur : coureur@test.com / runner123
- Orga : orga@test.com / orga123

## Fonctionnalites implementees (Phases 1-7)
- PostgreSQL + multi-roles + RBAC (7 roles)
- Dashboard pro + upload + start-list + triage + watermark + branding + price packs
- Galerie publique + recherche (dossard/nom/selfie) + favoris + viewer + SEO
- Stripe Payment Element + Connect Express (1€ frais service) + panier + ZIP
- Admin complet : users CRUD, messagerie support, evenements, paiements, analytics
- AWS Rekognition OCR + reconnaissance faciale + smart crop + auto-retouch + filtre flou + doublons pHash
- Upload live SSE + compression client + mini-jeu BibRunner
- Marketplace photographes <-> organisateurs
- Connecteurs API (Njuko, KMS, CSV)
- RGPD complet (formulaire, suppression cascade, audit)
- Stripe Checkout pour credits (packs + abonnements)
- FAQ (18 Q&A), Contact API (guest+auth), footer restructure

## Pipeline IA
- 1 credit/photo, 16 workers paralleles
- 3 versions : HD originale + web WebP 1600px + thumbnail watermarkee
- Pre-filtrage AVANT AWS : doublons (pHash) + flou (Laplacian)
- Pipeline parallele : quality + watermark + OCR + faces (Promise.all)
- Smart Crop par visage + Auto-retouch (options photographe)
- Lien automatique orphelines par face recognition (95%+)

## Stripe Connect
- Photographe connecte son Stripe en ~3 min
- Pack 15€ → coureur paie 16€ → plateforme 1€ → photographe ~14.46€
- Webhook : payment_intent.succeeded, account.updated, checkout.session.completed

## Performance
- ~1000 photos en ~2 min (16 workers × pipeline parallele)
- Node.js heap 16GB, UV_THREADPOOL_SIZE=16
- Caddy Brotli + zstd + gzip
- Galerie : pagination cursor 100/page + infinite scroll

## TODO
- [ ] Configurer Stripe webhook sur serveur dedie (STRIPE_WEBHOOK_SECRET)
- [ ] Differencier espace organisateur vs photographe
- [ ] Phase 7 restantes : Sync Chrono, Detection emotions, Social Teaser, QR Codes
- [ ] Brancher detectLabels() ou retirer le flag
