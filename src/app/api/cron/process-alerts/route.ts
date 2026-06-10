import { NextRequest, NextResponse } from "next/server";
import { processScheduledAlerts } from "@/lib/gamification/alert-service";

export const maxDuration = 300;

/**
 * Cron endpoint: process smart alerts (purchase reminders, sorting reminders,
 * streak at risk). Same auth pattern as /api/cron/auto-archive.
 * Schedule daily: curl "https://.../api/cron/process-alerts?secret=$CRON_SECRET"
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processScheduledAlerts();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[cron/process-alerts] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
