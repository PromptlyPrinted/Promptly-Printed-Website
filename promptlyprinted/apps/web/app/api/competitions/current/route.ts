import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const competition = await prisma.competition.findFirst({
      where: {
        isActive: true,
        endDate: { gte: new Date() },
      },
      orderBy: { startDate: 'desc' },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });

    if (!competition) {
      return NextResponse.json(
        { error: 'No active competition found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...competition,
      totalEntries: competition._count.entries,
    });
  } catch (error) {
    console.error('Error fetching current competition:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competition' },
      { status: 500 }
    );
  }
}
