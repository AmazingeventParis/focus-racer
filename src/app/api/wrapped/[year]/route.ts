import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getWrappedStats } from "@/lib/gamification/wrapped-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const year = parseInt(params.year);
    if (isNaN(year) || year < 2024 || year > new Date().getFullYear()) {
      return NextResponse.json({ error: "Année invalide" }, { status: 400 });
    }

    const stats = await getWrappedStats(session.user.id, year);
    if (!stats) {
      return NextResponse.json({ error: "Pas de données" }, { status: 404 });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching wrapped:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
