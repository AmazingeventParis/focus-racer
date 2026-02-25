import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserStreaks } from "@/lib/gamification/streak-service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const streaks = await getUserStreaks(session.user.id);
    return NextResponse.json({ streaks });
  } catch (error) {
    console.error("Error fetching streaks:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
