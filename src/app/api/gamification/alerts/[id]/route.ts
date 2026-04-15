import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { markAlertRead } from "@/lib/gamification/alert-service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await markAlertRead(params.id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking alert read:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
