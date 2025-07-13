'use client';

import type { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

// Utility function for consistent URL generation
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/'/g, '') // Remove apostrophes
    .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

export function ProductCard({ product }: ProductCardProps) {
  const categorySlug = createSlug(product.category);
  const productSlug = createSlug(product.name);
  const productUrl = `/products/${categorySlug}/${productSlug}`;

  return (
    <Link href={productUrl}>
      <div className="group relative">
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
          <Image
            src={product.imageUrls.cover}
            alt={product.name}
            width={500}
            height={500}
            className="h-full w-full object-cover object-center lg:h-full lg:w-full"
          />
        </div>
        <div className="mt-4 flex justify-between">
          <div>
            <h3 className="text-sm text-gray-700">
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </h3>
          </div>
          <p className="text-sm font-medium text-gray-900">${(product.price || 0).toFixed(2)}</p>
        </div>
      </div>
    </Link>
  );
}