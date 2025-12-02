import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

/**
 * COMPLETE REFERRAL AFTER PURCHASE
 *
 * This endpoint is called automatically when an order is completed.
 * It checks if the order has a referral code and awards points to the referrer.
 *
 * Call this from your order completion webhook/handler:
 * - Stripe webhook after successful payment
 * - Order status update to COMPLETED
 */

export async function POST(req: NextRequest) {
  try {
    const { orderId, userId, referralCode } = await req.json();

    if (!orderId || !userId) {
      return NextResponse.json(
        { error: 'Order ID and User ID are required' },
        { status: 400 }
      );
    }

    // Verify order is completed
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: {
          in: ['COMPLETED', 'SHIPPED'],
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or not completed' },
        { status: 404 }
      );
    }

    // Extract referral code from order metadata or parameter
    const refCode =
      referralCode ||
      // @ts-ignore
      order.metadata?.referralCode ||
      // @ts-ignore
      order.metadata?.ref;

    if (!refCode) {
      return NextResponse.json({
        success: true,
        message: 'No referral code found',
      });
    }

    // Find referrer's entry
    const referrerEntry = await prisma.competitionEntry.findFirst({
      where: {
        // @ts-ignore
        referralCode: refCode.toUpperCase(),
      },
      include: {
        competition: true,
      },
    });

    if (!referrerEntry) {
      return NextResponse.json({
        success: false,
        error: 'Invalid referral code',
      });
    }

    // Prevent self-referrals
    if (referrerEntry.userId === userId) {
      return NextResponse.json({
        success: false,
        error: 'Cannot refer yourself',
      });
    }

    // Check if referral already completed for this order
    // @ts-ignore
    const existingReferral = await prisma.$queryRaw`
      SELECT * FROM "Referral"
      WHERE "referrerId" = ${referrerEntry.userId}
      AND "orderId" = ${orderId}
      LIMIT 1
    `;

    if (existingReferral && existingReferral.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Referral already processed',
      });
    }

    // Create or update referral record
    // @ts-ignore
    await prisma.$executeRaw`
      INSERT INTO "Referral" ("id", "referrerId", "referredUserId", "orderId", "status", "pointsAwarded", "createdAt", "completedAt")
      VALUES (gen_random_uuid()::text, ${referrerEntry.userId}, ${userId}, ${orderId}, 'completed', 150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("id") DO UPDATE SET
        "status" = 'completed',
        "pointsAwarded" = 150,
        "orderId" = ${orderId},
        "completedAt" = CURRENT_TIMESTAMP
    `;

    // Award points to referrer
    await awardPoints(
      referrerEntry.userId,
      150,
      'referral_completed',
      `Referral purchase completed by user ${userId}`,
      orderId
    );

    // Send notification email to referrer (optional)
    // await sendReferralSuccessEmail(referrerEntry.user.email);

    return NextResponse.json({
      success: true,
      message: 'Referral completed and points awarded',
      referrerId: referrerEntry.userId,
      pointsAwarded: 150,
    });
  } catch (error) {
    console.error('Error completing referral:', error);
    return NextResponse.json(
      { error: 'Failed to complete referral' },
      { status: 500 }
    );
  }
}

// Helper function to award points
async function awardPoints(
  userId: string,
  points: number,
  action: string,
  description?: string,
  orderId?: number
) {
  const userPoints = await prisma.userPoints.upsert({
    where: { userId },
    update: {
      points: { increment: points },
    },
    create: {
      userId,
      points: Math.max(0, points),
    },
  });

  const newLevel = Math.floor(userPoints.points / 500) + 1;
  if (newLevel > userPoints.level) {
    await prisma.userPoints.update({
      where: { userId },
      data: { level: newLevel },
    });
  }

  await prisma.pointHistory.create({
    data: {
      userId,
      points,
      action,
      description,
      // @ts-ignore
      verificationProof: orderId ? `order:${orderId}` : undefined,
    },
  });

  return userPoints;
}
