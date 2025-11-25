import { tshirtDetails } from '@repo/database/scripts/tshirt-details';
import { database } from '@repo/database';
import { notFound, redirect } from 'next/navigation';
import { DesignProductDetail } from './components/DesignProductDetail';
import type { Product } from '@/types/product';
import { DesignThemeProvider } from '@/contexts/DesignThemeContext';

interface DesignPageProps {
  params: Promise<{
    productSku: string;
  }>;
  searchParams?: Promise<{
    campaign?: string;
  }>;
}

// Utility to normalize strings for comparison - handles apostrophes and special characters
const normalizeString = (str: string) =>
  str.toLowerCase().replace(/[''"]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

// Utility to create clean slugs for URLs
const createSlug = (str: string) =>
  str.toLowerCase().replace(/[''"]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

export default async function DesignPage({ params, searchParams }: DesignPageProps) {
  const { productSku } = await params;
  const resolvedSearchParams = await searchParams;
  const campaign = resolvedSearchParams?.campaign || 'default';

  // Get product from tshirt details - support both SKU and name-based lookup for backward compatibility
  let product = tshirtDetails[productSku as keyof typeof tshirtDetails];

  // If not found by SKU, try to find by name (for the new URL structure)
  if (!product) {
    product = Object.values(tshirtDetails).find(
      (p) => normalizeString(p.name) === normalizeString(productSku)
    ) as any;
  }

  if (!product) {
    notFound();
  }

  // Verify product is listed and active in the database
  try {
    const dbProduct = await database.product.findFirst({
      where: {
        sku: product.sku,
        countryCode: 'US',
        listed: true,
        isActive: true,
      },
    });

    // If product is not listed or not active in database, don't allow designing
    if (!dbProduct) {

      notFound();
    }
  } catch (error) {
    // Database not available - allow access for development/build time

  }

  // Map tshirtDetails to Product interface
  const productWithPrice: Product = {
    id: product.sku,
    name: product.name,
    description: product.shortDescription,
    pricing: product.pricing,
    price: product.pricing.find((p) => p.currency === 'USD')?.amount || 0,
    shippingCost: 0, // Default shipping cost
    imageUrls: product.imageUrls,
    sku: product.sku,
    category: {
      id: product.sku,
      name: product.category,
    },
    specifications: {
      dimensions: product.dimensions,
      brand: product.brand?.name || '',
      style: product.productType,
      color: product.colorOptions?.map(opt => opt.name) || [],
      size: product.size,
    },
    prodigiVariants: {
        imageUrls: {
            base: product.imageUrls.base
        },
        colorOptions: product.colorOptions,
        sizes: product.size,
    },
    savedImages: [],
    wishedBy: [],
  };

  return (
    <DesignThemeProvider themeName={campaign}>
      <DesignProductDetail product={productWithPrice} />
    </DesignThemeProvider>
  );
}

export async function generateStaticParams() {
  const params: { productSku: string }[] = [];

  // Generate params for both SKU (legacy) and name-based URLs
  Object.values(tshirtDetails).forEach((product) => {
    // Legacy SKU-based URLs
    params.push({ productSku: product.sku });
    // New name-based URLs
    params.push({ productSku: createSlug(product.name) });
  });

  return params;
}