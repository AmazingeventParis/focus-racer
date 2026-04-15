import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { trackReferral } from "@/lib/gamification/referral-service";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { referralCode } = await request.json();
    if (!referralCode) {
      return NextResponse.json({ error: "Code requis" }, { status: 400 });
    }

    const tracked = await trackReferral(referralCode, session.user.id);
    return NextResponse.json({ tracked });
  } catch (error) {
    console.error("Error tracking referral:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
