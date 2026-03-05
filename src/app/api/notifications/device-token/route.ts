import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { registerDeviceToken, unregisterDeviceToken } from "@/lib/push-notifications";

/**
 * POST /api/notifications/device-token
 * Register a device token for push notifications.
 * Body: { token: string, platform?: "android" | "web" }
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const { token, platform } = await request.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token requis" }, { status: 400 });
    }

    await registerDeviceToken(
      (session.user as { id: string }).id,
      token,
      platform || "android"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Device Token] Register error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * DELETE /api/notifications/device-token
 * Unregister a device token.
 * Body: { token: string }
 */
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const { token } = await request.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token requis" }, { status: 400 });
    }

    await unregisterDeviceToken(token);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Device Token] Unregister error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
