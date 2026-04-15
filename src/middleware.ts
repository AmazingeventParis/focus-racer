import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import {
  checkBotUserAgent,
  checkBrowserHeaders,
  checkScrapingPattern,
} from "@/lib/bot-detection";

const PRO_ROLES = ["PHOTOGRAPHER", "ORGANIZER", "AGENCY", "CLUB", "FEDERATION"];
const ADMIN_SLUG = "focus-mgr-7k9x";

// Paths that skip bot detection entirely
const BOT_DETECTION_SKIP = [
  "/_next/",
  "/favicon",
  "/robots.txt",
  "/sitemap",
  "/api/webhooks/",
  "/api/notifications/stream",
];

function shouldSkipBotDetection(pathname: string): boolean {
  return BOT_DETECTION_SKIP.some((prefix) => pathname.startsWith(prefix));
}

// Routes that require authentication (matched by withAuth)
const AUTH_ROUTES = [
  `//${ADMIN_SLUG}/`,
  "/photographer/",
  "/organizer/",
  "/api/admin/",
  "/account/",
  "/sportif/",
];

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route.replace("//", "/")));
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

/**
 * Run bot detection checks.
 * Returns a 403 response if blocked, null otherwise.
 */
function runBotDetection(req: NextRequest): NextResponse | null {
  const pathname = req.nextUrl.pathname;

  if (shouldSkipBotDetection(pathname)) {
    return null;
  }

  const ua = req.headers.get("user-agent");
  const ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown";
  const isApi = isApiRoute(pathname);

  // 1. Check User-Agent
  const uaCheck = checkBotUserAgent(ua, isApi);
  if (uaCheck.blocked) {
    console.warn(`[Bot] Blocked ${ip} — ${uaCheck.reason} — ${pathname}`);
    return NextResponse.json(
      { error: "Accès refusé" },
      { status: 403 }
    );
  }

  // 2. Check browser headers on page (non-API) requests
  if (!isApi && !pathname.startsWith("/api/")) {
    const headerCheck = checkBrowserHeaders({
      accept: req.headers.get("accept"),
      acceptLanguage: req.headers.get("accept-language"),
      acceptEncoding: req.headers.get("accept-encoding"),
    });
    if (headerCheck.blocked) {
      console.warn(`[Bot] Blocked ${ip} — ${headerCheck.reason} — ${pathname}`);
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }
  }

  // 3. Check scraping patterns on API routes
  if (isApi) {
    const scrapingCheck = checkScrapingPattern(ip, pathname);
    if (scrapingCheck.blocked) {
      console.warn(`[Bot] Blocked ${ip} — ${scrapingCheck.reason}`);
      return NextResponse.json(
        { error: "Trop de requêtes. Veuillez ralentir." },
        { status: 429 }
      );
    }
  }

  return null;
}

// withAuth middleware for protected routes
const authMiddleware = withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as string | undefined;

    // Secret admin slug: ADMIN only
    if (pathname.startsWith(`/${ADMIN_SLUG}`)) {
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Photographer/Pro routes: Pro roles + ADMIN
    if (pathname.startsWith("/photographer") || pathname.startsWith("/organizer")) {
      if (!role || (!PRO_ROLES.includes(role) && role !== "ADMIN")) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Sportif routes: any authenticated user
    if (pathname.startsWith("/sportif")) {
      // Already authenticated via withAuth — no role restriction
    }

    // Admin API routes: ADMIN only
    if (pathname.startsWith("/api/admin")) {
      if (role !== "ADMIN") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // For auth-protected routes, require a token
        if (isAuthRoute(req.nextUrl.pathname)) {
          return !!token;
        }
        // For API routes matched by the expanded matcher,
        // allow through (bot detection already ran; route-level auth handles the rest)
        return true;
      },
    },
  }
);

// Main export: bot detection runs first, then auth middleware
export default async function middleware(req: NextRequest) {
  // Step 1: Bot detection (all matched routes)
  const botResponse = runBotDetection(req);
  if (botResponse) return botResponse;

  // Step 2: Auth middleware (only for protected routes)
  // @ts-expect-error — withAuth returns a compatible handler
  return authMiddleware(req, undefined);
}

export const config = {
  matcher: [
    // Auth-protected routes
    "/focus-mgr-7k9x/:path*",
    "/photographer/:path*",
    "/organizer/:path*",
    "/api/admin/:path*",
    "/account/:path*",
    "/sportif/:path*",
    // API routes for bot detection
    "/api/:path*",
  ],
};
