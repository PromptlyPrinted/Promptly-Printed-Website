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

  // Initialize filter state from URL search params
  const initialFilters = {
    search: searchParams.get('search') || '',
    category:
      searchParams.get('category') || (categoryId ? String(categoryId) : 'all'),
    minPrice: searchParams.get('minPrice')
      ? Number(searchParams.get('minPrice'))
      : 0,
    maxPrice: searchParams.get('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : 1000,
    sizes: searchParams.get('sizes') ? searchParams.get('sizes')!.split(',') : [] as string[],
    colors: searchParams.get('colors') ? searchParams.get('colors')!.split(',') : [] as string[],
    styles: searchParams.get('styles') ? searchParams.get('styles')!.split(',') : [] as string[],
    brands: searchParams.get('brands') ? searchParams.get('brands')!.split(',') : [] as string[],
    productTypes: searchParams.get('productTypes')
      ? searchParams.get('productTypes')!.split(',')
      : [] as string[],
    listed: searchParams.get('listed')
      ? searchParams.get('listed') === 'true'
      : true,
    country: searchParams.get('country') || 'US',
    fulfillmentCountry: searchParams.get('fulfillmentCountry') || 'all',
  };

  const [filters, setFilters] = useState(initialFilters);

  // When any filter changes, update the URL so that the server re-fetches
  // the filtered data.
  const updateURLFilters = (updatedFilters: typeof filters, resetPage = true) => {
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(key, value.join(','));
        }
      } else {
        params.set(key, String(value));
      }
    });
    // Reset to page 1 when filters change
    if (resetPage) {
      params.set('page', '1');
    } else {
      params.set('page', String(currentPage));
    }
    router.push(`?${params.toString()}`);
  };

  const handleInputChange = (filterKey: keyof typeof filters, value: any) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
    updateURLFilters(newFilters);
  };

  const handleCheckboxChange = (
    value: string,
    filterKey: 'sizes' | 'colors' | 'styles' | 'brands' | 'productTypes'
  ) => {
    const currentValues = filters[filterKey] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    const newFilters = { ...filters, [filterKey]: newValues };
    setFilters(newFilters);
    updateURLFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
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
    <div className="flex gap-6">
      {/* Filters sidebar */}
      <div className="w-64 shrink-0">
        <ScrollArea className="h-[calc(100vh-6rem)] pr-4">
          <div className="space-y-6">
            {/* Country Selection */}
            <div className="space-y-2">
              <Label>Deliver To</Label>
              <Select
                value={filters.country}
                onValueChange={(value) => handleInputChange('country', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country">
                    {SUPPORTED_COUNTRIES.find(c => c.code === filters.country)?.code || 'US'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_COUNTRIES.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.code} ({country.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fulfillment Country */}
            <div className="space-y-2">
              <Label>Fulfilled From</Label>
              <Select
                value={filters.fulfillmentCountry}
                onValueChange={(value) => handleInputChange('fulfillmentCountry', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fulfillment country">
                    {filters.fulfillmentCountry === 'all' 
                      ? 'All Countries' 
                      : filters.fulfillmentCountry}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {allFulfillmentCountries.map(country => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                type="text"
                value={filters.search}
                onChange={(e) => handleInputChange('search', e.target.value)}
                placeholder="Search products..."
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category">
                    {filters.category === 'all'
                      ? 'All Categories'
                      : categories.find(c => String(c.id) === filters.category)?.name ||
                        'Select category'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label>Price Range ({selectedCurrency})</Label>
              <div className="pt-2">
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
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span>{selectedCurrency} {filters.minPrice}</span>
                  <span>{selectedCurrency} {filters.maxPrice}</span>
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-2">
              <Label>Sizes</Label>
              <div className="space-y-2">
                {allSizes.map(size => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${size}`}
                      checked={filters.sizes.includes(size)}
                      onCheckedChange={() => handleCheckboxChange(size, 'sizes')}
                    />
                    <label htmlFor={`size-${size}`} className="text-sm font-medium">
                      {size}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <Label>Colors</Label>
              <div className="space-y-2">
                {allColors.map(color => (
                  <div key={color} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color}`}
                      checked={filters.colors.includes(color)}
                      onCheckedChange={() => handleCheckboxChange(color, 'colors')}
                    />
                    <label htmlFor={`color-${color}`} className="text-sm font-medium">
                      {color}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Listed Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="listed"
                  checked={filters.listed}
                  onCheckedChange={(checked) => handleInputChange('listed', checked)}
                />
                <label htmlFor="listed" className="text-sm font-medium">
                  Listed Only
                </label>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Product grid */}
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <Card
              key={product.id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 transform hover:scale-105"
            >
              <div className="relative aspect-square">
                <Image
                  src={product.images[0]?.url || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-medium text-xl">
                    {selectedCurrency} {product.customerPrice.toFixed(2)}
                  </span>
                  {product.category && (
                    <span className="text-sm text-muted-foreground">
                      {product.category.name}
                    </span>
                  )}
                </div>
                {product.fulfillmentCountryCode && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Fulfilled from: {product.fulfillmentCountryCode}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No products found matching your criteria.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
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