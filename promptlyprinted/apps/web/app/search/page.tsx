import { ProductCard } from '@/app/components/products/ProductCard';
import { database } from '@repo/database';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface SearchPageProps {
  searchParams: Promise<{ q: string }>;
}

async function searchProducts(query: string) {
  const normalizedQuery = query.toLowerCase().trim();

  // Fetch all listed and active products from the database
  const allProducts = await database.product.findMany({
    where: {
      listed: true,
      isActive: true,
      countryCode: 'US',
    },
    include: {
      category: true,
    },
  });

  // Filter to show only parent products (not variants)
  const parentProducts = allProducts.filter(
    (p) => p.isVariantProduct || (!p.parentProductId && !p.isVariantProduct)
  );

  // Search through products
  return parentProducts.filter((product) => {
    const prodigiVariants = product.prodigiVariants as Record<string, any> | null;
    const colorOptions = prodigiVariants?.colorOptions || [];

    const searchableText = [
      product.name.toLowerCase(),
      (product.category?.name || '').toLowerCase(),
      (product.description || '').toLowerCase(),
      product.sku.toLowerCase(),
      ...colorOptions.map((opt: { name: string }) => opt.name.toLowerCase()),
      ...product.size.map((size: string) => size.toLowerCase()),
    ].join(' ');

    return searchableText.includes(normalizedQuery);
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query } = await searchParams;

  if (!query || query.trim() === '') {
    redirect('/');
  }

  const searchResults = await searchProducts(query);

  return (
    <div className="container mx-auto py-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Search className="h-6 w-6 text-gray-500" />
          <h1 className="text-3xl font-bold">Search Results</h1>
        </div>
        <p className="text-gray-600">
          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
        </p>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {searchResults.map((product) => {
            // Create clean slugs for the product
            const categoryName = product.category?.name || 'all';
            const categorySlug = categoryName.toLowerCase().replace(/[''"]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            const productSlug = product.name.toLowerCase().replace(/[''"]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

            const prodigiVariants = product.prodigiVariants as Record<string, any> | null;
            const imageUrls = prodigiVariants?.imageUrls as Record<string, string> | undefined;

            return (
              <Link key={product.sku} href={`/products/${categorySlug}/${productSlug}`}>
                <ProductCard
                  product={{
                    id: product.sku,
                    name: product.name,
                    description: product.description || '',
                    pricing: [{ amount: product.customerPrice || product.price, currency: product.currency }],
                    price: product.customerPrice || product.price,
                    shippingCost: product.shippingCost,
                    imageUrls: {
                      base: imageUrls?.base || '',
                      cover: imageUrls?.productImage || imageUrls?.cover || (imageUrls?.base ? `${imageUrls.base}/cover.png` : ''),
                      sizeChart: imageUrls?.sizeChart || '',
                    },
                    sku: product.sku,
                    category: product.category
                      ? {
                          id: product.category.id.toString(),
                          name: product.category.name,
                        }
                      : { id: 'all', name: 'All' },
                    specifications: {
                      dimensions: {
                        width: product.width,
                        height: product.height,
                        units: product.units,
                      },
                      brand: product.brand || '',
                      style: product.style,
                      color: product.color,
                      size: product.size,
                    },
                    prodigiVariants,
                    savedImages: [],
                    wishedBy: [],
                  }}
                />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mb-6">
            <Search className="mx-auto h-16 w-16 text-gray-300" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No results found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find any products matching "{query}". Try searching with different keywords.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Try searching for:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['T-shirts', 'Hoodies', 'Kids', 'Men', 'Women', 'Black', 'White'].map((suggestion) => (
                <Link
                  key={suggestion}
                  href={`/search?q=${encodeURIComponent(suggestion)}`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {suggestion}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 