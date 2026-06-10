import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { s3KeyToPublicPath } from "@/lib/s3";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try auth first, but allow access by order ID for guest success page
    const session = await getServerSession(authOptions);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
          },
        },
        items: {
          include: {
            photo: {
              select: {
                id: true,
                thumbnailPath: true,
                originalName: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    // Access control: owner, admin, or proof of possession (Stripe client secret
    // or Checkout Session id passed by the success page after payment)
    const isOwner = session?.user?.id && order.userId === session.user.id;
    const isAdmin = session?.user?.role === "ADMIN";
    const proof =
      request.nextUrl.searchParams.get("proof") ||
      request.nextUrl.searchParams.get("payment_intent_client_secret");
    const hasProof =
      !!proof &&
      !!order.stripeSessionId &&
      (proof === order.stripeSessionId ||
        proof.startsWith(`${order.stripeSessionId}_secret_`));

    if (!isOwner && !isAdmin && !hasProof) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      photoCount: order.items.length,
      eventName: order.event.name,
      eventId: order.event.id,
      downloadToken: order.status === "PAID" ? order.downloadToken : null,
      downloadExpiresAt: order.downloadExpiresAt,
      downloadCount: order.downloadCount,
      createdAt: order.createdAt,
      photos: order.items.map((item) => ({
        id: item.photo.id,
        thumbnail: item.photo.thumbnailPath ? s3KeyToPublicPath(item.photo.thumbnailPath) : null,
        name: item.photo.originalName,
        unitPrice: item.unitPrice,
      })),
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
