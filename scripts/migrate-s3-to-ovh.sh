#!/usr/bin/env bash
#
# Migration des objets : AWS S3 -> OVH Object Storage (S3-compatible)
# A executer DE PREFERENCE sur le serveur dedie OVH (ecriture locale rapide,
# l'egress AWS n'est paye qu'une seule fois pour la copie initiale).
#
# Prerequis : rclone installe (https://rclone.org/install/)
#   curl https://rclone.org/install.sh | sudo bash
#
# Usage :
#   export AWS_BUCKET=focusracer-1771162064453
#   export AWS_REGION=eu-west-1
#   export AWS_KEY=AKIA...           AWS_SECRET=...
#   export OVH_ENDPOINT=https://s3.gra.io.cloud.ovh.net
#   export OVH_REGION=gra
#   export OVH_BUCKET=focusracer
#   export OVH_KEY=...               OVH_SECRET=...
#   ./scripts/migrate-s3-to-ovh.sh           # copie (incremental, non destructif)
#   ./scripts/migrate-s3-to-ovh.sh --check   # verifie l'integrite apres copie
#
set -euo pipefail

: "${AWS_BUCKET:?AWS_BUCKET requis}"
: "${AWS_KEY:?AWS_KEY requis}"; : "${AWS_SECRET:?AWS_SECRET requis}"
: "${OVH_ENDPOINT:?OVH_ENDPOINT requis}"; : "${OVH_BUCKET:?OVH_BUCKET requis}"
: "${OVH_KEY:?OVH_KEY requis}"; : "${OVH_SECRET:?OVH_SECRET requis}"
AWS_REGION="${AWS_REGION:-eu-west-1}"
OVH_REGION="${OVH_REGION:-gra}"

CONF="$(mktemp)"
trap 'rm -f "$CONF"' EXIT
cat > "$CONF" <<EOF
[aws]
type = s3
provider = AWS
region = ${AWS_REGION}
access_key_id = ${AWS_KEY}
secret_access_key = ${AWS_SECRET}

[ovh]
type = s3
provider = Other
endpoint = ${OVH_ENDPOINT}
region = ${OVH_REGION}
access_key_id = ${OVH_KEY}
secret_access_key = ${OVH_SECRET}
force_path_style = true
acl = private
EOF

COMMON=(--config "$CONF" --transfers 16 --checkers 32 --fast-list --s3-no-check-bucket)

if [[ "${1:-}" == "--check" ]]; then
  echo "== Verification (rclone check, taille+hash) =="
  rclone check "aws:${AWS_BUCKET}" "ovh:${OVH_BUCKET}" "${COMMON[@]}" --one-way
  echo "OK : tous les objets AWS sont presents et identiques sur OVH."
  exit 0
fi

echo "== Copie AWS(${AWS_BUCKET}) -> OVH(${OVH_BUCKET}) =="
echo "Incremental & non destructif (rclone copy : n'efface rien sur OVH)."
rclone copy "aws:${AWS_BUCKET}" "ovh:${OVH_BUCKET}" "${COMMON[@]}" \
  --progress --stats 10s

echo ""
echo "== Termine. Lancez './scripts/migrate-s3-to-ovh.sh --check' pour valider l'integrite. =="
