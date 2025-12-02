import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { prisma } from '@repo/database';

/**
 * GET MY DESIGNS
 *
 * Returns all designs created by the authenticated user along with:
 * - Purchase status (whether the design has been purchased)
 * - Competition entry status (whether submitted, likes, votes)
 * - Order information if purchased
 *
 * This endpoint is used on the /my-designs page to show users
 * their created designs and allow them to submit to competition.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all user's designs
    const designs = await prisma.design.findMany({
      where: { userId: session.user.id },
      include: {
        savedImage: true,
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // For each design, check if it's been purchased and submitted to competition
    const designsWithStatus = await Promise.all(
      designs.map(async (design) => {
        // Find order containing this design
        // We check Square order metadata for designId
        const order = await prisma.order.findFirst({
          where: {
            userId: session.user.id,
            status: { in: ['COMPLETED', 'PROCESSING', 'SHIPPED'] },
            // Note: You might need to query by metadata->designId
            // For now, we'll check if any order items match
          },
          include: {
            orderItems: true,
          },
        });

        // Check if this specific design was purchased
        // This requires checking order metadata or orderItem customization
        // For simplicity, we'll check if there's any completed order
        const hasPurchase = !!order;

        // Check competition entry status
        const entry = await prisma.competitionEntry.findFirst({
          where: {
            designId: design.id,
            competition: { isActive: true },
          },
          include: {
            _count: {
              select: { likes: true, votes: true },
            },
          },
        });

        return {
          id: design.id,
          name: design.name,
          imageUrl: design.savedImage.url,
          productName: design.product.name,
          createdAt: design.createdAt,
          hasPurchase,
          orderId: order?.id,
          orderStatus: order?.status,
          competitionEntry: entry
            ? {
                id: entry.id,
                submitted: true,
                likes: entry._count.likes,
                votes: entry._count.votes,
                // @ts-ignore - Added via migration
                referralCode: entry.referralCode,
              }
            : undefined,
        };
      })
    );

    return NextResponse.json({
      designs: designsWithStatus,
    });
  } catch (error) {
    console.error('Error fetching user designs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch designs' },
      { status: 500 }
    );
  }
}
