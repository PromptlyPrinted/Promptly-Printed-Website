'use client';

import { DesignProductNavigation } from './DesignProductNavigation';
import { ProductDetail } from '../../../products/[category]/[productName]/components/ProductDetail';
import type { Product } from '@/types/product';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDesignTheme } from '@/contexts/DesignThemeContext';
import { cn } from '@repo/design-system/lib/utils';

interface DesignProductDetailProps {
  product: Product;
}

export function DesignProductDetail({ product }: DesignProductDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentProduct, setCurrentProduct] = useState(product);
  const { theme } = useDesignTheme();

  // Get discount from URL
  const discountFromUrl = searchParams.get('discount');
  const discountPercent = discountFromUrl ? parseFloat(discountFromUrl) : 0;

  const handleProductChange = (newSku: string, productName?: string) => {
    // Create slug from product name for better URLs
    const slug = productName
      ? productName.toLowerCase().replace(/[''"]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
      : newSku;

    // Preserve all URL parameters when switching products
    const params = new URLSearchParams(searchParams.toString());

    // Navigate to the new product design page with preserved params
    router.push(`/design/${slug}?${params.toString()}`);
  };

  // Calculate display price with discount
  const basePrice = currentProduct.pricing.find(p => p.currency === 'USD')?.amount || currentProduct.pricing[0].amount;
  const displayPrice = discountPercent > 0 ? basePrice * (1 - discountPercent) : basePrice;

  return (
    <div className={cn("min-h-screen", `bg-${theme.hover}`)}>
      {/* Enhanced Product Navigation */}
      <DesignProductNavigation
        currentProductSku={currentProduct.sku || currentProduct.name}
        onProductChange={handleProductChange}
      />

      {/* Design-focused header */}
      <div className={cn("border-b", `bg-${theme.background}`, `border-${theme.border}`)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={cn("text-2xl font-bold", `text-${theme.textPrimary}`)}>
                Design Your {currentProduct.name}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Create custom designs with AI • Switch products anytime • Save your creations
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {discountPercent > 0 ? (
                <>
                  <span className="text-sm text-gray-500">Sale Price</span>
                  <span className={cn("text-xl font-bold text-green-600")}>
                    ${displayPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ${basePrice.toFixed(2)}
                  </span>
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-semibold">
                    -{Math.round(discountPercent * 100)}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm text-gray-500">Starting from</span>
                  <span className={cn("text-lg font-semibold", `text-${theme.textPrimary}`)}>
                    ${displayPrice.toFixed(2)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Product Detail Component */}
      <ProductDetail product={currentProduct} isDesignMode={true} />
    </div>
  );
}