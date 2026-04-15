import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
