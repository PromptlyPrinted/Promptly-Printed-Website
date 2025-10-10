'use client';

import { DesignProductNavigation } from './DesignProductNavigation';
import { ProductDetail } from '../../../products/[category]/[productName]/components/ProductDetail';
import type { Product } from '@/types/product';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDesignTheme } from '@/contexts/DesignThemeContext';
import { cn } from '@repo/design-system/lib/utils';

interface DesignProductDetailProps {
  product: Product;
}

export function DesignProductDetail({ product }: DesignProductDetailProps) {
  const router = useRouter();
  const [currentProduct, setCurrentProduct] = useState(product);
  const { theme } = useDesignTheme();

  const handleProductChange = (newSku: string, productName?: string) => {
    // Create slug from product name for better URLs
    const slug = productName
      ? productName.toLowerCase().replace(/[''"]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
      : newSku;
    // Navigate to the new product design page
    router.push(`/design/${slug}`);
  };

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
              <span className="text-sm text-gray-500">Starting from</span>
              <span className={cn("text-lg font-semibold", `text-${theme.textPrimary}`)}>
                £{currentProduct.pricing.find(p => p.currency === 'GBP')?.amount || currentProduct.pricing[0].amount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Product Detail Component */}
      <ProductDetail product={currentProduct} isDesignMode={true} />
    </div>
  );
}