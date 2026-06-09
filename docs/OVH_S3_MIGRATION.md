# Migration du stockage : AWS S3 → OVH Object Storage

Bascule du stockage des photos d'AWS S3 vers **OVH Object Storage (S3-compatible)**.
**Rekognition (OCR + reconnaissance faciale) reste sur AWS** — il ne reçoit que des
*bytes* d'images, jamais de référence à un objet S3, donc le stockage est totalement
découplé de l'IA.

## Pourquoi
- **Coût** : OVH ~0,0119 €/Go/mois + **egress gratuit** + appels API gratuits, vs AWS
  ~0,023 $/Go + 0,09 $/Go d'egress. Pour une plateforme photo (livraison = beaucoup
  d'egress), l'écart est majeur. Supprime aussi l'egress AWS payé aujourd'hui par le
  proxy `/api/uploads` qui télécharge depuis S3 Irlande.
- **Latence** : le compute est déjà chez OVH (serveur dédié). Co-localiser le stockage
  dans la même région (ex. GRA) rapproche stockage et compute (réseau local) au lieu
  d'un aller-retour OVH↔AWS Irlande.

## Ce qui a déjà été préparé dans le code
- `src/lib/ai-config.ts` : bloc `storage` (endpoint, region, bucket, creds, path-style,
  publicBaseUrl) lu depuis `STORAGE_S3_*`, **avec fallback `AWS_*`** (rien ne casse si
  on ne configure rien).
- `src/lib/s3.ts` : le client S3 utilise désormais `endpoint` + `forcePathStyle` quand un
  endpoint custom est défini.
- `src/app/api/photos/search/route.ts` : utilise le client de stockage partagé (plus de
  client AWS en dur).
- Templates `.env` + ce guide + `scripts/migrate-s3-to-ovh.sh` + `scripts/ovh-bucket-cors.json`.

> Tant que `STORAGE_S3_ENDPOINT` est vide, l'app continue d'utiliser AWS S3 exactement
> comme avant. La bascule se fait uniquement en renseignant les variables OVH.

## Variables d'environnement (Coolify)
```
# IA — inchangé, reste sur AWS
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REKOGNITION_COLLECTION_ID=focusracer-faces

# Stockage — bascule vers OVH
STORAGE_S3_ENDPOINT=https://s3.gra.io.cloud.ovh.net
STORAGE_S3_REGION=gra
STORAGE_S3_BUCKET=focusracer
STORAGE_S3_ACCESS_KEY_ID=<cle OVH>
STORAGE_S3_SECRET_ACCESS_KEY=<secret OVH>
STORAGE_S3_FORCE_PATH_STYLE=true
```
> Garder `AWS_S3_BUCKET` renseigné jusqu'à la fin de la migration permet un rollback instantané.

## Procédure pas à pas

### 1. Créer le stockage OVH
1. Espace client OVH → **Public Cloud** → **Object Storage** → créer un conteneur
   **S3-compatible** (« Standard », région **GRA** de préférence — même zone que le serveur dédié).
2. Nom du bucket : `focusracer`.
3. Créer un **utilisateur S3** (Users & Roles → ObjectStore) → récupérer `access_key` / `secret_key`.
4. Noter l'**endpoint** régional (ex. `https://s3.gra.io.cloud.ovh.net`).

### 2. Copier les objets existants (AWS → OVH)
À lancer **sur le serveur dédié OVH** (égress AWS payé une seule fois, écriture locale rapide) :
```bash
curl https://rclone.org/install.sh | sudo bash   # si rclone absent
export AWS_BUCKET=focusracer-1771162064453 AWS_REGION=eu-west-1
export AWS_KEY=AKIA... AWS_SECRET=...
export OVH_ENDPOINT=https://s3.gra.io.cloud.ovh.net OVH_REGION=gra OVH_BUCKET=focusracer
export OVH_KEY=... OVH_SECRET=...
./scripts/migrate-s3-to-ovh.sh           # copie incrémentale, non destructive
./scripts/migrate-s3-to-ovh.sh --check   # vérifie l'intégrité (taille + hash)
```

### 3. Configurer le CORS sur le bucket OVH
```bash
aws s3api put-bucket-cors \
  --endpoint-url https://s3.gra.io.cloud.ovh.net \
  --bucket focusracer \
  --cors-configuration file://scripts/ovh-bucket-cors.json
```

### 4. Bascule
1. Ajouter les variables `STORAGE_S3_*` dans **Coolify** (cf. ci-dessus).
2. Redéployer (`git push` n'est pas nécessaire si le code est déjà en prod — un simple
   redeploy Coolify recharge les variables d'env).
3. La structure des clés est identique (`events/{id}/...`, `platform/watermark.png`),
   donc **aucune migration de base de données** : les champs `path`/`webPath`/`thumbnailPath`
   restent valides tels quels.

### 5. Vérifications post-bascule
- [ ] Une galerie publique affiche bien les miniatures (proxy `/api/uploads`).
- [ ] Upload d'une nouvelle photo (photographe) → OCR/visages OK + miniatures générées.
- [ ] Achat test → téléchargement HD (URL présignée OVH) fonctionne.
- [ ] Recherche par sélfie (`/api/photos/search`) → expansion par visage OK.
- [ ] Watermark admin (`platform/watermark.png`) toujours lisible.

### 6. Nettoyage (après quelques jours de stabilité)
- [ ] Re-lancer une copie incrémentale `migrate-s3-to-ovh.sh` (rattrape les objets créés
      pendant la fenêtre de bascule s'ils ont atterri sur AWS).
- [ ] Vider/supprimer le bucket AWS S3 (garder un export si besoin).
- [ ] Retirer `AWS_S3_BUCKET` / `AWS_CLOUDFRONT_URL` de Coolify (Rekognition garde `AWS_*`).

## Rollback instantané
Supprimer les variables `STORAGE_S3_*` dans Coolify et redéployer → fallback automatique
sur `AWS_*` (le bucket AWS doit encore exister).

## Notes
- **Coût unique de copie** : l'egress AWS du bucket complet est facturé une fois
  (~0,09 $/Go), ex. 300 Go ≈ 27 $.
- **Durabilité** : choisir « Standard » (régional). OVH propose aussi 3-AZ selon région.
- **CDN** (optionnel, pour accélérer la livraison end-user) : brancher un CDN devant le
  bucket et renseigner `STORAGE_PUBLIC_URL` — indépendant de cette migration.
