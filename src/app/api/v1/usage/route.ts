import { NextRequest, NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-key-auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // Auth
  const authResult = await authenticateApiKey(request);
  if ("error" in authResult) return authResult.error;
  const { user } = authResult.auth;

  // Current month bounds
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Count API deductions this month
  const monthlyUsage = await prisma.creditTransaction.aggregate({
    where: {
      userId: user.id,
      type: "DEDUCTION",
      reason: { contains: "API" },
      createdAt: { gte: periodStart, lte: periodEnd },
    },
    _count: true,
    _sum: { amount: true },
  });

  return NextResponse.json({
    credits_remaining: user.credits,
    usage_this_month: {
      total_calls: monthlyUsage._count,
      credits_used: monthlyUsage._sum.amount || 0,
      period_start: periodStart.toISOString().slice(0, 10),
      period_end: periodEnd.toISOString().slice(0, 10),
    },
  });
}
