import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Products | Promptly Printed',
  description: 'Explore our range of customizable apparel and accessories.',
});

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-20">
      <h1 className="mb-8 font-bold text-4xl tracking-tight">Our Products</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Product cards will go here */}
      </div>
    </div>
  );
}
