import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PRO_ROLES = ["PHOTOGRAPHER", "ORGANIZER", "AGENCY", "CLUB", "FEDERATION"];
const ADMIN_SLUG = "focus-mgr-7k9x";

export default withAuth(
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
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    // Secret admin slug
    "/focus-mgr-7k9x/:path*",
    "/photographer/:path*",
    "/organizer/:path*",
    "/api/admin/:path*",
    "/account/:path*",
  ],
};
