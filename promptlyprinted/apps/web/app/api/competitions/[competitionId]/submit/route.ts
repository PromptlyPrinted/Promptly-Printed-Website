import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { awardCompetitionPoints, COMPETITION_POINTS } from '@/lib/gamification';

export async function POST(
  request: NextRequest,
  { params }: { params: { competitionId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { designId } = await request.json();

    if (!designId) {
      return NextResponse.json(
        { error: 'Design ID is required' },
        { status: 400 }
      );
    }

    // Check if competition exists and is active
    const competition = await prisma.competition.findUnique({
      where: { id: params.competitionId },
    });

    if (!competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      );
    }

    if (!competition.isActive || competition.endDate < new Date()) {
      return NextResponse.json(
        { error: 'Competition is not active' },
        { status: 400 }
      );
    }

    // Check if design exists and belongs to user
    const design = await prisma.design.findUnique({
      where: { id: BigInt(designId) },
    });

    if (!design) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      );
    }

    if (design.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only submit your own designs' },
        { status: 403 }
      );
    }

    // Check if already submitted
    const existingEntry = await prisma.competitionEntry.findUnique({
      where: {
        competitionId_designId: {
          competitionId: params.competitionId,
          designId: BigInt(designId),
        },
      },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Design already submitted to this competition' },
        { status: 400 }
      );
    }

    // Create competition entry
    const entry = await prisma.competitionEntry.create({
      data: {
        competitionId: params.competitionId,
        userId: session.user.id,
        designId: BigInt(designId),
      },
      include: {
        design: {
          select: {
            id: true,
            name: true,
            savedImage: {
              select: {
                url: true,
              },
            },
          },
        },
        competition: {
          select: {
            id: true,
            theme: true,
            themeIcon: true,
          },
        },
      },
    });

    // Award points for competition entry
    await awardCompetitionPoints(
      session.user.id,
      COMPETITION_POINTS.COMPETITION_ENTRY,
      'competition_entry',
      `Submitted design to ${competition.theme} competition`
    );

    // Check if this is user's first competition entry
    const userEntryCount = await prisma.competitionEntry.count({
      where: { userId: session.user.id },
    });

    if (userEntryCount === 1) {
      await awardCompetitionPoints(
        session.user.id,
        COMPETITION_POINTS.FIRST_COMPETITION,
        'first_competition',
        'First competition entry!'
      );
    }

    return NextResponse.json({
      ...entry,
      designId: entry.designId.toString(),
    });
  } catch (error) {
    console.error('Error submitting to competition:', error);
    return NextResponse.json(
      { error: 'Failed to submit design to competition' },
      { status: 500 }
    );
  }
}
