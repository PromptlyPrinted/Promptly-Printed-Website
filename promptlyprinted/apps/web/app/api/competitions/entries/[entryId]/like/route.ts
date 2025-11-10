import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { COMPETITION_POINTS, awardCompetitionPoints } from '@/lib/gamification';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entry = await prisma.competitionEntry.findUnique({
      where: { id: entryId },
      select: {
        id: true,
        userId: true,
        competition: {
          select: {
            isActive: true,
            endDate: true,
          },
        },
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const now = new Date();
    if (!entry.competition.isActive || entry.competition.endDate < now) {
      return NextResponse.json(
        { error: 'Competition is not accepting likes' },
        { status: 400 }
      );
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_entryId: {
          userId,
          entryId: entry.id,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      await Promise.all([
        awardCompetitionPoints(
          entry.userId,
          -COMPETITION_POINTS.LIKE_RECEIVED,
          'like_removed',
          'Like removed from competition entry'
        ),
        awardCompetitionPoints(
          userId,
          -COMPETITION_POINTS.LIKE_GIVEN,
          'like_given_removed',
          'Removed your like from a competition entry'
        ),
      ]);

      const likeCount = await prisma.like.count({
        where: { entryId: entry.id },
      });

      return NextResponse.json({
        liked: false,
        likeCount,
      });
    }

    await prisma.like.create({
      data: {
        userId,
        entryId: entry.id,
      },
    });

    await Promise.all([
      awardCompetitionPoints(
        entry.userId,
        COMPETITION_POINTS.LIKE_RECEIVED,
        'like_received',
        'Received a like on a competition entry'
      ),
      awardCompetitionPoints(
        userId,
        COMPETITION_POINTS.LIKE_GIVEN,
        'like_given',
        'Liked a competition entry'
      ),
    ]);

    const likeCount = await prisma.like.count({
      where: { entryId: entry.id },
    });

    return NextResponse.json({
      liked: true,
      likeCount,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to update like' },
      { status: 500 }
    );
  }
}
