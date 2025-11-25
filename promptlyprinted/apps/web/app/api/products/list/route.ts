import { database } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Parse pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Default 50 products per page
    const skip = (page - 1) * limit;

    // First fetch all listed AND active products (both variant parents and regular products)
    // listed = shows in catalog, isActive = can be purchased
    const allProducts = await database.product.findMany({
      where: {
        listed: true,
        isActive: true,
        countryCode: 'US',
        NOT: {
          OR: [
            { name: { contains: 'Socks', mode: 'insensitive' } },
            { name: { contains: 'Sock', mode: 'insensitive' } },
            { productType: { contains: 'socks', mode: 'insensitive' } },
            { category: { name: { contains: 'socks', mode: 'insensitive' } } },
          ]
        }
      },
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
      skip,
      take: limit + 1, // Fetch one extra to check if there are more
    });

    // Check if there are more products
    const hasMore = allProducts.length > limit;
    const productsToReturn = hasMore ? allProducts.slice(0, limit) : allProducts;

    // Filter to show only:
    // 1. Products that are variant parents (isVariantProduct: true)
    // 2. Products that are NOT variants themselves (parentProductId: null)
    const products = productsToReturn.filter(
      (p) => p.isVariantProduct || (!p.parentProductId && !p.isVariantProduct)
    );

    // Now fetch variants and variant options separately for products that need them
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        if (product.isVariantProduct) {
          // Fetch variants
          const variants = await database.product.findMany({
            where: {
              parentProductId: product.id,
            },
            select: {
              id: true,
              sku: true,
              name: true,
              price: true,
              variantAttributes: true,
              stock: true,
            },
          });

          // Fetch variant options
          const variantOptions = await database.productVariantOption.findMany({
            where: {
              productId: product.id,
            },
            select: {
              optionName: true,
              optionValue: true,
              displayOrder: true,
            },
            orderBy: {
              displayOrder: 'asc',
            },
          });

          return {
            ...product,
            variants,
            variantOptions,
          };
        }
        return {
          ...product,
          variants: [],
          variantOptions: [],
        };
      })
    );

    const normalized = productsWithVariants.map((product) => {
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
        // Variant system data
        isVariantProduct: product.isVariantProduct,
        variantCount: product.variants?.length || 0,
        variantOptions: product.variantOptions || [],
        variants: product.variants || [],
      };
    });

    return NextResponse.json({
      products: normalized,
      pagination: {
        page,
        limit,
        hasMore,
        total: products.length,
      }
    }, {
      headers: {
        // Cache for 1 hour, revalidate in background for 24 hours
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching products list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
