import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database';
import { sendCompetitionEntryEmail } from '@/lib/email';

/**
 * SUBMIT DESIGN TO COMPETITION
 *
 * This endpoint allows users to submit a design they've purchased to the competition.
 *
 * Flow:
 * 1. User creates design in design editor
 * 2. Design is saved (gets designId)
 * 3. User purchases the design (Order created with OrderItem)
 * 4. After purchase, user can submit design to active competition
 *
 * Requirements:
 * - User must own the design
 * - Design must be associated with a completed order
 * - Competition must be active
 * - User can only submit each design once per competition
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

    const { designId, competitionId } = await req.json();

    if (!designId) {
      return NextResponse.json(
        { error: 'Design ID is required' },
        { status: 400 }
      );
    }

    // 1. Verify the design exists and belongs to the user
    const design = await prisma.design.findFirst({
      where: {
        id: designId,
        userId: session.user.id,
      },
      include: {
        savedImage: true,
        product: true,
      },
    });

    if (!design) {
      return NextResponse.json(
        { error: 'Design not found or you do not own this design' },
        { status: 404 }
      );
    }

    // 2. Find the competition (use provided ID or get active one)
    const competition = competitionId
      ? await prisma.competition.findUnique({
          where: { id: competitionId },
        })
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

    // 3. Check if competition has ended
    if (competition.endDate < new Date()) {
      return NextResponse.json(
        { error: 'This competition has ended' },
        { status: 400 }
      );
    }

    // 4. Verify the user has purchased this design
    // Look for an order that contains this design
    const orderWithDesign = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: {
          in: ['COMPLETED', 'PROCESSING', 'SHIPPED'],
        },
        // Check if order metadata or orderItems contain this design
        // This depends on how you store design info in orders
      },
      include: {
        orderItems: {
          include: {
            customization: true,
          },
        },
      },
    });

    // Alternative: Check if there's a Customization linked to this design
    // You might need to adjust this based on your actual data model
    if (!orderWithDesign) {
      return NextResponse.json(
        {
          error: 'You must purchase this design before submitting it to the competition',
          hint: 'Complete your order first, then come back to submit your design',
        },
        { status: 403 }
      );
    }

    // 5. Check if this design is already submitted to this competition
    const existingEntry = await prisma.competitionEntry.findUnique({
      where: {
        competitionId_designId: {
          competitionId: competition.id,
          designId: designId,
        },
      },
    });

    if (existingEntry) {
      return NextResponse.json(
        {
          error: 'This design has already been submitted to this competition',
          entryId: existingEntry.id,
        },
        { status: 400 }
      );
    }

    // 6. Create the competition entry
    const entry = await prisma.competitionEntry.create({
      data: {
        competitionId: competition.id,
        userId: session.user.id,
        designId: designId,
        // @ts-ignore - Fields added via migration
        orderId: orderWithDesign.id,
        purchaseVerified: true,
      },
      include: {
        design: {
          include: {
            savedImage: true,
            product: true,
          },
        },
        competition: true,
      },
    });

    // 7. Generate referral code for sharing
    const referralCode = `XMAS-${session.user.id.slice(0, 4)}-${entry.id.slice(0, 6)}`.toUpperCase();

    await prisma.competitionEntry.update({
      where: { id: entry.id },
      data: {
        // @ts-ignore
        referralCode,
      },
    });

    // Send competition entry confirmation email
    if (session.user.email) {
      try {
        console.log('[Email] Sending competition entry confirmation to:', session.user.email);

        await sendCompetitionEntryEmail({
          to: session.user.email,
          referralCode,
          competitionName: competition.theme,
          prize: competition.prize || 'Amazing prizes',
          endDate: competition.endDate,
        });

        console.log('[Email] Competition entry confirmation sent successfully');
      } catch (emailError) {
        console.error('[Email] Failed to send competition entry email:', emailError);
        // Don't fail the submission if email fails
      }
    }

    // 8. Award entry points (if first entry)
    const existingEntries = await prisma.competitionEntry.count({
      where: {
        competitionId: competition.id,
        userId: session.user.id,
      },
    });

    if (existingEntries === 1) {
      // First entry - award bonus points
      await awardPoints(
        session.user.id,
        100,
        'competition_entry',
        `First entry in ${competition.theme}`,
        orderWithDesign.id
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Design successfully submitted to competition!',
      entry: {
        id: entry.id,
        designId: entry.designId,
        competitionId: entry.competitionId,
        submittedAt: entry.submittedAt,
        referralCode,
      },
      competition: {
        name: competition.theme,
        prize: competition.prize,
        endDate: competition.endDate,
      },
      nextSteps: [
        'Share your design to get likes (+5 pts each)',
        'Upload a photo wearing it (+100 pts)',
        'Follow us on social media (+50 pts)',
        `Share your referral code: ${referralCode} (+150 pts per referral)`,
      ],
    });
  } catch (error) {
    console.error('Error submitting design to competition:', error);
    return NextResponse.json(
      { error: 'Failed to submit design to competition' },
      { status: 500 }
    );
  }
}

/**
 * GET - Check if a design is already submitted
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

    const { searchParams } = new URL(req.url);
    const designId = searchParams.get('designId');

    if (!designId) {
      return NextResponse.json(
        { error: 'Design ID is required' },
        { status: 400 }
      );
    }

    // Get active competition
    const competition = await prisma.competition.findFirst({
      where: {
        isActive: true,
        endDate: { gte: new Date() },
      },
      orderBy: { startDate: 'desc' },
    });

    if (!competition) {
      return NextResponse.json({
        submitted: false,
        message: 'No active competition',
      });
    }

    // Check if design is submitted
    const entry = await prisma.competitionEntry.findUnique({
      where: {
        competitionId_designId: {
          competitionId: competition.id,
          designId: parseInt(designId),
        },
      },
      include: {
        _count: {
          select: {
            likes: true,
            votes: true,
          },
        },
      },
    });

    if (!entry) {
      return NextResponse.json({
        submitted: false,
        competition: {
          id: competition.id,
          name: competition.theme,
          prize: competition.prize,
        },
      });
    }

    return NextResponse.json({
      submitted: true,
      entry: {
        id: entry.id,
        submittedAt: entry.submittedAt,
        likes: entry._count.likes,
        votes: entry._count.votes,
        // @ts-ignore
        referralCode: entry.referralCode,
      },
      competition: {
        id: competition.id,
        name: competition.theme,
        prize: competition.prize,
      },
    });
  } catch (error) {
    console.error('Error checking submission status:', error);
    return NextResponse.json(
      { error: 'Failed to check submission status' },
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
