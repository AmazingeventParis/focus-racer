import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { s3KeyToPublicPath } from "@/lib/s3";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "buyer";
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {};

    if (view === "seller") {
      // Orders on events created by this user (photographer/organizer view)
      where.event = { userId: session.user.id };
      where.status = { not: "PENDING" };
    } else {
      // Orders placed by this user (buyer/sportif view)
      where.userId = session.user.id;
    }

    // Filters
    if (eventId) {
      where.eventId = eventId;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { guestEmail: { contains: search, mode: "insensitive" } },
        { guestName: { contains: search, mode: "insensitive" } },
        { event: { name: { contains: search, mode: "insensitive" } } },
      ];
      // If search is used with seller view, ensure we still filter by event owner
      if (view === "seller") {
        where.AND = [
          { event: { userId: session.user.id } },
          { OR: where.OR },
        ];
        delete where.OR;
        delete where.event;
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, sportifId: true },
        },
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            coverImage: true,
          },
        },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert S3 keys to public paths for frontend
    const mapped = orders.map((order) => ({
      ...order,
      event: {
        ...order.event,
        coverImage: order.event.coverImage ? s3KeyToPublicPath(order.event.coverImage) : null,
      },
    }));

    // If seller view, also return events list for filter dropdown
    if (view === "seller") {
      const events = await prisma.event.findMany({
        where: { userId: session.user.id },
        select: { id: true, name: true, date: true },
        orderBy: { date: "desc" },
      });

      return NextResponse.json({ orders: mapped, events });
    }

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
