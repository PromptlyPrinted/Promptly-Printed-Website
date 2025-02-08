import { notFound } from 'next/navigation';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { ProductNav } from '@/app/components/products/ProductNav';
import { ProductList } from '@/app/components/products/ProductList';
import { ProductGrid } from '@/app/components/products/ProductGrid';
import { categoryData } from '@/app/components/products/productCategories';
import { database } from '@repo/database';

const PRODUCTS_PER_PAGE = 12;

interface ProductPageProps {
  params: {
    category: string;
  };
  searchParams?: {
    [key: string]: string | undefined;
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: ProductPageProps): Promise<Metadata> {
  const categoryParam = params.category;
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
  return Object.keys(categoryData).map(category => ({
    category,
  }));
}

export default async function ProductPage({
  params,
  searchParams = {},
}: ProductPageProps) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || '';
  const selectedCategory = searchParams.category || params.category || 'all';
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : 0;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : 1000;
  const sizes = searchParams.sizes ? searchParams.sizes.split(',') : [];
  const colors = searchParams.colors ? searchParams.colors.split(',') : [];
  const styles = searchParams.styles ? searchParams.styles.split(',') : [];
  const brands = searchParams.brands ? searchParams.brands.split(',') : [];
  const productTypes = searchParams.productTypes ? searchParams.productTypes.split(',') : [];
  const listed = searchParams.listed ? searchParams.listed === 'true' : true;
  const country = searchParams.country || 'US';
  const fulfillmentCountry = searchParams.fulfillmentCountry || 'all';

  // Get the current category data
  const currentCategory = categoryData[selectedCategory as keyof typeof categoryData] || categoryData.all;

  // If a specific category is selected (other than "all") try to fetch it
  let dbCategory = null;
  if (selectedCategory !== 'all') {
    // Here we assume selectedCategory is a numeric ID;
    // adjust accordingly if it might be a string key.
    dbCategory = await database.category.findFirst({
      where: { id: Number(selectedCategory) },
    });
  }

  // Build the filter clause for the query
  const whereClause: any = {
    listed,
    countryCode: country,
    ...(fulfillmentCountry !== 'all' ? { fulfillmentCountryCode: fulfillmentCountry } : {}),
    ...(selectedCategory !== 'all' && dbCategory ? { categoryId: dbCategory.id } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
    customerPrice: { gte: minPrice, lte: maxPrice },
    ...(sizes.length > 0 ? { size: { hasSome: sizes } } : {}),
    ...(colors.length > 0 ? { color: { hasSome: colors } } : {}),
    ...(styles.length > 0 ? { style: { in: styles } } : {}),
    ...(brands.length > 0 ? { brand: { in: brands } } : {}),
    ...(productTypes.length > 0 ? { productType: { in: productTypes } } : {}),
  };

  // Fetch products matching the filters
  const products = await database.product.findMany({
    where: whereClause,
    include: {
      category: true,
      images: {
        select: { url: true },
        take: 1,
      },
    },
    take: PRODUCTS_PER_PAGE,
    skip: (page - 1) * PRODUCTS_PER_PAGE,
    orderBy: { createdAt: 'desc' },
  });

  const totalProducts = await database.product.count({
    where: whereClause,
  });
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  const categories = await database.category.findMany({
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-8">
      <ProductNav />

      {/* Category Grid Section */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-[1400px] mx-auto">
            <ProductGrid
              title={currentCategory.title}
              description={currentCategory.description}
              categories={currentCategory.categories}
            />
          </div>
        </div>
      </section>

      {/* Product List Section */}
      <section className="bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Browse Products
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our collection of products in this category. Use the
                filters to find exactly what you're looking for.
              </p>
            </div>
            <ProductList
              products={products}
              categories={categories}
              currentPage={page}
              totalPages={totalPages}
              categoryId={dbCategory?.id}
            />
          </div>
        </div>
      </section>
    </div>
  );
}