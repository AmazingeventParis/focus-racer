import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Revoke (soft delete) an API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;

  const apiKey = await prisma.apiKey.findUnique({
    where: { id },
    select: { userId: true, isActive: true },
  });

  if (!apiKey || apiKey.userId !== session.user.id) {
    return NextResponse.json({ error: "Cle introuvable" }, { status: 404 });
  }

  if (!apiKey.isActive) {
    return NextResponse.json({ error: "Cle deja revoquee" }, { status: 400 });
  }

  await prisma.apiKey.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
