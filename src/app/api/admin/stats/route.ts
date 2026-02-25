import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalUsers,
      usersByRole,
      totalEvents,
      publishedEvents,
      totalPhotos,
      totalBibNumbers,
      recentUsers,
      orderStats,
      serviceFeesStats,
      recentOrders,
      monthlyRevenue,
      creditPurchaseRevenueResult,
      creditApiDeductions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ["role"],
        _count: true,
      }),
      prisma.event.count(),
      prisma.event.count({ where: { status: "PUBLISHED" } }),
      prisma.photo.count(),
      prisma.bibNumber.count(),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      // Order/revenue aggregates (PAID + DELIVERED = completed orders)
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "DELIVERED"] } },
        _sum: { totalAmount: true, platformFee: true },
        _count: true,
        _avg: { totalAmount: true },
      }),
      // Service fees (1€/order = platform commission on sales)
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "DELIVERED"] } },
        _sum: { serviceFee: true },
      }),
      // Recent orders
      prisma.order.findMany({
        where: { status: { in: ["PAID", "DELIVERED", "REFUNDED"] } },
        select: {
          id: true,
          totalAmount: true,
          platformFee: true,
          status: true,
          createdAt: true,
          guestEmail: true,
          user: { select: { name: true, email: true } },
          event: { select: { name: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      // Monthly revenue (last 12 months)
      prisma.$queryRaw<{ month: string; revenue: number; orders: number }[]>`
        SELECT
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
          COALESCE(SUM("serviceFee"), 0)::float as revenue,
          COUNT(*)::int as orders
        FROM "Order"
        WHERE status IN ('PAID', 'DELIVERED')
          AND "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
      `,
      // Credit purchase revenue (based on known pack prices)
      prisma.$queryRaw<{ total: number }[]>`
        SELECT COALESCE(SUM(
          CASE
            WHEN "amount" = 1000 THEN 19.0
            WHEN "amount" = 5000 THEN 85.0
            WHEN "amount" = 15000 THEN 225.0
            WHEN "amount" = 20000 THEN 199.0
            WHEN "amount" = 50000 THEN 399.0
            ELSE "amount" * 0.019
          END
        ), 0)::float as total
        FROM "CreditTransaction"
        WHERE "type" = 'PURCHASE'
      `,
      // API credit deductions (for API revenue calc)
      prisma.creditTransaction.aggregate({
        where: { type: "DEDUCTION", reason: { contains: "API" } },
        _sum: { amount: true },
      }),
    ]);

    // Platform CA = service fees + credit purchases + API usage revenue
    const serviceFees = serviceFeesStats._sum.serviceFee || 0;
    const creditPurchaseRevenue = creditPurchaseRevenueResult[0]?.total || 0;
    const totalCreditsPurchased = (await prisma.creditTransaction.aggregate({
      where: { type: "PURCHASE" },
      _sum: { amount: true },
    }))._sum.amount || 1;
    const avgCreditPrice = creditPurchaseRevenue / totalCreditsPurchased;
    const apiRevenue = Math.abs(creditApiDeductions._sum.amount || 0) * avgCreditPrice;
    const platformCA = serviceFees + creditPurchaseRevenue + apiRevenue;

    const roleStats = usersByRole.reduce(
      (acc, item) => {
        acc[item.role] = item._count;
        return acc;
      },
      {} as Record<string, number>
    );

    // Pending orders count
    const pendingOrders = await prisma.order.count({
      where: { status: "PENDING" },
    });

    return NextResponse.json({
      totalUsers,
      roleStats,
      totalEvents,
      publishedEvents,
      totalPhotos,
      totalBibNumbers,
      recentUsers,
      // Revenue data — platformCA = what the platform actually earns
      revenue: {
        totalCA: platformCA,
        serviceFees,
        creditPurchaseRevenue,
        apiRevenue,
        totalOrders: orderStats._count,
        avgOrderValue: orderStats._avg.totalAmount || 0,
        pendingOrders,
      },
      recentOrders,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
