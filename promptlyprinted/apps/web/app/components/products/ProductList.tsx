'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Slider } from '@repo/design-system/components/ui/slider';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { ScrollArea } from '@repo/design-system/components/ui/scroll-area';
import { Card } from '@repo/design-system/components/ui/card';
import Image from 'next/image';
import type { Product, Category } from '@repo/database';
import { ProductCard } from './ProductCard';

// Supported countries with their currencies
const SUPPORTED_COUNTRIES = [
  { code: 'US', currency: 'USD' },
  { code: 'GB', currency: 'GBP' },
  { code: 'DE', currency: 'EUR' },
  { code: 'AU', currency: 'AUD' },
  { code: 'FR', currency: 'EUR' },
  { code: 'CH', currency: 'CHF' },
  { code: 'SE', currency: 'SEK' },
  { code: 'AE', currency: 'AED' },
  { code: 'ES', currency: 'EUR' },
  { code: 'IT', currency: 'EUR' },
  { code: 'NL', currency: 'EUR' },
  { code: 'DK', currency: 'DKK' },
  { code: 'NO', currency: 'NOK' },
  { code: 'NZ', currency: 'NZD' },
  { code: 'IE', currency: 'EUR' },
  { code: 'KR', currency: 'KRW' },
  { code: 'JP', currency: 'JPY' },
  { code: 'BE', currency: 'EUR' },
  { code: 'SG', currency: 'SGD' },
  { code: 'CN', currency: 'CNY' },
];

interface ProductListProps {
  products: (Product & {
    category: Category | null;
    images: { url: string }[];
  })[];
  categories: Pick<Category, 'id' | 'name'>[];
  currentPage: number;
  totalPages: number;
  categoryId?: number;
}

export function ProductList({
  products,
  categories,
  currentPage,
  totalPages,
  categoryId,
}: ProductListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize filters from URL parameters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || 1000,
    sizes: (searchParams.get('sizes')?.split(',') || []).filter(Boolean),
    colors: (searchParams.get('colors')?.split(',') || []).filter(Boolean),
    styles: (searchParams.get('styles')?.split(',') || []).filter(Boolean),
    brands: (searchParams.get('brands')?.split(',') || []).filter(Boolean),
    productTypes: (searchParams.get('productTypes')?.split(',') || []).filter(Boolean),
    country: searchParams.get('country') || 'US',
    fulfillmentCountry: searchParams.get('fulfillmentCountry') || 'all',
    category: categoryId?.toString() || 'all',
  });

  const updateURLFilters = (updatedFilters: typeof filters, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update search params
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(key, value.join(','));
        } else {
          params.delete(key);
        }
      } else if (value !== '' && value !== 'all' && value !== 0) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    // Reset page when filters change if specified
    if (resetPage) {
      params.delete('page');
    }

    // Update URL without refreshing the page
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleInputChange = (filterKey: keyof typeof filters, value: any) => {
    const updatedFilters = { ...filters, [filterKey]: value };
    setFilters(updatedFilters);
    updateURLFilters(updatedFilters);
  };

  const handleCheckboxChange = (
    value: string,
    filterKey: 'sizes' | 'colors' | 'styles' | 'brands' | 'productTypes'
  ) => {
    const currentValues = filters[filterKey];
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    
    const updatedFilters = { ...filters, [filterKey]: updatedValues };
    setFilters(updatedFilters);
    updateURLFilters(updatedFilters);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Extract filter options from the product list
  const allSizes = Array.from(
    new Set(
      products.flatMap(p => p.size || [])
    )
  ).filter(Boolean);

  const allColors = Array.from(
    new Set(
      products.flatMap(p => p.color || [])
    )
  ).filter(Boolean);

  const allStyles = Array.from(
    new Set(products.map(p => p.style).filter(Boolean))
  );

  const allBrands = Array.from(
    new Set(products.map(p => p.brand).filter(Boolean))
  );

  const allProductTypes = Array.from(
    new Set(products.map(p => p.productType).filter(Boolean))
  );

  // Get all unique fulfillment countries
  const allFulfillmentCountries = Array.from(
    new Set(products.map(p => p.fulfillmentCountryCode || '').filter(Boolean))
  );

  // Get currency for selected country
  const selectedCurrency = SUPPORTED_COUNTRIES.find(c => c.code === filters.country)?.currency || 'USD';

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
      {/* Filters Panel */}
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Search</h3>
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Price Range</h3>
          <div className="space-y-4">
            <Slider
              min={0}
              max={1000}
              step={10}
              value={[filters.minPrice, filters.maxPrice]}
              onValueChange={([min, max]) => {
                handleInputChange('minPrice', min);
                handleInputChange('maxPrice', max);
              }}
            />
            <div className="flex justify-between">
              <span>${filters.minPrice}</span>
              <span>${filters.maxPrice}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Country</h3>
          <Select
            value={filters.country}
            onValueChange={(value) => handleInputChange('country', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.code} ({country.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Category</h3>
          <Select
            value={filters.category}
            onValueChange={(value) => handleInputChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.customerPrice}
              imageUrl={product.images[0]?.url || '/placeholder.jpg'}
              description={product.description}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}