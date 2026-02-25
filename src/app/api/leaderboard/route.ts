import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLeaderboard, getCategoriesForRole } from "@/lib/gamification/leaderboard-service";
import { LeaderboardPeriod, UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") || "WEEKLY") as LeaderboardPeriod;
    const category = searchParams.get("category") || "xp";
    const role = searchParams.get("role") as UserRole | null;

    const result = await getLeaderboard({
      period,
      category,
      role: role || undefined,
      currentUserId: session.user.id,
    });

    const categories = getCategoriesForRole(
      (role || (session.user as { role?: string }).role || "RUNNER") as UserRole
    );

    return NextResponse.json({ ...result, categories });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
