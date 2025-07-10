import { tshirtDetails } from '@/data/products';
import { notFound } from 'next/navigation';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { ProductDetail } from './components/ProductDetail';
import type { Product } from '@/types/product';

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

  const product = Object.values(tshirtDetails).find(
    (p) =>
      normalizeString(p.category) === normalizeString(categorySlug) &&
      normalizeString(p.name) === normalizeString(productSlug)
  );
  console.log('Product found for page:', product ? product.name : 'None');

  if (!product) {
    notFound();
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

  return <ProductDetail product={productWithPrice} />;
}