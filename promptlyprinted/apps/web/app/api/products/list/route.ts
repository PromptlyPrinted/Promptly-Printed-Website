import { database } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // First fetch all listed AND active products (both variant parents and regular products)
    // listed = shows in catalog, isActive = can be purchased
    const allProducts = await database.product.findMany({
      where: {
        listed: true,
        isActive: true,
        countryCode: 'US',
      },
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Filter to show only:
    // 1. Products that are variant parents (isVariantProduct: true)
    // 2. Products that are NOT variants themselves (parentProductId: null)
    const products = allProducts.filter(
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

    return NextResponse.json({ products: normalized });
  } catch (error) {
    console.error('Error fetching products list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
