import { tshirtDetails } from '@/data/products';
import { notFound } from 'next/navigation';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { ProductDetail } from './components/ProductDetail';
import type { Product } from '@/types/product';
import { database } from '@repo/database';
import { Suspense, cache } from 'react';

// Best practice: Product pages rarely change, so cache for 24 hours
// This reduces database load and improves performance for repeat visitors
export const revalidate = 86400; // 24 hours

// Enable static generation for better performance
export const dynamic = 'force-static';

interface ProductPageProps {
  params: Promise<{
    category: string;
    productName: string;
  }>;
}

// Utility to normalize strings for comparison - handles apostrophes and special characters
const normalizeString = (str: string) =>
  str.toLowerCase().replace(/[''"]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

// Utility to create clean slugs for URLs
const createSlug = (str: string) =>
  str.toLowerCase().replace(/[''"]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

export async function generateStaticParams() {
  const params: { category: string; productName: string }[] = [];

  Object.values(tshirtDetails).forEach((product) => {
    const categorySlug = createSlug(product.category);
    const productSlug = createSlug(product.name);
    console.log(`Generated Static Param: /products/${categorySlug}/${productSlug}`);
    params.push({
      category: categorySlug,
      productName: productSlug,
    });
  });

  return params;
}

// Cached database query to prevent duplicate requests during SSR
const getProductFromDatabase = cache(async (productSlug: string, sku?: string) => {
  try {
    const searchConditions = [];
    
    // Search by product name slug
    searchConditions.push({
      name: {
        equals: productSlug,
        mode: 'insensitive' as const
      }
    });
    
    // If we have SKU, also search by it
    if (sku) {
      searchConditions.push({ sku: sku });
      searchConditions.push({ sku: `US-${sku}` });
    }

    const dbProduct = await database.product.findFirst({
      where: {
        countryCode: 'US',
        listed: true,
        isActive: true,
        parentProductId: null,
        OR: searchConditions,
      },
      include: {
        category: true,
      },
    });

    return dbProduct;
  } catch (error) {
    console.log('Database query error:', error);
    return null;
  }
});

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { category: categorySlug, productName: productSlug } = await params;
  console.log(`Generating Metadata for: /products/${categorySlug}/${productSlug}`);

  // Try to find by both category and name first
  let product = Object.values(tshirtDetails).find(
    (p) =>
      normalizeString(p.category) === normalizeString(categorySlug) &&
      normalizeString(p.name) === normalizeString(productSlug)
  );

  // If not found, try by name only (category in DB may differ from tshirtDetails)
  if (!product) {
    product = Object.values(tshirtDetails).find(
      (p) => normalizeString(p.name) === normalizeString(productSlug)
    );
  }

  console.log('Product found for metadata:', product ? product.name : 'None');

  if (!product) {
    return {};
  }

  return createMetadata({
    title: `${product.name} | Promptly Printed`,
    description: product.shortDescription,
    openGraph: {
      images: [product.imageUrls.cover],
    },
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { category: categorySlug, productName: productSlug } = await params;
  console.log(`Attempting to find product for: /products/${categorySlug}/${productSlug}`);

  // First try to find in static data by matching BOTH category AND name
  let staticProduct = Object.values(tshirtDetails).find(
    (p) =>
      normalizeString(p.category) === normalizeString(categorySlug) &&
      normalizeString(p.name) === normalizeString(productSlug)
  );

  // If not found, try matching by name only (category in DB may differ from tshirtDetails)
  if (!staticProduct) {
    staticProduct = Object.values(tshirtDetails).find(
      (p) => normalizeString(p.name) === normalizeString(productSlug)
    );
  }

  // Try to fetch from database using cached query
  const dbProduct = await getProductFromDatabase(productSlug, staticProduct?.sku);

  // If product is not in database as listed/active, don't show it
  if (!dbProduct) {
    console.log(`Product not found as listed/active in database`);
    // During build, allow static products
    if (process.env.NODE_ENV !== 'production' || !staticProduct) {
      notFound();
    }
  }

  // Use static product for display (it has the full details needed for the page)
  // If no static product but we have dbProduct, we can still proceed
  const product = staticProduct;
  if (!product && !dbProduct) {
    notFound();
  }

  // At this point, we have either staticProduct or dbProduct (or both)
  if (!product) {
    // This case shouldn't happen since we check above, but TypeScript needs this
    notFound();
  }

  console.log('Product found for page:', product.name);

  // If we have database data, use it for colors and variants (most up-to-date)
  const colorOptions = dbProduct
    ? (dbProduct.prodigiVariants as any)?.colorOptions ||
      dbProduct.color.map((name: string) => ({
        name,
        filename: `${name.toLowerCase().replace(/\s+/g, '-')}.png`
      }))
    : product.colorOptions;

  const imageBase = dbProduct
    ? (dbProduct.prodigiVariants as any)?.imageUrls?.base || product.imageUrls.base
    : product.imageUrls.base;

  // Map to Product interface
  const productWithPrice: Product = {
    id: product.sku,
    name: product.name,
    description: product.shortDescription,
    pricing: product.pricing,
    price: product.pricing.find((p) => p.currency === 'USD')?.amount || 0,
    shippingCost: 0,
    imageUrls: {
      ...product.imageUrls,
      base: imageBase,
    },
    sku: product.sku,
    category: {
      id: dbProduct?.category?.id.toString() || product.sku,
      name: dbProduct?.category?.name || product.category,
    },
    specifications: {
      dimensions: product.dimensions,
      brand: product.brand?.name || '',
      style: product.productType,
      color: colorOptions?.map((opt: any) => opt.name) || [],
      size: product.size,
    },
    prodigiVariants: {
      imageUrls: {
        base: imageBase
      },
      colorOptions: colorOptions,
      sizes: product.size,
    },
    savedImages: [],
    wishedBy: [],
  };

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading product...</div>
      </div>
    }>
      <ProductDetail product={productWithPrice} />
    </Suspense>
  );
}