import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensureSportifId } from "@/lib/sportif-id";
import { s3KeyToPublicPath } from "@/lib/s3";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;
  const sportifId = await ensureSportifId(userId);

  const [
    favoritesCount,
    ordersData,
    recentFavorites,
    notifications,
    horde,
  ] = await Promise.all([
    // Total events followed
    prisma.eventFavorite.count({ where: { userId } }),

    // Orders stats
    prisma.order.aggregate({
      where: { userId, status: { in: ["PAID", "DELIVERED"] } },
      _count: true,
      _sum: { totalAmount: true },
    }),

    // Recent followed events
    prisma.eventFavorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            location: true,
            sportType: true,
            coverImage: true,
            _count: { select: { photos: true } },
          },
        },
      },
    }),

    // Unread notifications
    prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // Horde preview
    prisma.horde.findUnique({
      where: { ownerId: userId },
      include: {
        members: {
          where: { status: "ACCEPTED" },
          take: 3,
          include: { user: { select: { id: true, name: true, sportifId: true } } },
        },
        _count: { select: { members: { where: { status: "ACCEPTED" } } } },
      },
    }),
  ]);

  // Count purchased photos
  const purchasedPhotos = await prisma.orderItem.count({
    where: { order: { userId, status: { in: ["PAID", "DELIVERED"] } } },
  });

  return NextResponse.json({
    sportifId,
    kpis: {
      courses: favoritesCount,
      photosAchetees: purchasedPhotos,
      totalDepense: ordersData._sum.totalAmount || 0,
      nbCommandes: ordersData._count,
    },
    recentFavorites: recentFavorites.map((f) => ({
      ...f.event,
      coverImage: f.event.coverImage ? s3KeyToPublicPath(f.event.coverImage) : null,
    })),
    notifications,
    horde: horde
      ? {
          name: horde.name,
          membersCount: horde._count.members,
          members: horde.members.map((m) => m.user),
        }
      : null,
  });
}
