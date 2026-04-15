import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 });
    }

    const { searchParams } = new URL(request.url);
    const since = searchParams.get("since");

    const where: any = {
      event: { userId: session.user.id },
      status: { not: "PENDING" },
    };

    if (since) {
      where.createdAt = { gt: new Date(since) };
    }

    const count = await prisma.order.count({ where });
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
