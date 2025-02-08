'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ProductCategoryCard } from './ProductCategoryCard';
import type { IconName } from './productCategories';

interface ProductCategory {
  title: string;
  href: string;
  iconName: IconName;
  id?: number;
}

interface ProductGridProps {
  title: string;
  description: string;
  categories: ProductCategory[];
  initialVisibleCount?: number;
}

export function ProductGrid({
  title,
  description,
  categories,
  initialVisibleCount = 4,
}: ProductGridProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleCategories = showAll ? categories : categories.slice(0, initialVisibleCount);

  return (
    <div className="container mx-auto py-20 px-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">{title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {visibleCategories.map((category) => (
            <ProductCategoryCard
              key={category.id}
              title={category.title}
              href={category.href}
              iconName={category.iconName}
              categoryId={category.id}
            />
          ))}
        </div>

        {categories.length > initialVisibleCount && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="gap-2"
            >
              {showAll ? (
                <>
                  Show Less <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show More <ChevronDown className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 