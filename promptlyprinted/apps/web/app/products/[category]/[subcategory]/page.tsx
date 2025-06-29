import { ProductList } from '@/app/components/products/ProductList';
import { prisma } from '@/app/lib/db';
import {
  type ProductCategory,
  productCategories,
} from '@/app/lib/product-categories';
import { notFound } from 'next/navigation';

// Convert URL-friendly subcategory names to database category names
const subcategoryMapping: Record<string, string> = {
  't-shirts': 'T-Shirts',
  'tank-tops': 'Tank Tops',
  'long-sleeve-shirts': 'Long Sleeve Shirts',
  hoodies: 'Hoodies',
  sweatshirts: 'Sweatshirts',
  sweatpants: 'Sweatpants',
  shorts: 'Shorts',
  'coats-jackets': 'Coats & Jackets',
  dresses: 'Dresses',
  swimwear: 'Swimwear',
  sportswear: 'Sportswear',
};

export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: { category: string; subcategory: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { category, subcategory } = params;
  const page = Number(searchParams.page) || 1;
  const pageSize = 24;

  // Find the category and subcategory in our product categories data
  const categoryData = productCategories.find((cat: ProductCategory) => {
    const categorySlug = cat.href.split('/').pop();
    return categorySlug === category;
  });

  if (!categoryData) {
    notFound();
  }

  const subcategoryData = categoryData.subcategories?.find(
    (subcat: ProductCategory) => {
      const subcategorySlug = subcat.href.split('/').pop();
      return subcategorySlug === subcategory;
    }
  );

  if (!subcategoryData) {
    notFound();
  }

  // Get the database category name
  const dbSubcategory = subcategoryMapping[subcategory];
  if (!dbSubcategory) {
    notFound();
  }

  // Get all categories for the filter
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  // Build the query based on the category and subcategory
  const baseQuery = {
    where: {
      category: {
        name: dbSubcategory,
      },
      // Add parent category filter for apparel categories
      ...(category === 'mens' ||
      category === 'womens' ||
      category === 'kids-babies'
        ? { parentCategory: category.replace('-babies', '') }
        : {}),
    },
    include: {
      category: true,
      images: true,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  };

  // Get products with pagination
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany(baseQuery),
    prisma.product.count({ where: baseQuery.where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-4 font-bold text-4xl">{subcategoryData.title}</h1>
      <p className="mb-8 text-gray-600 text-lg">
        {`Browse our collection of ${subcategoryData.title.toLowerCase()} in the ${categoryData.title} category`}
      </p>
      <ProductList
        products={products}
        categories={categories}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}
