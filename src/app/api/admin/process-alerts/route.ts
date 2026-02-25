import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processScheduledAlerts } from "@/lib/gamification/alert-service";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const result = await processScheduledAlerts();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing alerts:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
