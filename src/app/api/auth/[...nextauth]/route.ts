import { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { runWithIp } from "@/lib/request-context";

const handler = NextAuth(authOptions);

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}

// Wrap GET and POST to inject client IP into async context
// so the authorize() callback can access it for brute force protection.
// IMPORTANT: must pass the route context (with params.nextauth) through to the handler.
export function GET(req: NextRequest, context: { params: { nextauth: string[] } }) {
  const ip = getClientIp(req);
  return runWithIp(ip, () => handler(req as any, context as any));
}

export function POST(req: NextRequest, context: { params: { nextauth: string[] } }) {
  const ip = getClientIp(req);
  return runWithIp(ip, () => handler(req as any, context as any));
}
