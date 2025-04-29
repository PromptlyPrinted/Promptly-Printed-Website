import { Metadata } from 'next'
import { ProductDetail } from './components/product-detail'
import { prisma } from '@repo/database'
import { notFound } from 'next/navigation'
import type { Image as ProductImage } from '@repo/database'

import { Product as WebProduct } from '@/types/product'

interface ProdigiVariants {
  imageUrls?: {
    base: string;
  };
  colorOptions?: Array<{
    name: string;
    filename: string;
  }>;
  width?: number;
  height?: number;
  units?: string;
  brand?: string;
  style?: string;
  colors?: string[];
  sizes?: string[];
}

interface DisplayProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  customerPrice: number;
  shippingCost: number;
  imageUrl: string;
  imageUrlMap: Record<string, string>;
  images: string[];
  specifications: {
    dimensions: {
      width: number;
      height: number;
      units: string;
    };
    brand: string;
    style: string;
    color: string[];
    size: string[];
  };
  category?: {
    id: string;
    name: string;
  };
  prodigiAttributes?: any;
  prodigiVariants: ProdigiVariants;
  savedImages: any[];
  wishedBy: any[];
}

type Props = {
  params: {
    id: string
  }
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { id: true },
  });

  return products.map((product: { id: number }) => ({ id: product.id.toString() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      customerPrice: true,
      sku: true,
      shippingCost: true,
      prodigiAttributes: true,
      prodigiVariants: true,
      size: true,
      images: {
        select: {
          id: true,
          url: true
        }
      },
      category: {
        select: {
          id: true,
          name: true
        }
      },
      savedImages: true,
      wishedBy: true
    }
  });
  
  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    }
  }

  return {
    title: `${product.name} | Promptly Printed`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.map((img) => img.url),
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'),
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const rawProduct = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      customerPrice: true,
      sku: true,
      shippingCost: true,
      prodigiAttributes: true,
      prodigiVariants: true,
      size: true,
      images: {
        select: {
          id: true,
          url: true
        }
      },
      category: {
        select: {
          id: true,
          name: true
        }
      },
      savedImages: true,
      wishedBy: true
    }
  });

  if (!rawProduct) {
    notFound();
  }

  // Use prodigiVariants as a JavaScript object
  const prodigiVariants = rawProduct.prodigiVariants || {};
  const specifications = {
    dimensions: {
      width: prodigiVariants.width || 0,
      height: prodigiVariants.height || 0,
      units: prodigiVariants.units || 'cm'
    },
    brand: prodigiVariants.brand || '',
    style: prodigiVariants.style || '',
    color: prodigiVariants.colors || [],
    size: rawProduct.size || prodigiVariants.sizes || []
  };

  // Create a mapping of color names to their image URLs
  const imageUrlMap: Record<string, string> = {};
  if (rawProduct.prodigiVariants) {
    const prodigiVariants = rawProduct.prodigiVariants as ProdigiVariants;
    if (prodigiVariants.colorOptions && prodigiVariants.imageUrls?.base) {
      const base = prodigiVariants.imageUrls.base;
      prodigiVariants.colorOptions.forEach((color: { name: string; filename: string }) => {
        imageUrlMap[color.name.toLowerCase()] = `${base}/${color.filename}`;
      });
    }
  }

  const variants = rawProduct.prodigiVariants as ProdigiVariants;
  
  const product: DisplayProduct = {
    ...rawProduct,
    id: rawProduct.id.toString(),
    specifications,
    imageUrlMap,
    imageUrl: variants?.imageUrls?.base || '',
    images: rawProduct.images.map(img => img.url),
    category: rawProduct.category ? {
      id: rawProduct.category.id.toString(),
      name: rawProduct.category.name
    } : undefined,
    prodigiVariants: variants
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail product={product} />
    </div>
  )
}