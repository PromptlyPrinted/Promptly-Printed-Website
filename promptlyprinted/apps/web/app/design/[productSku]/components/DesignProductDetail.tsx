'use client';

import { DesignProductNavigation } from './DesignProductNavigation';
import { ProductDetail } from '../../../products/[category]/[productName]/components/ProductDetail';
import type { Product } from '@/types/product';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DesignProductDetailProps {
  product: Product;
}

export function DesignProductDetail({ product }: DesignProductDetailProps) {
  const router = useRouter();
  const [currentProduct, setCurrentProduct] = useState(product);

  const handleProductChange = (newSku: string, productName?: string) => {
    // Create slug from product name for better URLs
    const slug = productName
      ? productName.toLowerCase().replace(/[''"]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
      : newSku;
    // Navigate to the new product design page
    router.push(`/design/${slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Product Navigation */}
      <DesignProductNavigation
        currentProductSku={currentProduct.sku || currentProduct.name}
        onProductChange={handleProductChange}
      />

      {/* Design-focused header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Design Your {currentProduct.name}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Create custom designs with AI • Switch products anytime • Save your creations
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Starting from</span>
              <span className="text-lg font-semibold text-gray-900">
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