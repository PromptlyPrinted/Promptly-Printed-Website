import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database';

/**
 * REFERRAL TRACKING SYSTEM
 *
 * HOW IT WORKS:
 * 1. User gets unique referral code after competition entry (e.g., XMAS-ABC1-DEF234)
 * 2. They share: yoursite.com/christmas-2025/quiz?ref=XMAS-ABC1-DEF234
 * 3. Referred user completes purchase
 * 4. Referrer gets 150 points automatically
 *
 * VERIFICATION:
 * - Referral is tracked in Order metadata
 * - When order status = COMPLETED, referrer gets points
 * - Prevents gaming: max 10 referrals per user, same IP checks possible
 */

/**
 * POST - Track a new referral click
 */
export async function POST(req: NextRequest) {
  try {
    const { referralCode, email } = await req.json();

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    // Find the referrer's competition entry by referral code
    const referrerEntry = await prisma.competitionEntry.findFirst({
      where: {
        // @ts-ignore
        referralCode: referralCode.toUpperCase(),
      },
      include: {
        user: true,
        competition: true,
      },
    });

    if (!referrerEntry) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    // Check if competition is still active
    if (
      !referrerEntry.competition.isActive ||
      referrerEntry.competition.endDate < new Date()
    ) {
      return NextResponse.json(
        { error: 'Competition has ended' },
        { status: 400 }
      );
    }

    // Create pending referral record (will be completed when they purchase)
    // Using raw SQL since Referral table will be added via migration
    // @ts-ignore
    const referral = await prisma.$executeRaw`
      INSERT INTO "Referral" ("id", "referrerId", "referredEmail", "status", "createdAt")
      VALUES (gen_random_uuid()::text, ${referrerEntry.userId}, ${email || null}, 'pending', CURRENT_TIMESTAMP)
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      message: 'Referral tracked! Complete your purchase to earn points for your referrer.',
      referrerName: referrerEntry.user.name,
      competition: referrerEntry.competition.theme,
    });
  } catch (error) {
    console.error('Error tracking referral:', error);
    return NextResponse.json(
      { error: 'Failed to track referral' },
      { status: 500 }
    );
  }
}

/**
 * GET - Get user's referral stats
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's referral code
    const entry = await prisma.competitionEntry.findFirst({
      where: {
        userId: session.user.id,
        competition: {
          isActive: true,
          endDate: { gte: new Date() },
        },
      },
    });

    if (!entry) {
      return NextResponse.json({
        hasEntry: false,
        message: 'Complete a purchase to get your referral code',
      });
    }

    // Get referral stats using raw SQL (since Referral table will be added)
    // @ts-ignore
    const referrals = await prisma.$queryRaw`
      SELECT
        COUNT(*)::int as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::int as completed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::int as pending,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN "pointsAwarded" ELSE 0 END)::int, 0) as totalPointsEarned
      FROM "Referral"
      WHERE "referrerId" = ${session.user.id}
    `;

    // @ts-ignore
    const referralCode = entry.referralCode || `XMAS-${session.user.id.slice(0, 4)}-${entry.id.slice(0, 6)}`.toUpperCase();

    // Generate shareable URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://promptlyprinted.com';
    const shareUrls = {
      quiz: `${baseUrl}/christmas-2025/quiz?ref=${referralCode}`,
      landing: `${baseUrl}/christmas-2025?ref=${referralCode}`,
      design: `${baseUrl}/designs?ref=${referralCode}`,
    };

    return NextResponse.json({
      hasEntry: true,
      referralCode,
      shareUrls,
      stats: referrals[0] || {
        total: 0,
        completed: 0,
        pending: 0,
        totalPointsEarned: 0,
      },
      pointsPerReferral: 150,
    });
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return NextResponse.json(
      { error: 'Failed to get referral stats' },
      { status: 500 }
    );
  }
}
