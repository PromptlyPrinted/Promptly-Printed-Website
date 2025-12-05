import { tshirtDetails } from '@/data/products';
import { notFound } from 'next/navigation';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { JsonLd, type WithContext, type Product as ProductSchema } from '@repo/seo/json-ld';
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

  // SEO-optimized title and description
  const usdPrice = product.pricing.find((p) => p.currency === 'USD')?.amount || 25;
  const seoTitle = `Custom ${product.name} | AI Design Your Own | From $${usdPrice}`;
  const seoDescription = `Design your own ${product.name} with AI. ${product.shortDescription} Premium ${product.brand?.name || ''} quality. Ships worldwide. No minimum order.`;

  return createMetadata({
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      images: [product.imageUrls.cover],
      type: 'website',
    },
    alternates: {
      canonical: `https://promptlyprinted.com/products/${createSlug(product.category)}/${createSlug(product.name)}`,
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
    dbId: dbProduct?.id, // Include numeric database ID
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

  // Generate Product JSON-LD Schema for SEO
  const usdPrice = product.pricing.find((p) => p.currency === 'USD')?.amount || 25;
  const productUrl = `https://promptlyprinted.com/products/${createSlug(product.category)}/${createSlug(product.name)}`;
  
  const productSchema: WithContext<ProductSchema> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: product.imageUrls.cover,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || 'Promptly Printed',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'USD',
      price: usdPrice,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Promptly Printed',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'Worldwide',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 5,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 5,
            maxValue: 14,
            unitCode: 'DAY',
          },
        },
      },
    },
    category: product.category,
    material: product.dimensions?.fabric || 'Premium Cotton',
    color: colorOptions?.map((opt: { name: string }) => opt.name) || [],
    size: product.size,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Fabric Weight',
        value: product.dimensions?.weight || '280gsm',
      },
      {
        '@type': 'PropertyValue',
        name: 'Print Method',
        value: 'DTG (Direct to Garment)',
      },
      {
        '@type': 'PropertyValue',
        name: 'Design Method',
        value: 'AI-Generated Custom Design',
      },
    ],
  };

  return (
    <>
      <JsonLd code={productSchema} />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">Loading product...</div>
        </div>
      }>
        <ProductDetail product={productWithPrice} />
      </Suspense>
    </>
  );
}