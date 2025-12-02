import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database';

/**
 * Admin Marketing Analytics API
 *
 * Returns comprehensive marketing performance data:
 * - Designs created by UTM source/medium/campaign
 * - Orders and revenue by marketing channel
 * - Conversion rates
 * - Competition entries by source
 * - Time-based trends
 *
 * Access: Admin users only
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check admin authorization
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Default to last 30 days if no date range provided
    const dateFilter = {
      gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      ...(endDate && { lte: new Date(endDate) }),
    };

    // 1. Designs created by marketing source
    const designsBySource = await prisma.$queryRaw<
      Array<{
        utm_source: string | null;
        utm_medium: string | null;
        utm_campaign: string | null;
        design_count: bigint;
        unique_users: bigint;
      }>
    >`
      SELECT
        "utm_source",
        "utm_medium",
        "utm_campaign",
        COUNT(*) as design_count,
        COUNT(DISTINCT "userId") as unique_users
      FROM "SavedImage"
      WHERE "createdAt" >= ${dateFilter.gte}
        ${endDate ? `AND "createdAt" <= ${dateFilter.lte}` : ''}
        AND ("utm_source" IS NOT NULL OR "utm_medium" IS NOT NULL)
      GROUP BY "utm_source", "utm_medium", "utm_campaign"
      ORDER BY design_count DESC
    `;

    // 2. Orders and revenue by source (linking through SavedImage)
    const revenueBySource = await prisma.$queryRaw<
      Array<{
        utm_source: string | null;
        utm_medium: string | null;
        order_count: bigint;
        total_revenue: number;
        avg_order_value: number;
      }>
    >`
      SELECT
        si."utm_source",
        si."utm_medium",
        COUNT(DISTINCT o."id") as order_count,
        SUM(o."totalPrice") as total_revenue,
        AVG(o."totalPrice") as avg_order_value
      FROM "Order" o
      JOIN "OrderItem" oi ON o."id" = oi."orderId"
      JOIN "Design" d ON (oi."attributes"->>'designUrl') LIKE ('%' || d."imageUrl" || '%')
      JOIN "SavedImage" si ON d."savedImageId" = si."id"
      WHERE o."status" IN ('COMPLETED', 'PROCESSING', 'SHIPPED')
        AND o."createdAt" >= ${dateFilter.gte}
        ${endDate ? `AND o."createdAt" <= ${dateFilter.lte}` : ''}
        AND si."utm_source" IS NOT NULL
      GROUP BY si."utm_source", si."utm_medium"
      ORDER BY total_revenue DESC
    `;

    // 3. Competition entries by source
    const competitionBySource = await prisma.$queryRaw<
      Array<{
        utm_source: string | null;
        entry_count: bigint;
        verified_purchases: bigint;
      }>
    >`
      SELECT
        si."utm_source",
        COUNT(ce."id") as entry_count,
        COUNT(CASE WHEN ce."purchaseVerified" = true THEN 1 END) as verified_purchases
      FROM "CompetitionEntry" ce
      JOIN "Design" d ON ce."designId" = d."id"
      JOIN "SavedImage" si ON d."savedImageId" = si."id"
      WHERE ce."submittedAt" >= ${dateFilter.gte}
        ${endDate ? `AND ce."submittedAt" <= ${dateFilter.lte}` : ''}
        AND si."utm_source" IS NOT NULL
      GROUP BY si."utm_source"
      ORDER BY entry_count DESC
    `;

    // 4. Overall stats
    const totalDesigns = await prisma.savedImage.count({
      where: {
        createdAt: dateFilter,
        OR: [
          { utm_source: { not: null } },
          { utm_medium: { not: null } },
        ],
      },
    });

    const totalOrders = await prisma.order.count({
      where: {
        createdAt: dateFilter,
        status: { in: ['COMPLETED', 'PROCESSING', 'SHIPPED'] },
      },
    });

    const totalRevenue = await prisma.order.aggregate({
      where: {
        createdAt: dateFilter,
        status: { in: ['COMPLETED', 'PROCESSING', 'SHIPPED'] },
      },
      _sum: {
        totalPrice: true,
      },
    });

    // 5. Daily trends (last 30 days)
    const dailyTrends = await prisma.$queryRaw<
      Array<{
        date: Date;
        designs: bigint;
        orders: bigint;
        revenue: number;
      }>
    >`
      SELECT
        DATE("createdAt") as date,
        COUNT(DISTINCT si."id") as designs,
        COUNT(DISTINCT o."id") as orders,
        COALESCE(SUM(o."totalPrice"), 0) as revenue
      FROM "SavedImage" si
      LEFT JOIN "Design" d ON si."id" = d."savedImageId"
      LEFT JOIN "OrderItem" oi ON (oi."attributes"->>'designUrl') LIKE ('%' || d."imageUrl" || '%')
      LEFT JOIN "Order" o ON oi."orderId" = o."id" AND o."status" IN ('COMPLETED', 'PROCESSING', 'SHIPPED')
      WHERE si."createdAt" >= ${dateFilter.gte}
        ${endDate ? `AND si."createdAt" <= ${dateFilter.lte}` : ''}
        AND si."utm_source" IS NOT NULL
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
      LIMIT 30
    `;

    // Convert BigInt to Number for JSON serialization
    const formatData = (data: any[]) =>
      data.map((item) => ({
        ...item,
        design_count: item.design_count ? Number(item.design_count) : undefined,
        unique_users: item.unique_users ? Number(item.unique_users) : undefined,
        order_count: item.order_count ? Number(item.order_count) : undefined,
        entry_count: item.entry_count ? Number(item.entry_count) : undefined,
        verified_purchases: item.verified_purchases ? Number(item.verified_purchases) : undefined,
        designs: item.designs ? Number(item.designs) : undefined,
        orders: item.orders ? Number(item.orders) : undefined,
      }));

    return NextResponse.json({
      period: {
        start: dateFilter.gte,
        end: endDate ? dateFilter.lte : new Date(),
      },
      overview: {
        totalDesigns,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        avgOrderValue: totalOrders > 0 ? (totalRevenue._sum.totalPrice || 0) / totalOrders : 0,
        conversionRate: totalDesigns > 0 ? (totalOrders / totalDesigns) * 100 : 0,
      },
      designsBySource: formatData(designsBySource),
      revenueBySource: formatData(revenueBySource),
      competitionBySource: formatData(competitionBySource),
      dailyTrends: formatData(dailyTrends),
    });
  } catch (error: any) {
    console.error('[Admin Analytics] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', details: error.message },
      { status: 500 }
    );
  }
}
