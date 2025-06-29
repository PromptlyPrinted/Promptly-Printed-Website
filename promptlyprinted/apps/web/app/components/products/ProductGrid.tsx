'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
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
  const visibleCategories = showAll
    ? categories
    : categories.slice(0, initialVisibleCount);

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-bold text-4xl tracking-tight">{title}</h1>
          <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                  Show Less <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show More <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
