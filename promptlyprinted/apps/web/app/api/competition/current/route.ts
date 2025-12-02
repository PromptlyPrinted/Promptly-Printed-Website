import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

/**
 * GET ACTIVE COMPETITION
 *
 * Returns the currently active competition details including:
 * - Competition ID, name, theme
 * - Prize amount
 * - Start and end dates
 * - Theme icon
 *
 * This endpoint is used across the site to show active competition info
 * and determine if users can submit designs.
 */
export async function GET() {
  try {
    const competition = await prisma.competition.findFirst({
      where: {
        isActive: true,
        endDate: { gte: new Date() },
      },
      orderBy: { startDate: 'desc' },
    });

    if (!competition) {
      return NextResponse.json(
        { error: 'No active competition' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: competition.id,
      name: competition.theme,
      theme: competition.theme,
      prize: competition.prize,
      startDate: competition.startDate,
      endDate: competition.endDate,
      icon: competition.themeIcon,
      isActive: competition.isActive,
    });
  } catch (error) {
    console.error('Error fetching active competition:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active competition' },
      { status: 500 }
    );
  }
}
