import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { competitionId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const entries = await prisma.competitionEntry.findMany({
      where: { competitionId: params.competitionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
            userPoints: {
              select: {
                points: true,
                level: true,
              },
            },
          },
        },
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
        _count: {
          select: {
            votes: true,
            likes: true,
          },
        },
      },
    });

    // Calculate points: votes * 10 + likes * 5
    const leaderboard = entries
      .map((entry, index) => {
        const competitionPoints = entry._count.votes * 10 + entry._count.likes * 5;
        return {
          rank: index + 1,
          userId: entry.user.id,
          username: entry.user.name || entry.user.username || 'Anonymous',
          avatar: entry.user.image,
          designId: entry.design.id.toString(),
          designName: entry.design.name,
          designImage: entry.design.savedImage.url,
          votes: entry._count.votes,
          likes: entry._count.likes,
          points: competitionPoints,
          totalPoints: entry.user.userPoints?.points || 0,
          level: entry.user.userPoints?.level || 1,
          badge:
            index === 0 ? ('gold' as const) :
            index === 1 ? ('silver' as const) :
            index === 2 ? ('bronze' as const) :
            null,
        };
      })
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({...entry, rank: index + 1}))
      .slice(0, limit);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
