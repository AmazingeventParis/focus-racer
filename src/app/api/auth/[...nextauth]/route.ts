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
// so the authorize() callback can access it for brute force protection
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  return runWithIp(ip, () => handler(req as any, undefined as any));
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  return runWithIp(ip, () => handler(req as any, undefined as any));
}
