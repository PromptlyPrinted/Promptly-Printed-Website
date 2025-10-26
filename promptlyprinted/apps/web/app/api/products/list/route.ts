import { database } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const products = await database.product.findMany({
      where: {
        listed: true,
        countryCode: 'US',
      },
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const normalized = products.map((product) => {
      const prodigiVariants =
        (product.prodigiVariants as Record<string, any> | null) ?? undefined;
      const prodigiAttributes =
        (product.prodigiAttributes as Record<string, any> | null) ?? undefined;
      const imageUrls =
        (prodigiVariants?.imageUrls as Record<string, string> | undefined) ??
        undefined;

      return {
        id: product.sku,
        sku: product.sku,
        name: product.name,
        description: product.description,
        pricing: [
          {
            amount: product.price,
            currency: product.currency,
          },
        ],
        price: product.price,
        shippingCost: product.shippingCost,
        imageUrls: {
          base: imageUrls?.base || '',
          cover:
            imageUrls?.productImage ||
            imageUrls?.cover ||
            (imageUrls?.base ? `${imageUrls.base}/cover.png` : ''),
          sizeChart: imageUrls?.sizeChart || '',
        },
        category: product.category
          ? {
              id: product.category.id.toString(),
              name: product.category.name,
              description: product.category.description ?? undefined,
            }
          : undefined,
        specifications: {
          dimensions: {
            width: product.width,
            height: product.height,
            units: product.units,
          },
          brand: product.brand,
          style: product.style,
          color: product.color,
          size: product.size,
        },
        prodigiVariants,
        prodigiAttributes,
        savedImages: [],
        wishedBy: [],
      };
    });

    return NextResponse.json({ products: normalized });
  } catch (error) {
    console.error('Error fetching products list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
