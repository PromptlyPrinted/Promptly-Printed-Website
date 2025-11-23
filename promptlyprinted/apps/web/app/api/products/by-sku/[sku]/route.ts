import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { sku: string } }
) {
  try {
    const { sku } = params;

    if (!sku) {
      return NextResponse.json(
        { error: 'SKU is required' },
        { status: 400 }
      );
    }

    // Find product by SKU (using findFirst since SKU is not unique in schema)
    const product = await prisma.product.findFirst({
      where: { sku },
      select: { id: true, sku: true, name: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: product.id, sku: product.sku, name: product.name });
  } catch (error) {
    console.error('[API] Error fetching product by SKU:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
