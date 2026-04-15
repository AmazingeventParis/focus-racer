#!/usr/bin/env bash
# Render.com build script for Focus Racer
set -o errexit

# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build Next.js
npm run build
