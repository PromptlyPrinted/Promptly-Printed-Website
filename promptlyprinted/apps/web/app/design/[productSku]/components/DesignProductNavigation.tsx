'use client';

import { tshirtDetails } from '@repo/database/scripts/tshirt-details';
import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import { cn } from '@repo/design-system/lib/utils';
import Link from 'next/link';
import { useState } from 'react';

interface DesignProductNavigationProps {
  currentProductSku: string;
  onProductChange?: (sku: string, productName?: string) => void;
}

const productCategories = {
  Men: {
    'T-Shirts': ['TEE-SS-STTU755', 'GLOBAL-TEE-BC-3413', 'GLOBAL-TEE-GIL-64V00'],
    'Tank Tops': ['TT-GIL-64200'],
    'Long Sleeve': ['A-ML-GD2400'],
  },
  Women: {
    'T-Shirts': ['A-WT-GD64000L', 'GLOBAL-TEE-BC-6035'],
  },
  Kids: {
    'T-Shirts': ['A-KT-GD64000B'],
    'Sweatshirts': ['SWEAT-AWD-JH030B'],
  },
  Babies: {
    'Bodysuits': ['A-BB-LA4411'],
    'T-Shirts': ['GLOBAL-TEE-RS-3322'],
  },
};

export function DesignProductNavigation({ currentProductSku, onProductChange }: DesignProductNavigationProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof productCategories>('Men');

  // Find current product by SKU or name
  let currentProduct = tshirtDetails[currentProductSku as keyof typeof tshirtDetails];
  if (!currentProduct) {
    // Try to find by name (normalized)
    const normalizeString = (str: string) =>
      str.toLowerCase().replace(/[''"]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

    currentProduct = Object.values(tshirtDetails).find(
      (p) => normalizeString(p.name) === normalizeString(currentProductSku)
    );
  }

  const handleProductSelect = (sku: string, productName?: string) => {
    if (onProductChange) {
      onProductChange(sku, productName);
    }
  };

  // Utility to create clean slugs for URLs
  const createSlug = (str: string) =>
    str.toLowerCase().replace(/[''"]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

  const getCategoryFromProduct = (product: any): keyof typeof productCategories => {
    if (product.category.includes("Men's")) return 'Men';
    if (product.category.includes("Women's")) return 'Women';
    if (product.category.includes("Kids'")) return 'Kids';
    if (product.category.includes('Baby')) return 'Babies';
    return 'Men';
  };

  // Set active category based on current product
  const currentCategory = currentProduct ? getCategoryFromProduct(currentProduct) : 'Men';

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Navigation */}
        <div className="flex space-x-8 py-4">
          {Object.keys(productCategories).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category as keyof typeof productCategories)}
              className={cn(
                'text-sm font-medium pb-2 border-b-2 transition-colors',
                activeCategory === category || currentCategory === category
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Product Type Tabs */}
        <div className="flex space-x-6 pb-4">
          {Object.entries(productCategories[activeCategory]).map(([type, skus]) => (
            <div key={type} className="flex flex-col">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {type}
              </h3>
              <div className="flex space-x-2">
                {skus.map((sku) => {
                  const product = tshirtDetails[sku as keyof typeof tshirtDetails];
                  if (!product) return null;

                  const isActive = sku === currentProductSku ||
                    (currentProduct && createSlug(product.name) === createSlug(currentProduct.name));
                  const price = product.pricing.find(p => p.currency === 'GBP')?.amount || product.pricing[0].amount;

                  const productSlug = createSlug(product.name);

                  return (
                    <Link
                      key={sku}
                      href={`/design/${productSlug}`}
                      onClick={() => handleProductSelect(sku, product.name)}
                      className={cn(
                        'group relative p-3 rounded-lg border transition-all duration-200 hover:shadow-md',
                        isActive
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      )}
                    >
                      <div className="flex flex-col items-center space-y-2 min-w-[120px]">
                        {/* Product Image Preview */}
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            {product.productType.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Product Info */}
                        <div className="text-center">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            £{price}
                          </p>
                        </div>

                        {/* Active Badge */}
                        {isActive && (
                          <Badge variant="default" className="absolute -top-2 -right-2 text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}