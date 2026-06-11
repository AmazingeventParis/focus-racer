import { NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";

/**
 * Returns true if the request carries the expected secret in the
 * `Authorization: Bearer <secret>` header (preferred) or the legacy
 * `x-cron-secret` header. Query-string secrets are intentionally NOT accepted.
 */
export function isAuthorizedCron(request: NextRequest, expected: string | undefined): boolean {
  if (!expected) return false;
  const authHeader = request.headers.get("authorization") || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const provided = bearer || request.headers.get("x-cron-secret") || "";
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false; // timingSafeEqual throws on length mismatch
  return timingSafeEqual(a, b);
}
