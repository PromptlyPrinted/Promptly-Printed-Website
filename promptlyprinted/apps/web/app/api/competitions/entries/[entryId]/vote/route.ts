import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { COMPETITION_POINTS, awardCompetitionPoints } from '@/lib/gamification';
import { prisma } from '@/lib/prisma';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entry = await prisma.competitionEntry.findUnique({
      where: { id: entryId },
      select: {
        id: true,
        userId: true,
        competitionId: true,
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
        { error: 'Competition is not accepting votes' },
        { status: 400 }
      );
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_entryId: {
          userId,
          entryId: entry.id,
        },
      },
    });

    if (existingVote) {
      await prisma.vote.delete({
        where: { id: existingVote.id },
      });

      await Promise.all([
        awardCompetitionPoints(
          entry.userId,
          -COMPETITION_POINTS.VOTE_RECEIVED,
          'vote_removed',
          'Vote removed from competition entry'
        ),
        awardCompetitionPoints(
          userId,
          -COMPETITION_POINTS.VOTE_GIVEN,
          'vote_given_removed',
          'Removed your vote from a competition entry'
        ),
      ]);

      const voteCount = await prisma.vote.count({
        where: { entryId: entry.id },
      });

      return NextResponse.json({
        voted: false,
        voteCount,
      });
    }

    await prisma.vote.create({
      data: {
        userId,
        entryId: entry.id,
        competitionId: entry.competitionId,
      },
    });

    await Promise.all([
      awardCompetitionPoints(
        entry.userId,
        COMPETITION_POINTS.VOTE_RECEIVED,
        'vote_received',
        'Received a vote on a competition entry'
      ),
      awardCompetitionPoints(
        userId,
        COMPETITION_POINTS.VOTE_GIVEN,
        'vote_given',
        'Voted on a competition entry'
      ),
    ]);

    const voteCount = await prisma.vote.count({
      where: { entryId: entry.id },
    });

    return NextResponse.json({
      voted: true,
      voteCount,
    });
  } catch (error) {
    console.error('Error toggling vote:', error);
    return NextResponse.json(
      { error: 'Failed to update vote' },
      { status: 500 }
    );
  }
}
