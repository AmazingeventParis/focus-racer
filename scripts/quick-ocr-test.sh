#!/bin/bash
# Quick OCR provider test

echo "=== TEST PROVIDER OCR ==="
echo ""

if [ -z "$AWS_ACCESS_KEY_ID" ]; then
  echo "❌ AWS_ACCESS_KEY_ID non configuré"
  echo "→ Mode: Tesseract (gratuit, 10-30% détection)"
else
  echo "✅ AWS_ACCESS_KEY_ID configuré: ${AWS_ACCESS_KEY_ID:0:8}..."

  if [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ AWS_SECRET_ACCESS_KEY non configuré"
    echo "→ Mode: Tesseract (gratuit)"
  else
    echo "✅ AWS_SECRET_ACCESS_KEY configuré"
    echo "→ Mode: AWS Rekognition (premium, 85-95% détection)"
  fi
fi

echo ""
echo "AWS_REGION: ${AWS_REGION:-Non configuré}"
echo "AWS_S3_BUCKET: ${AWS_S3_BUCKET:-Non configuré}"
echo "AWS_REKOGNITION_COLLECTION_ID: ${AWS_REKOGNITION_COLLECTION_ID:-Non configuré}"
