import { ProductGrid } from '@/app/components/products/ProductGrid';
import { tshirtDetails } from '@/data/products';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const categoryName = params.category.replace(/-/g, ' ');
  return createMetadata({
    title: `${categoryName} | Products | Promptly Printed`,
    description: `Explore our range of ${categoryName}.`,
  });
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const normalizeString = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const categoryName = params.category.replace(/-/g, ' ');
  const normalizedCategoryName = normalizeString(categoryName);

  const products = Object.values(tshirtDetails)
    .filter((product) => normalizeString(product.category) === normalizedCategoryName)
    .map(product => ({
      ...product,
      price: product.pricing.find(p => p.currency === 'USD')?.amount || 0,
    }));

  return (
    <div className="container mx-auto py-20">
      <h1 className="mb-8 font-bold text-4xl tracking-tight">{categoryName}</h1>
      <ProductGrid products={products} />
    </div>
  );
}