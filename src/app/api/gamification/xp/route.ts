import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserXpSummary, getRecentXpEvents } from "@/lib/gamification/xp-service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const [summary, recentXp] = await Promise.all([
      getUserXpSummary(session.user.id),
      getRecentXpEvents(session.user.id, 10),
    ]);

    return NextResponse.json({ ...summary, recentXp });
  } catch (error) {
    console.error("Error fetching XP:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
