import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const API_KEY_PREFIX = "fr_live_";
const API_RATE_LIMIT = { limit: 60, windowMs: 60_000 }; // 60 req/min per key

// ---------------------------------------------------------------------------
// Key generation & hashing
// ---------------------------------------------------------------------------

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

export function generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const random = randomBytes(32).toString("hex"); // 64 hex chars
  const rawKey = `${API_KEY_PREFIX}${random}`;
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = rawKey.slice(0, 16) + "..."; // "fr_live_abcdef01..."
  return { rawKey, keyHash, keyPrefix };
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

interface ApiKeyAuth {
  user: { id: string; credits: number; isActive: boolean };
  apiKey: { id: string; name: string; userId: string };
}

export async function authenticateApiKey(
  request: NextRequest
): Promise<{ auth: ApiKeyAuth } | { error: NextResponse }> {
  // 1. Parse Bearer token
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { error: "Missing or invalid Authorization header", code: "UNAUTHORIZED" },
        { status: 401 }
      ),
    };
  }

  const rawKey = authHeader.slice(7);
  if (!rawKey.startsWith(API_KEY_PREFIX)) {
    return {
      error: NextResponse.json(
        { error: "Invalid API key format", code: "UNAUTHORIZED" },
        { status: 401 }
      ),
    };
  }

  // 2. Lookup by hash
  const keyHash = hashApiKey(rawKey);
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { user: { select: { id: true, credits: true, isActive: true } } },
  });

  if (!apiKey || !apiKey.isActive) {
    return {
      error: NextResponse.json(
        { error: "Invalid or revoked API key", code: "UNAUTHORIZED" },
        { status: 401 }
      ),
    };
  }

  if (!apiKey.user.isActive) {
    return {
      error: NextResponse.json(
        { error: "Account is disabled", code: "FORBIDDEN" },
        { status: 403 }
      ),
    };
  }

  // 3. Rate limit per key
  const rl = checkRateLimit(`api:${apiKey.id}`, API_RATE_LIMIT);
  if (!rl.allowed) {
    return {
      error: NextResponse.json(
        { error: "Rate limit exceeded", code: "RATE_LIMITED", retry_after_ms: rl.resetMs },
        { status: 429 }
      ),
    };
  }

  // 4. Update lastUsedAt (fire-and-forget)
  prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => {});

  return {
    auth: {
      user: apiKey.user,
      apiKey: { id: apiKey.id, name: apiKey.name, userId: apiKey.userId },
    },
  };
}

// ---------------------------------------------------------------------------
// Credit deduction (1 credit per API call)
// ---------------------------------------------------------------------------

export async function deductApiCredit(
  userId: string,
  reason: string
): Promise<{ creditsRemaining: number } | null> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });
      if (!user || user.credits < 1) throw new Error("INSUFFICIENT_CREDITS");

      const balanceBefore = user.credits;
      const balanceAfter = balanceBefore - 1;

      await tx.user.update({ where: { id: userId }, data: { credits: balanceAfter } });
      await tx.creditTransaction.create({
        data: {
          userId,
          type: "DEDUCTION",
          amount: 1,
          balanceBefore,
          balanceAfter,
          reason,
        },
      });

      return { creditsRemaining: balanceAfter };
    });
    return result;
  } catch (err: any) {
    if (err.message === "INSUFFICIENT_CREDITS") return null;
    throw err;
  }
}
