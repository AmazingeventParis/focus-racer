import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (guard) return guard;

    const count = await prisma.supportMessage.count({
      where: { status: "OPEN" },
    });

    return NextResponse.json({ count }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
