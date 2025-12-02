import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database';

/**
 * SOCIAL MEDIA FOLLOW VERIFICATION
 *
 * There are multiple approaches to verify social media follows:
 *
 * OPTION 1 (MANUAL - RECOMMENDED FOR MVP):
 * - User enters their username
 * - Admin manually verifies they follow
 * - Admin approves via dashboard
 *
 * OPTION 2 (SCREENSHOT):
 * - User uploads screenshot of them following
 * - Admin reviews screenshot
 * - Admin approves/rejects
 *
 * OPTION 3 (API - BEST BUT COMPLEX):
 * - Use Instagram/Facebook/Twitter API
 * - Requires OAuth flow
 * - Check if user follows your account
 *
 * This implementation uses OPTION 1 (Manual with screenshot proof)
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

    const formData = await req.formData();
    const platform = formData.get('platform') as string; // 'instagram', 'facebook', 'twitter', 'tiktok'
    const username = formData.get('username') as string;
    const screenshot = formData.get('screenshot') as File | null;

    if (!platform || !username) {
      return NextResponse.json(
        { error: 'Platform and username are required' },
        { status: 400 }
      );
    }

    // Get user's competition entry
    const entry = await prisma.competitionEntry.findFirst({
      where: {
        userId: session.user.id,
        competition: {
          isActive: true,
          endDate: { gte: new Date() },
        },
      },
      include: {
        competition: true,
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'No active competition entry found. Complete a purchase first.' },
        { status: 404 }
      );
    }

    // Upload screenshot if provided
    let screenshotUrl: string | undefined;
    if (screenshot) {
      const { S3StorageProvider } = await import('@/lib/storage/s3');
      const storage = new S3StorageProvider();

      const arrayBuffer = await screenshot.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const filename = `social-verification/${entry.competitionId}/${session.user.id}-${platform}-${Date.now()}.jpg`;
      screenshotUrl = await storage.uploadFromBuffer(
        buffer,
        filename,
        screenshot.type || 'image/jpeg',
        { skipUuid: true }
      );
    }

    // Update competition entry with social info (pending verification)
    await prisma.competitionEntry.update({
      where: { id: entry.id },
      data: {
        // @ts-ignore
        socialPlatform: platform,
        socialUsername: username,
        socialFollowVerified: false, // Admin needs to verify
      },
    });

    // Create point history record (pending - will be awarded after admin approval)
    await prisma.pointHistory.create({
      data: {
        userId: session.user.id,
        points: 0, // Not awarded yet
        action: 'social_follow_pending',
        description: `Social follow claim pending verification: ${platform} - @${username}`,
        // @ts-ignore
        verificationProof: screenshotUrl || `${platform}:${username}`,
      },
    });

    return NextResponse.json({
      success: true,
      verified: false,
      pending: true,
      message: `Social follow claim submitted! We'll verify @${username} on ${platform} and award 50 points within 24-48 hours.`,
      platform,
      username,
      screenshotUrl,
    });
  } catch (error) {
    console.error('Error verifying social follow:', error);
    return NextResponse.json(
      { error: 'Failed to verify social follow' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for checking verification status
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
        verified: false,
        message: 'No active competition entry',
      });
    }

    return NextResponse.json({
      // @ts-ignore
      verified: entry.socialFollowVerified || false,
      // @ts-ignore
      platform: entry.socialPlatform,
      // @ts-ignore
      username: entry.socialUsername,
    });
  } catch (error) {
    console.error('Error checking social verification:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
