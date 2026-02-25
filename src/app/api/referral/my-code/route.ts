import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getReferralCode } from "@/lib/gamification/referral-service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const code = await getReferralCode(session.user.id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return NextResponse.json({
      code,
      shareUrl: `${appUrl}/register?ref=${code}`,
    });
  } catch (error) {
    console.error("Error getting referral code:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
