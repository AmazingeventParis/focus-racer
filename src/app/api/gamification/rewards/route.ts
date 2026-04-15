import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserRewards, claimCreditReward } from "@/lib/gamification/credit-reward-service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const rewards = await getUserRewards(session.user.id);
    return NextResponse.json({ rewards });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { actionKey } = await request.json();
    if (!actionKey) {
      return NextResponse.json({ error: "actionKey requis" }, { status: 400 });
    }

    const result = await claimCreditReward(session.user.id, actionKey);
    if (!result) {
      return NextResponse.json({ error: "Récompense déjà réclamée ou invalide" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error claiming reward:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
