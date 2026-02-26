import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit: 10 requests per minute
  const rateLimited = rateLimit(request, "verify-turnstile", { limit: 10 });
  if (rateLimited) return rateLimited;

  try {
    const { token } = await request.json();

    const ip =
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0].trim();

    const valid = await verifyTurnstileToken(token, ip || undefined);

    if (!valid) {
      return NextResponse.json(
        { error: "Vérification de sécurité échouée. Veuillez réessayer." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Requête invalide" },
      { status: 400 }
    );
  }
}
