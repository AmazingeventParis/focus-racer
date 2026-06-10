import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

/**
 * Vérification d'accès admin au niveau du handler (défense en profondeur).
 * Le middleware protège déjà /api/admin/*, mais chaque handler doit aussi
 * vérifier la session pour ne pas dépendre uniquement du matcher.
 *
 * Usage :
 *   const guard = await requireAdmin();
 *   if (guard) return guard; // 403
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  return null;
}
