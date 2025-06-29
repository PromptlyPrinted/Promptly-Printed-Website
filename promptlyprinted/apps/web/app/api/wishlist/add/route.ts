import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';
import { ZodError, z } from 'zod';

const WishlistSchema = z.object({
  productId: z.coerce.number().int(),
  savedImageId: z.string().cuid(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    let data;
    try {
      data = WishlistSchema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: 'Invalid data', details: err.errors },
          { status: 400 }
        );
      }
      throw err;
    }
    const dbUser = await database.user.findUnique({
      where: { clerkId: session.userId },
    });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const design = await database.design.create({
      data: {
        name: `Design for product ${data.productId}`,
        userId: dbUser.id,
        productId: data.productId,
        savedImageId: data.savedImageId,
      },
      include: {
        savedImage: true,
        product: { select: { name: true, sku: true, color: true } },
      },
    });
    return NextResponse.json(design, { status: 201 });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to add to wishlist',
      },
      { status: 500 }
    );
  }
}
