import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH — update profile
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { name, phone } = body;

  const data: Record<string, unknown> = {};
  if (name && typeof name === "string" && name.trim()) data.name = name.trim();
  if (phone !== undefined) data.phone = phone || null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Aucune donnée à mettre à jour" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true, name: true, phone: true, email: true },
  });

  return NextResponse.json(updated);
}
