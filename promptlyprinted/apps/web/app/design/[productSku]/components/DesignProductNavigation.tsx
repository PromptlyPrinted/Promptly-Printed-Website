'use client';

import { tshirtDetails } from '@repo/database/scripts/tshirt-details';
import { Badge } from '@repo/design-system/components/ui/badge';
import { cn } from '@repo/design-system/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { useDesignTheme } from '@/contexts/DesignThemeContext';

interface DesignProductNavigationProps {
  currentProductSku: string;
  onProductChange?: (sku: string, productName?: string) => void;
}

const productCategories = {
  Men: {
    'APPAREL': {
      'T-Shirts': ['TEE-SS-STTU755', 'GLOBAL-TEE-BC-3413', 'GLOBAL-TEE-GIL-64V00'],
      'Tank Tops': ['TT-GIL-64200'],
      'Long Sleeve': ['A-ML-GD2400'],
    }
  },
  Women: {
    'APPAREL': {
      'T-Shirts': ['A-WT-GD64000L', 'GLOBAL-TEE-BC-6035'],
    }
  },
  Kids: {
    'APPAREL': {
      'T-Shirts': ['A-KT-GD64000B'],
      'Sweatshirts': ['SWEAT-AWD-JH030B'],
    }
  },
  Babies: {
    'APPAREL': {
      'Bodysuits': ['A-BB-LA4411'],
      'T-Shirts': ['GLOBAL-TEE-RS-3322'],
    }
  },
};

export function DesignProductNavigation({ currentProductSku, onProductChange }: DesignProductNavigationProps) {
  const [hoveredCategory, setHoveredCategory] = useState<keyof typeof productCategories | null>(null);
  const { theme } = useDesignTheme();

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
    <div className={cn("relative border-b shadow-sm", `bg-${theme.background}`, `border-${theme.borderLight}`)}>
      <div className="max-w-7xl mx-auto">
        {/* Main Navigation Bar */}
        <div className="flex items-center px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-8">
            {Object.keys(productCategories).map((category) => {
              const isActive = currentCategory === category;

              return (
                <div
                  key={category}
                  className="relative"
                  onMouseEnter={() => setHoveredCategory(category as keyof typeof productCategories)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <button
                    className={cn(
                      'text-base font-medium px-4 py-2 rounded-md transition-all duration-200',
                      isActive || hoveredCategory === category
                        ? `text-${theme.primary} bg-${theme.primaryLight}`
                        : `text-${theme.textSecondary} hover:text-${theme.primaryHover} hover:bg-${theme.hover}`
                    )}
                  >
                    {category}
                    <span className="ml-1 text-sm">▼</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        {hoveredCategory && (
          <div
            className={cn("absolute left-0 right-0 top-full shadow-xl border-t z-50", `bg-${theme.background}`, `border-${theme.borderLight}`)}
            onMouseEnter={() => setHoveredCategory(hoveredCategory)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-12 gap-8">
                {/* Product Categories */}
                <div className="col-span-9">
                  <div className="grid grid-cols-3 gap-8">
                    {Object.entries(productCategories[hoveredCategory]).map(([sectionTitle, productTypes]) => (
                      <div key={sectionTitle} className="space-y-4">
                        <h3 className={cn("text-sm font-bold uppercase tracking-wider border-b pb-2", `text-${theme.primaryDark}`, `border-${theme.borderLight}`)}>
                          {sectionTitle}
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(productTypes).map(([productType, skus]) => (
                            <div key={productType} className="space-y-2">
                              <h4 className={cn("text-sm font-semibold mb-2", `text-${theme.textPrimary}`)}>
                                {productType}
                              </h4>
                              <div className="space-y-1">
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
                                        'group flex items-center justify-between p-3 rounded-lg transition-all duration-200 border',
                                        isActive
                                          ? `bg-${theme.primaryLight} border-${theme.border} text-${theme.primaryDark}`
                                          : `hover:bg-${theme.hover} border-transparent hover:border-gray-200`
                                      )}
                                    >
                                      <div className="flex-1">
                                        <p className={cn(
                                          'text-sm font-medium truncate',
                                          isActive ? `text-${theme.primaryDark}` : `text-${theme.textPrimary}`
                                        )}>
                                          {product.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                          £{price}
                                        </p>
                                      </div>
                                      {isActive && (
                                        <Badge className={cn("ml-2 text-white text-xs", `bg-${theme.accent}`)}>
                                          Current
                                        </Badge>
                                      )}
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Featured Section */}
                <div className="col-span-3">
                  <div className={cn("bg-gradient-to-br rounded-lg p-6 h-full", `from-${theme.gradientFrom}`, `to-${theme.gradientTo}`)}>
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <h3 className={cn("text-lg font-bold mb-2", `text-${theme.primaryDark}`)}>
                          Design with AI
                        </h3>
                        <p className={cn("text-sm mb-4", `text-${theme.primary}`)}>
                          Create unique designs instantly with our AI-powered design tools.
                        </p>
                        <ul className={cn("text-xs space-y-1", `text-${theme.accent}`)}>
                          <li>• Text to image generation</li>
                          <li>• Style customization</li>
                          <li>• Multiple AI models</li>
                          <li>• Instant previews</li>
                        </ul>
                      </div>
                      <div className="mt-6">
                        <div className={cn("w-full h-24 rounded-md flex items-center justify-center", `bg-${theme.accentLight}`)}>
                          <span className={cn("text-xs font-medium", `text-${theme.accent}`)}>AI Design Preview</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}