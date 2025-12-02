import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database';

/**
 * PURCHASE VERIFICATION
 *
 * Automatically called after successful order completion.
 * Links the order to the competition entry and verifies purchase.
 * Awards competition entry if not already entered.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId, designId, competitionId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Verify the order exists and belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
        status: {
          in: ['COMPLETED', 'PROCESSING', 'SHIPPED'], // Valid purchase statuses
        },
      },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or not completed' },
        { status: 404 }
      );
    }

    // Get active competition
    const competition = competitionId
      ? await prisma.competition.findUnique({ where: { id: competitionId } })
      : await prisma.competition.findFirst({
          where: {
            isActive: true,
            endDate: { gte: new Date() },
          },
          orderBy: { startDate: 'desc' },
        });

    if (!competition) {
      return NextResponse.json(
        { error: 'No active competition found' },
        { status: 404 }
      );
    }

    // Check if entry already exists
    let entry = await prisma.competitionEntry.findFirst({
      where: {
        competitionId: competition.id,
        userId: session.user.id,
        designId: designId || undefined,
      },
    });

    if (entry) {
      // Update existing entry with purchase verification
      entry = await prisma.competitionEntry.update({
        where: { id: entry.id },
        data: {
          // @ts-ignore - These fields will be added via migration
          orderId: order.id,
          purchaseVerified: true,
        },
      });
    } else if (designId) {
      // Create new entry with purchase verification
      entry = await prisma.competitionEntry.create({
        data: {
          competitionId: competition.id,
          userId: session.user.id,
          designId,
          // @ts-ignore - These fields will be added via migration
          orderId: order.id,
          purchaseVerified: true,
        },
      });

      // Award entry points
      await awardPoints(
        session.user.id,
        100,
        'competition_entry',
        `Entered ${competition.theme} competition with purchase`,
        order.id
      );
    }

    // Generate unique referral code for this entry (if not exists)
    if (entry) {
      const referralCode = `XMAS-${session.user.id.slice(0, 4)}-${entry.id.slice(0, 6)}`.toUpperCase();

      // @ts-ignore
      if (!entry.referralCode) {
        await prisma.competitionEntry.update({
          where: { id: entry.id },
          data: {
            // @ts-ignore
            referralCode,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      entry,
      message: 'Purchase verified! You are now entered into the competition.',
      // @ts-ignore
      referralCode: entry?.referralCode || `XMAS-${session.user.id.slice(0, 4)}-${entry?.id.slice(0, 6)}`.toUpperCase(),
    });
  } catch (error) {
    console.error('Error verifying purchase:', error);
    return NextResponse.json(
      { error: 'Failed to verify purchase' },
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
      // @ts-ignore - Will be added via migration
      verificationProof: orderId ? `order:${orderId}` : undefined,
    },
  });

  return userPoints;
}
