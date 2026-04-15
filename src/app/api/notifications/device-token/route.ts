import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { registerDeviceToken, unregisterDeviceToken } from "@/lib/push-notifications";

/**
 * POST /api/notifications/device-token
 * Register a device for push notifications (ntfy subscription).
 * Body: { platform?: "android" | "web" }
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const platform = body.platform || "android";
    const userId = (session.user as { id: string }).id;

    await registerDeviceToken(userId, `fr-${userId}`, platform);

    // Return the ntfy topic and server URL so the client can subscribe
    return NextResponse.json({
      success: true,
      ntfyUrl: process.env.NTFY_URL || "https://ntfy-zg0oggs8sskgc00oogs4gog8.swipego.app",
      topic: `fr-${userId}`,
    });
  } catch (error) {
    console.error("[Device Token] Register error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * DELETE /api/notifications/device-token
 * Unregister device from push notifications.
 */
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const userId = (session.user as { id: string }).id;
    await unregisterDeviceToken(`fr-${userId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Device Token] Unregister error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
