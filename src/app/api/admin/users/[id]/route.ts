import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        company: true,
        isActive: true,
        credits: true,
        stripeAccountId: true,
        stripeOnboarded: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            events: true,
            orders: true,
            creditTransactions: true,
            supportMessages: true,
          },
        },
        events: {
          select: {
            id: true,
            name: true,
            date: true,
            _count: { select: { photos: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouve" },
        { status: 404 }
      );
    }

    // Calculate total revenue from paid orders associated with this user's events
    const revenueResult = await prisma.order.aggregate({
      where: {
        event: { userId: id },
        status: "PAID",
      },
      _sum: { totalAmount: true },
    });

    // Calculate total photos across all events
    const photosResult = await prisma.photo.count({
      where: {
        event: { userId: id },
      },
    });

    // Count orders placed by this user (as buyer)
    const buyerOrdersResult = await prisma.order.aggregate({
      where: {
        userId: id,
        status: "PAID",
      },
      _sum: { totalAmount: true },
      _count: true,
    });

    return NextResponse.json({
      ...user,
      totalRevenue: revenueResult._sum.totalAmount || 0,
      totalPhotos: photosResult,
      buyerOrdersCount: buyerOrdersResult._count || 0,
      buyerTotalSpent: buyerOrdersResult._sum.totalAmount || 0,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation de l'utilisateur" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;
    if (body.role) data.role = body.role;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise a jour" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deactivating user:", error);
    return NextResponse.json(
      { error: "Erreur lors de la desactivation" },
      { status: 500 }
    );
  }
}
