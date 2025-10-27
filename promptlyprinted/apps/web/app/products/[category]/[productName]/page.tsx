import { tshirtDetails } from '@/data/products';
import { notFound } from 'next/navigation';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { ProductDetail } from './components/ProductDetail';
import type { Product } from '@/types/product';
import { database } from '@repo/database';

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

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { category: categorySlug, productName: productSlug } = await params;
  console.log(`Generating Metadata for: /products/${categorySlug}/${productSlug}`);

  const product = Object.values(tshirtDetails).find(
    (p) =>
      normalizeString(p.category) === normalizeString(categorySlug) &&
      normalizeString(p.name) === normalizeString(productSlug)
  );
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

  // First try to find in static data for fallback
  const staticProduct = Object.values(tshirtDetails).find(
    (p) =>
      normalizeString(p.category) === normalizeString(categorySlug) &&
      normalizeString(p.name) === normalizeString(productSlug)
  );

  // Try to fetch from database for most up-to-date data
  let dbProduct = null;
  if (staticProduct?.sku) {
    dbProduct = await database.product.findFirst({
      where: {
        sku: staticProduct.sku,
        countryCode: 'US',
        listed: true,
      },
      include: {
        category: true,
      },
    });
  }

  // Use database product if available, otherwise fall back to static
  const product = staticProduct;
  if (!product) {
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

  return <ProductDetail product={productWithPrice} />;
}