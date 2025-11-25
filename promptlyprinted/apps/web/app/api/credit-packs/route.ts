import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

/**
 * GET /api/credit-packs
 * Fetch available credit packs for purchase
 */
export async function GET() {
  try {
    const packs = await prisma.creditPack.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        credits: true,
        price: true,
        currency: true,
        bonusCredits: true,
        isPopular: true,
        metadata: true,
      },
    });

    // Calculate totals for each pack
    const packsWithTotals = packs.map((pack) => {
      const totalCredits = pack.credits + pack.bonusCredits;
      const pricePerCredit = pack.price / totalCredits;
      const savings = pack.bonusCredits > 0
        ? Math.round((pack.bonusCredits / pack.credits) * 100)
        : 0;

      return {
        ...pack,
        totalCredits,
        pricePerCredit: Number(pricePerCredit.toFixed(3)),
        savings,
      };
    });

    return NextResponse.json({
      packs: packsWithTotals,
    });
  } catch (error) {
    console.error('Error fetching credit packs:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch credit packs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
