import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const requests = await prisma.gdprRequest.findMany({
      where: status ? { status: status as "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED" } : undefined,
      include: {
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Enrich with sportifId via email lookup
    const emails = [...new Set(requests.map((r) => r.email))];
    const users = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true, sportifId: true },
    });
    const emailToSportifId = new Map(users.map((u) => [u.email, u.sportifId]));

    const enriched = requests.map((r) => ({
      ...r,
      sportifId: emailToSportifId.get(r.email) || null,
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("GDPR list error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
