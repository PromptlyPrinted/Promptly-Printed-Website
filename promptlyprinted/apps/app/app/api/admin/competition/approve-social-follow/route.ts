import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database';

/**
 * POST APPROVE/REJECT SOCIAL FOLLOW
 *
 * Admin endpoint to approve or reject a social media follow verification.
 * On approval, awards 50 points to the user.
 * On rejection, deletes the pending verification.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { verificationId, approved, notes } = await req.json();

    if (!verificationId) {
      return NextResponse.json(
        { error: 'Verification ID is required' },
        { status: 400 }
      );
    }

    // Find the pending verification
    const verification = await prisma.pointHistory.findUnique({
      where: { id: verificationId },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    if (verification.action !== 'social_follow_pending') {
      return NextResponse.json(
        { error: 'This is not a pending social follow verification' },
        { status: 400 }
      );
    }

    if (approved) {
      // APPROVE: Update the verification to award 50 points
      await prisma.pointHistory.update({
        where: { id: verificationId },
        data: {
          points: 50,
          action: 'social_follow_verified',
          description: `${verification.description} - APPROVED by admin ${notes ? `(${notes})` : ''}`,
        },
      });

      // Update user's total points
      await prisma.userPoints.upsert({
        where: { userId: verification.userId },
        update: {
          points: { increment: 50 },
        },
        create: {
          userId: verification.userId,
          points: 50,
          level: 1,
        },
      });

      // Update user's level if needed
      const userPoints = await prisma.userPoints.findUnique({
        where: { userId: verification.userId },
      });

      if (userPoints) {
        const newLevel = Math.floor(userPoints.points / 500) + 1;
        if (newLevel > userPoints.level) {
          await prisma.userPoints.update({
            where: { userId: verification.userId },
            data: { level: newLevel },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Social follow verified and 50 points awarded',
        pointsAwarded: 50,
      });
    } else {
      // REJECT: Delete the pending verification
      await prisma.pointHistory.delete({
        where: { id: verificationId },
      });

      return NextResponse.json({
        success: true,
        message: 'Social follow verification rejected and removed',
      });
    }
  } catch (error) {
    console.error('Error approving/rejecting social follow:', error);
    return NextResponse.json(
      { error: 'Failed to process verification' },
      { status: 500 }
    );
  }
}
