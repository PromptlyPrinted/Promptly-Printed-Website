import { ProductGrid } from '@/app/components/products/ProductGrid';
import { ProductList } from '@/app/components/products/ProductList';
import { ProductNav } from '@/app/components/products/ProductNav';
import { categoryData } from '@/app/components/products/productCategories';
import type { IconName } from '@/app/components/products/productCategories';
import { database } from '@repo/database';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';

const PRODUCTS_PER_PAGE = 12;

// Function to determine icon based on category name
function getCategoryIcon(categoryName: string): IconName {
  const name = categoryName.toLowerCase();

  // Apparel categories
  if (
    name.includes('t-shirt') ||
    name.includes('shirt') ||
    name.includes('hoodie') ||
    name.includes('sweatshirt') ||
    name.includes('jacket') ||
    name.includes('top') ||
    name.includes('pants') ||
    name.includes('shorts')
  ) {
    return 'shirt';
  }

  // Accessories & Electronics
  if (name.includes('bag')) return 'shopping-bag';
  if (name.includes('watch')) return 'watch';
  if (name.includes('pendant') || name.includes('key')) return 'key';
  if (
    name.includes('laptop') ||
    name.includes('computer') ||
    name.includes('tech')
  )
    return 'tablet';
  if (
    name.includes('mat') ||
    name.includes('sleeve') ||
    name.includes('sock') ||
    name.includes('flip-flop')
  )
    return 'ruler';

  // Home & Living
  if (name.includes('cushion')) return 'square';
  if (
    name.includes('board') ||
    name.includes('print') ||
    name.includes('poster')
  )
    return 'file-text';
  if (name.includes('prism')) return 'triangle';
  if (name.includes('decor') || name.includes('decoration')) return 'home';

  // Kitchen & Drinkware
  if (
    name.includes('drink') ||
    name.includes('mug') ||
    name.includes('cup') ||
    name.includes('kitchen') ||
    name.includes('dining')
  )
    return 'utensils';

  // Gaming & Entertainment
  if (name.includes('game') || name.includes('gaming')) return 'gamepad-2';
  if (name.includes('notebook')) return 'book';
  if (name.includes('book')) return 'book-open';

  // Pet Categories
  if (name.includes('pet')) return 'dog';

  // Art & Design
  if (name.includes('sticker')) return 'sticker';
  if (name.includes('tattoo')) return 'pen-tool';

  // Others
  if (name.includes('baby')) return 'baby';

  // Default icon for unknown categories
  return 'shirt';
}

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
  return Object.keys(categoryData).map((category) => ({
    category,
  }));
}

// Define the type for our category interface
interface CategoryWithIcon {
  id: number;
  title: string;
  href: string;
  iconName: IconName;
}

export default async function ProductPage({
  params,
  searchParams = {},
}: ProductPageProps) {
  // Await the params and searchParams
  const { category } = await Promise.resolve(params);
  const searchParamsResolved = await Promise.resolve(searchParams);

  const page = Number(searchParamsResolved.page) || 1;
  const search = searchParamsResolved.search || '';
  const selectedCategory = searchParamsResolved.category || category || 'all';
  const minPrice = searchParamsResolved.minPrice
    ? Number(searchParamsResolved.minPrice)
    : 0;
  const maxPrice = searchParamsResolved.maxPrice
    ? Number(searchParamsResolved.maxPrice)
    : 1000;
  const sizes = searchParamsResolved.sizes
    ? searchParamsResolved.sizes.split(',')
    : [];
  const colors = searchParamsResolved.colors
    ? searchParamsResolved.colors.split(',')
    : [];
  const styles = searchParamsResolved.styles
    ? searchParamsResolved.styles.split(',')
    : [];
  const brands = searchParamsResolved.brands
    ? searchParamsResolved.brands.split(',')
    : [];
  const productTypes = searchParamsResolved.productTypes
    ? searchParamsResolved.productTypes.split(',')
    : [];
  const listed = searchParamsResolved.listed
    ? searchParamsResolved.listed === 'true'
    : true;
  const country = searchParamsResolved.country || 'US';
  const fulfillmentCountry = searchParamsResolved.fulfillmentCountry || 'all';

  // Get the current category data
  const currentCategory =
    categoryData[selectedCategory as keyof typeof categoryData] ||
    categoryData.all;

  // Fetch all categories from the database
  const dbCategories = await database.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  // Group and map categories
  const processedCategories = dbCategories.reduce<CategoryWithIcon[]>(
    (acc, cat) => {
      const name = cat.name.toLowerCase();

      // Group tattoo categories
      if (name.includes('tattoo')) {
        if (acc.some((c: CategoryWithIcon) => c.title === 'Tattoos')) {
          return acc;
        }
        return [
          ...acc,
          {
            id: cat.id,
            title: 'Tattoos',
            href: `/products/${selectedCategory}`,
            iconName: 'pen-tool',
          },
        ];
      }

      // Group pet categories
      if (name.includes('pet')) {
        if (acc.some((c: CategoryWithIcon) => c.title === 'Pet Accessories')) {
          return acc;
        }
        return [
          ...acc,
          {
            id: cat.id,
            title: 'Pet Accessories',
            href: `/products/${selectedCategory}`,
            iconName: 'dog',
          },
        ];
      }

      // Group kitchen & drinkware categories
      if (
        name.includes('kitchen') ||
        name.includes('drink') ||
        name.includes('mug') ||
        name.includes('cup') ||
        name.includes('dining')
      ) {
        if (
          acc.some((c: CategoryWithIcon) => c.title === 'Kitchen & Drinkware')
        ) {
          return acc;
        }
        return [
          ...acc,
          {
            id: cat.id,
            title: 'Kitchen & Drinkware',
            href: `/products/${selectedCategory}`,
            iconName: 'utensils',
          },
        ];
      }

      // For all other categories, map them normally
      return [
        ...acc,
        {
          id: cat.id,
          title: cat.name,
          href: `/products/${selectedCategory}`,
          iconName: getCategoryIcon(cat.name),
        },
      ];
    },
    []
  );

  const mappedCategories = processedCategories;

  // If a specific category is selected (other than "all") try to fetch it
  let dbCategory = null;
  if (selectedCategory !== 'all') {
    const categoryId = Number.parseInt(selectedCategory);
    if (!isNaN(categoryId)) {
      dbCategory = await database.category.findFirst({
        where: { id: categoryId },
      });
    }
  }

  // Build the filter clause for the query
  const whereClause: any = {
    listed,
    countryCode: country,
    ...(fulfillmentCountry !== 'all'
      ? { fulfillmentCountryCode: fulfillmentCountry }
      : {}),
    ...(selectedCategory !== 'all' && dbCategory
      ? { categoryId: dbCategory.id }
      : {}),
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

  return (
    <div className="flex flex-col gap-8">
      <ProductNav />

      {/* Category Grid Section */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-[1400px]">
            <ProductGrid
              title={currentCategory.title}
              description={currentCategory.description}
              categories={mappedCategories}
            />
          </div>
        </div>
      </section>

      {/* Product List Section */}
      <section className="bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-bold text-3xl tracking-tight">
                Browse Products
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Explore our collection of products in this category. Use the
                filters to find exactly what you're looking for.
              </p>
            </div>
            <ProductList
              products={products}
              categories={dbCategories}
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
