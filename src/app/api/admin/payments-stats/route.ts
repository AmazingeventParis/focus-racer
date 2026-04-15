import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      dateFilter.lte = toDate;
    }
    const whereDate: Record<string, unknown> = {};
    if (from || to) whereDate.createdAt = dateFilter;

    const [totalRevenue, totalOrders, refundedOrders, monthlyRevenue, packBreakdown, topEvents, connectStats, feeStats, creditPackPurchases, creditSubPurchases, creditImportDeductions, creditApiDeductions, creditAdminGrants, creditNetCirculation, packRevenueResult, subRevenueResult] =
      await Promise.all([
        // Total revenue from paid orders (with optional date filter)
        prisma.order.aggregate({
          where: { ...whereDate, status: "PAID" },
          _sum: { totalAmount: true },
          _count: true,
          _avg: { totalAmount: true },
        }),
        // Total orders count (all statuses, with optional date filter)
        prisma.order.count({ where: whereDate }),
        // Refunded orders count
        prisma.order.count({ where: { ...whereDate, status: "REFUNDED" } }),
        // Monthly platform revenue (service fees only, last 6 months)
        prisma.$queryRaw<
          { month: string; revenue: number; orders: number }[]
        >`
        SELECT
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
          COALESCE(SUM("serviceFee"), 0)::float as revenue,
          COUNT(*)::int as orders
        FROM "Order"
        WHERE "status" = 'PAID'
          AND "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month ASC
      `,
        // Revenue by pack type
        prisma.$queryRaw<
          { pack_type: string | null; revenue: number; orders: number }[]
        >`
        SELECT
          pp."type" as pack_type,
          COALESCE(SUM(o."totalAmount"), 0)::float as revenue,
          COUNT(*)::int as orders
        FROM "Order" o
        LEFT JOIN "PricePack" pp ON o."packId" = pp."id"
        WHERE o."status" = 'PAID'
        GROUP BY pp."type"
        ORDER BY revenue DESC
      `,
        // Top 5 events by revenue
        prisma.$queryRaw<
          {
            id: string;
            name: string;
            date: Date;
            revenue: number;
            orders: number;
          }[]
        >`
        SELECT
          e."id", e."name", e."date",
          COALESCE(SUM(o."totalAmount"), 0)::float as revenue,
          COUNT(o.*)::int as orders
        FROM "Order" o
        JOIN "Event" e ON o."eventId" = e."id"
        WHERE o."status" = 'PAID'
        GROUP BY e."id", e."name", e."date"
        ORDER BY revenue DESC
        LIMIT 5
      `,
        // Connect accounts stats
        prisma.$queryRaw<{ onboarded: boolean; count: number }[]>`
        SELECT "stripeOnboarded" as onboarded, COUNT(*)::int as count
        FROM "User"
        WHERE "role" IN ('PHOTOGRAPHER', 'ORGANIZER', 'AGENCY')
        GROUP BY "stripeOnboarded"
      `,
        // Service fees + stripe fees + photographer payouts
        prisma.order.aggregate({
          where: { ...whereDate, status: "PAID" },
          _sum: { serviceFee: true, stripeFee: true, photographerPayout: true },
        }),
        // Credit PACK purchases (1000, 5000, 15000 = one-time packs)
        prisma.creditTransaction.aggregate({
          where: { type: "PURCHASE", amount: { in: [1000, 5000, 15000] }, ...whereDate },
          _sum: { amount: true },
          _count: true,
        }),
        // Credit SUBSCRIPTION purchases (20000, 50000 = monthly subscriptions)
        prisma.creditTransaction.aggregate({
          where: { type: "PURCHASE", amount: { in: [20000, 50000] }, ...whereDate },
          _sum: { amount: true },
          _count: true,
        }),
        // Credit deductions (import photos, not API, with date filter)
        prisma.creditTransaction.aggregate({
          where: { type: "DEDUCTION", NOT: { reason: { contains: "API" } }, ...whereDate },
          _sum: { amount: true },
          _count: true,
        }),
        // Credit deductions (API, with date filter)
        prisma.creditTransaction.aggregate({
          where: { type: "DEDUCTION", reason: { contains: "API" }, ...whereDate },
          _sum: { amount: true },
          _count: true,
        }),
        // Credit admin grants (with date filter)
        prisma.creditTransaction.aggregate({
          where: { type: "ADMIN_GRANT", ...whereDate },
          _sum: { amount: true },
          _count: true,
        }),
        // Credits in circulation = net sum of ALL transactions (purchases positive, deductions negative)
        prisma.$queryRaw<{ net: number }[]>`
          SELECT COALESCE(SUM("amount"), 0)::int as net
          FROM "CreditTransaction"
        `,
        // Revenue from credit PACKS (one-time)
        prisma.$queryRaw<{ total: number }[]>`
          SELECT COALESCE(SUM(
            CASE
              WHEN "amount" = 1000 THEN 19.0
              WHEN "amount" = 5000 THEN 85.0
              WHEN "amount" = 15000 THEN 225.0
              ELSE "amount" * 0.019
            END
          ), 0)::float as total
          FROM "CreditTransaction"
          WHERE "type" = 'PURCHASE' AND "amount" IN (1000, 5000, 15000)
        `,
        // Revenue from credit SUBSCRIPTIONS (monthly)
        prisma.$queryRaw<{ total: number }[]>`
          SELECT COALESCE(SUM(
            CASE
              WHEN "amount" = 20000 THEN 199.0
              WHEN "amount" = 50000 THEN 399.0
              ELSE "amount" * 0.019
            END
          ), 0)::float as total
          FROM "CreditTransaction"
          WHERE "type" = 'PURCHASE' AND "amount" IN (20000, 50000)
        `,
      ]);

    // Parse connect stats
    const onboardedCount = connectStats.find((c) => c.onboarded)?.count || 0;
    const notOnboardedCount = connectStats.find((c) => !c.onboarded)?.count || 0;

    // Revenue breakdown
    const serviceFees = feeStats._sum.serviceFee || 0;
    const packRevenue = packRevenueResult[0]?.total || 0;
    const subRevenue = subRevenueResult[0]?.total || 0;
    const creditPurchaseRevenue = packRevenue + subRevenue;
    const totalCreditsPurchased = (creditPackPurchases._sum.amount || 0) + (creditSubPurchases._sum.amount || 0) || 1;
    const avgCreditPrice = totalCreditsPurchased > 0 ? creditPurchaseRevenue / totalCreditsPurchased : 0.019;
    const apiRevenue = Math.abs(creditApiDeductions._sum.amount || 0) * avgCreditPrice;
    const platformCA = serviceFees + creditPurchaseRevenue + apiRevenue;

    return NextResponse.json({
      revenue: {
        total: totalRevenue._sum.totalAmount || 0,
        platformCA,
        avgBasket: totalRevenue._avg.totalAmount || 0,
        paidOrders: totalRevenue._count,
      },
      totalOrders,
      refundedOrders,
      refundRate:
        totalOrders > 0
          ? ((refundedOrders / totalOrders) * 100).toFixed(1)
          : "0.0",
      monthlyRevenue,
      packBreakdown,
      topEvents,
      connect: {
        totalServiceFees: feeStats._sum.serviceFee || 0,
        totalStripeFees: feeStats._sum.stripeFee || 0,
        totalPhotographerPayouts: feeStats._sum.photographerPayout || 0,
        onboardedAccounts: onboardedCount,
        totalAccounts: onboardedCount + notOnboardedCount,
      },
      credits: {
        inCirculation: creditNetCirculation[0]?.net || 0,
        purchaseRevenue: creditPurchaseRevenue,
        packPurchases: {
          total: creditPackPurchases._sum.amount || 0,
          count: creditPackPurchases._count,
          revenue: packRevenue,
        },
        subPurchases: {
          total: creditSubPurchases._sum.amount || 0,
          count: creditSubPurchases._count,
          revenue: subRevenue,
        },
        purchases: {
          total: (creditPackPurchases._sum.amount || 0) + (creditSubPurchases._sum.amount || 0),
          count: creditPackPurchases._count + creditSubPurchases._count,
        },
        importDeductions: {
          total: creditImportDeductions._sum.amount || 0,
          count: creditImportDeductions._count,
        },
        apiDeductions: {
          total: creditApiDeductions._sum.amount || 0,
          count: creditApiDeductions._count,
        },
        adminGrants: {
          total: creditAdminGrants._sum.amount || 0,
          count: creditAdminGrants._count,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
