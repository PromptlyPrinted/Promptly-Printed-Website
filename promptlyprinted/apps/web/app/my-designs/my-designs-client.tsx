'use client';

import Image from 'next/image';
import { Button } from '@repo/design-system/components/ui/button';
import { Eye, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Design = {
  id: string;
  url: string;
  name: string;
  productId: number | null;
  product: {
    name: string;
    sku: string;
    color: string | string[];
    category: any;
  } | null;
};

type MyDesignsClientProps = {
  designs: Design[];
};

export function MyDesignsClient({ designs }: MyDesignsClientProps) {
  const router = useRouter();

  const handleViewOnTShirt = (design: Design) => {
    if (design.product) {
      // Navigate to the product detail page with the design already applied
      const categoryName = design.product.category?.name || 'Mens';
      router.push(`/products/${categoryName}/${design.product.sku}?imageUrl=${encodeURIComponent(design.url)}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 font-semibold text-2xl">My Designs</h1>
      {designs.length === 0 ? (
        <p>You have no saved designs.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {designs.map((design) => (
            <div
              key={design.id}
              className="group overflow-hidden rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-lg"
            >
              <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
                <Image
                  src={design.url}
                  alt={design.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>

              <div className="mt-3 space-y-2">
                <p className="font-medium text-sm truncate">{design.name}</p>
                {design.product && (
                  <p className="text-xs text-gray-600">
                    {design.product.name} - {Array.isArray(design.product.color) ? design.product.color[0] : design.product.color}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleViewOnTShirt(design)}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View on T-Shirt
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
