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

    // Build list of possible SKU variations to try
    // Database SKUs have country prefixes like US-, GB-, DE-
    const countryPrefixes = ['US', 'GB', 'DE', 'FR', 'AU', 'CA'];
    const skuWithoutPrefix = sku.replace(/^[A-Z]{2}-/, ''); // Remove any 2-letter prefix

    const skuVariations = [
      sku,                                              // Exact match
      ...countryPrefixes.map(prefix => `${prefix}-${skuWithoutPrefix}`), // Try all country prefixes
    ];

    console.log('[API by-sku] Searching for SKU variations:', skuVariations);

    // Find product by SKU (using findFirst since SKU is not unique in schema)
    // Try multiple variations of the SKU
    const product = await prisma.product.findFirst({
      where: {
        sku: { in: skuVariations },
        listed: true,
        isActive: true,
      },
      select: { id: true, sku: true, name: true },
    });

    if (!product) {
      console.log('[API by-sku] Product not found for any SKU variation');
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('[API by-sku] Found product:', { id: product.id, sku: product.sku, name: product.name });
    return NextResponse.json({ id: product.id, sku: product.sku, name: product.name });
  } catch (error) {
    console.error('[API] Error fetching product by SKU:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
