import { tshirtDetails } from '@/data/products';
import { ProductCard } from '@/app/components/products/ProductCard';
import { Input } from '@repo/design-system/components/ui/input';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface SearchPageProps {
  searchParams: Promise<{ q: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query } = await searchParams;
  
  if (!query || query.trim() === '') {
    redirect('/');
  }

  // Normalize the search query
  const normalizedQuery = query.toLowerCase().trim();

  // Search through products
  const searchResults = Object.values(tshirtDetails).filter((product) => {
    const searchableText = [
      product.name.toLowerCase(),
      product.category.toLowerCase(),
      product.shortDescription.toLowerCase(),
      product.sku.toLowerCase(),
      ...product.colorOptions?.map(opt => opt.name.toLowerCase()) || [],
      ...product.size.map(size => size.toLowerCase()),
    ].join(' ');

    return searchableText.includes(normalizedQuery);
  });

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
            const categorySlug = product.category.toLowerCase().replace(/[''"]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            const productSlug = product.name.toLowerCase().replace(/[''"]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            
            return (
              <Link key={product.sku} href={`/products/${categorySlug}/${productSlug}`}>
                <ProductCard
                  product={{
                    id: product.sku,
                    name: product.name,
                    description: product.shortDescription,
                    pricing: product.pricing,
                    price: product.pricing.find((p) => p.currency === 'USD')?.amount || 0,
                    shippingCost: 0,
                    imageUrls: product.imageUrls,
                    sku: product.sku,
                    category: {
                      id: product.sku,
                      name: product.category,
                    },
                    specifications: {
                      dimensions: product.dimensions,
                      brand: product.brand?.name || '',
                      style: product.productType,
                      color: product.colorOptions?.map(opt => opt.name) || [],
                      size: product.size,
                    },
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