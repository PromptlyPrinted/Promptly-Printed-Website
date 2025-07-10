import { ProductGrid } from '@/app/components/products/ProductGrid';
import { tshirtDetails } from '@/data/products';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Products | Promptly Printed',
  description: 'Explore our range of customizable apparel and accessories.',
});

export default function ProductsPage() {
  const products = Object.values(tshirtDetails).map(product => ({
    ...product,
    price: product.pricing.find(p => p.currency === 'USD')?.amount || 0,
  }));

  return (
    <div className="container mx-auto py-20">
      <h1 className="mb-8 font-bold text-4xl tracking-tight">Our Products</h1>
      <ProductGrid products={products} />
    </div>
  );
}
