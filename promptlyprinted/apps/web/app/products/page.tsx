import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Products | Promptly Printed',
  description: 'Explore our range of customizable apparel and accessories.',
});

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-20">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Product cards will go here */}
      </div>
    </div>
  );
} 