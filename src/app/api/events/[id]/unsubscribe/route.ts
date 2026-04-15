import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${APP_URL}/unsubscribe?status=error`);
  }

  const follower = await prisma.guestEventFollower.findUnique({
    where: { unsubscribeToken: token },
    include: { event: { select: { name: true } } },
  });

  if (!follower || follower.eventId !== params.id) {
    return NextResponse.redirect(`${APP_URL}/unsubscribe?status=not_found`);
  }

  await prisma.guestEventFollower.delete({
    where: { id: follower.id },
  });

  return NextResponse.redirect(
    `${APP_URL}/unsubscribe?status=success&event=${encodeURIComponent(follower.event.name)}`
  );
}
