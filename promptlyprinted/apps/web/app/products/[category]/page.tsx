import { notFound } from 'next/navigation';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { ProductNav } from '@/app/components/products/ProductNav';
import { ProductGrid } from '@/app/components/products/ProductGrid';
import { categoryData } from '@/app/components/products/productCategories';

interface ProductPageProps {
  params: {
    category: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const categoryParam = await Promise.resolve(params.category);
  const category = categoryData[categoryParam as keyof typeof categoryData];
  
  if (!category) {
    return {};
  }

  return createMetadata({
    title: category.title,
    description: category.description,
  });
}

export function generateStaticParams() {
  return Object.keys(categoryData).map((category) => ({
    category,
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const categoryParam = await Promise.resolve(params.category);
  const category = categoryData[categoryParam as keyof typeof categoryData];

  if (!category) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <ProductNav />
      <ProductGrid
        title={category.title}
        description={category.description}
        categories={category.categories}
      />
    </div>
  );
} 