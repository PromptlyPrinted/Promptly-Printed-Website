import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database';

/**
 * GET PENDING SOCIAL FOLLOW VERIFICATIONS
 *
 * Admin endpoint to fetch all pending social media follow verification requests.
 * Returns user details, platform, username, screenshot URL, and submission time.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Find all pending social follow verifications
    const pendingVerifications = await prisma.pointHistory.findMany({
      where: {
        action: 'social_follow_pending',
        points: 0, // Pending verifications have 0 points
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Parse verification data from description and verificationProof
    const formattedVerifications = pendingVerifications.map((verification) => {
      // Description format: "Social follow claim pending verification: {platform} - @{username}"
      const descriptionMatch = verification.description?.match(
        /Social follow claim pending verification: (\w+) - @?(.+)/
      );

      const platform = descriptionMatch?.[1] || 'Unknown';
      const username = descriptionMatch?.[2] || 'Unknown';

      // verificationProof may contain screenshot URL or platform:username
      const screenshotUrl =
        verification.verificationProof?.startsWith('http')
          ? verification.verificationProof
          : null;

      return {
        id: verification.id,
        userId: verification.userId,
        userEmail: verification.user.email,
        userName: `${verification.user.firstName || ''} ${verification.user.lastName || ''}`.trim(),
        platform,
        username,
        screenshotUrl,
        submittedAt: verification.createdAt,
      };
    });

    return NextResponse.json({
      verifications: formattedVerifications,
    });
  } catch (error) {
    console.error('Error fetching pending social follows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending verifications' },
      { status: 500 }
    );
  }
}
