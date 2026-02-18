import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await prisma.supportMessage.updateMany({
      where: {
        userId: session.user.id,
        adminReply: { not: null },
        readByUser: false,
      },
      data: { readByUser: true },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
