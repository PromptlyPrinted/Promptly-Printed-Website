'use client';

import { tshirtDetails } from '@/data/products';
import type { Product } from '@/types/product';
import { 
  Search, 
  Filter, 
  X, 
  Star,
  Heart,
  Eye,
  ShoppingCart,
  Grid3X3,
  List,
  SlidersHorizontal
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useCallback } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import { Slider } from '@repo/design-system/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';

// Enhanced Product interface for display
interface DisplayProduct extends Product {
  badge?: 'sale' | 'new' | 'bestseller';
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  isWishlisted: boolean;
}

// Brand color constants
const COLORS = {
  primary: '#4ECDC4',      // Primary teal
  secondary: '#7FDBDA',    // Secondary mint  
  accent: '#FF8C42',       // Accent orange
  dark: '#2C3E50',         // Dark navy
  lightMint: '#A8E6CF',    // Light mint
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

const categories = [
  { id: 'all', name: 'All Products', count: 0 },
  { id: 'mens', name: "Men's Apparel", count: 0 },
  { id: 'womens', name: "Women's Apparel", count: 0 },
  { id: 'kids', name: 'Kids & Babies', count: 0 },
  { id: 'accessories', name: 'Accessories', count: 0 },
  { id: 'home', name: 'Home & Living', count: 0 },
  { id: 'others', name: 'Others', count: 0 },
];

const brands = ['Promptly Printed', 'Premium Collection', 'Eco-Friendly Line'];
const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'bestseller', label: 'Bestseller' },
];

export default function ProductsPage() {
  // State management
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Convert tshirt details to DisplayProduct format
  const rawProducts = useMemo(() => {
    return Object.values(tshirtDetails).map((product, index): DisplayProduct => ({
      id: product.sku,
      name: product.name,
      description: product.shortDescription,
      category: { id: product.category, name: product.category },
      price: product.pricing.find(p => p.currency === 'USD')?.amount || 0,
      pricing: product.pricing,
      shippingCost: 0,
      imageUrls: product.imageUrls,
      sku: product.sku,
      specifications: product.specifications || undefined,
      prodigiVariants: product.prodigiVariants || undefined,
      savedImages: [],
      wishedBy: [],
      badge: index % 5 === 0 ? 'bestseller' : index % 7 === 0 ? 'new' : index % 3 === 0 ? 'sale' : undefined,
      originalPrice: index % 3 === 0 ? (product.pricing.find(p => p.currency === 'USD')?.amount || 0) * 1.2 : undefined,
      rating: 3.5 + (index % 3) * 0.5, // Random rating between 3.5-5
      reviewCount: 12 + (index * 7) % 89, // Random review count
      stock: index % 10 === 0 ? 2 : index % 15 === 0 ? 0 : 25 + (index * 3) % 50,
      isWishlisted: index % 8 === 0,
    }));
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = rawProducts;

    // Category filter
    if (!selectedCategories.includes('all')) {
      filtered = filtered.filter(product => {
        const category = product.category?.name?.toLowerCase() || '';
        return selectedCategories.some(cat => {
          switch (cat) {
            case 'mens': return category.includes('men');
            case 'womens': return category.includes('women');
            case 'kids': return category.includes('kids') || category.includes('baby');
            case 'accessories': return category.includes('accessories');
            case 'home': return category.includes('home');
            case 'others': return !category.includes('men') && !category.includes('women') && 
                                !category.includes('kids') && !category.includes('baby') &&
                                !category.includes('accessories') && !category.includes('home');
            default: return true;
          }
        });
      });
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search)
      );
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        selectedBrands.some(brand => product.name.includes(brand))
      );
    }

    // Price filter
    filtered = filtered.filter(product =>
      (product.price || 0) >= priceRange[0] && (product.price || 0) <= priceRange[1]
    );

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(product => product.rating >= minRating);
    }

    // Stock filter
    if (inStockOnly) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Sale filter
    if (onSaleOnly) {
      filtered = filtered.filter(product => product.badge === 'sale');
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b.name.localeCompare(a.name); // Simplified
        case 'bestseller':
          return (b.badge === 'bestseller' ? 1 : 0) - (a.badge === 'bestseller' ? 1 : 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [rawProducts, selectedCategories, searchTerm, selectedBrands, priceRange, minRating, inStockOnly, onSaleOnly, sortBy]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (!selectedCategories.includes('all')) count++;
    if (selectedBrands.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < 200) count++;
    if (minRating > 0) count++;
    if (inStockOnly) count++;
    if (onSaleOnly) count++;
    return count;
  }, [selectedCategories, selectedBrands, priceRange, minRating, inStockOnly, onSaleOnly]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedCategories(['all']);
    setSelectedBrands([]);
    setPriceRange([0, 200]);
    setMinRating(0);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSearchTerm('');
  }, []);

  // Toggle category
  const toggleCategory = useCallback((categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedCategories(['all']);
    } else {
      setSelectedCategories(prev => {
        const newCategories = prev.filter(c => c !== 'all');
        if (newCategories.includes(categoryId)) {
          const filtered = newCategories.filter(c => c !== categoryId);
          return filtered.length === 0 ? ['all'] : filtered;
        } else {
          return [...newCategories, categoryId];
        }
      });
    }
  }, []);

  // Toggle brand
  const toggleBrand = useCallback((brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: COLORS.gray50 }}>
      {/* Mobile Filters Overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold" style={{ color: COLORS.dark }}>Filters</h2>
              <Button variant="ghost" size="sm" onClick={() => setMobileFiltersOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto h-full pb-20">
              {/* Mobile filter content will go here */}
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: COLORS.dark }}>
                Products
              </h1>
              <p className="mt-1 text-sm" style={{ color: COLORS.gray600 }}>
                Discover and customize premium quality apparel
              </p>
            </div>
            
            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </div>

          {/* Search Bar and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: COLORS.gray400 }} />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                  style={{
                    backgroundColor: viewMode === 'grid' ? COLORS.primary : 'transparent',
                    color: viewMode === 'grid' ? COLORS.white : COLORS.gray600
                  }}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                  style={{
                    backgroundColor: viewMode === 'list' ? COLORS.primary : 'transparent',
                    color: viewMode === 'list' ? COLORS.white : COLORS.gray600
                  }}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Desktop Sidebar Toggle */}
              <Button
                variant="outline"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {sidebarOpen ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </div>

          {/* Active Filters Breadcrumbs */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 p-3 bg-white rounded-lg border" style={{ borderColor: COLORS.lightMint }}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium" style={{ color: COLORS.gray600 }}>
                  Active filters:
                </span>
                
                {!selectedCategories.includes('all') && selectedCategories.map(cat => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: COLORS.lightMint, 
                      color: COLORS.dark 
                    }}
                  >
                    {categories.find(c => c.id === cat)?.name}
                    <button onClick={() => toggleCategory(cat)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}

                {selectedBrands.map(brand => (
                  <span
                    key={brand}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: COLORS.lightMint, 
                      color: COLORS.dark 
                    }}
                  >
                    {brand}
                    <button onClick={() => toggleBrand(brand)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs"
                  style={{ color: COLORS.gray500 }}
                >
                  Clear all
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Layout */}
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          {sidebarOpen && (
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-6">
                <div className="bg-white rounded-lg border p-6 space-y-6" style={{ borderColor: COLORS.gray200 }}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold" style={{ color: COLORS.dark }}>
                      Filters
                    </h3>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                        Clear all
                      </Button>
                    )}
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: COLORS.dark }}>
                      Price Range
                    </h4>
                    <div className="space-y-3">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={200}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                          className="w-20 text-xs"
                          min="0"
                          max="200"
                        />
                        <span style={{ color: COLORS.gray400 }}>-</span>
                        <Input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          className="w-20 text-xs"
                          min="0"
                          max="200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: COLORS.dark }}>
                      Categories
                    </h4>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={category.id}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() => toggleCategory(category.id)}
                          />
                          <label
                            htmlFor={category.id}
                            className="text-sm cursor-pointer"
                            style={{ color: COLORS.gray700 }}
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Brands */}
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: COLORS.dark }}>
                      Brands
                    </h4>
                    <div className="space-y-2">
                      {brands.map((brand) => (
                        <div key={brand} className="flex items-center space-x-2">
                          <Checkbox
                            id={brand}
                            checked={selectedBrands.includes(brand)}
                            onCheckedChange={() => toggleBrand(brand)}
                          />
                          <label
                            htmlFor={brand}
                            className="text-sm cursor-pointer"
                            style={{ color: COLORS.gray700 }}
                          >
                            {brand}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: COLORS.dark }}>
                      Minimum Rating
                    </h4>
                    <div className="space-y-2">
                      {[4, 3, 2, 1].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                          className={`flex items-center gap-2 w-full p-2 rounded transition-colors ${
                            minRating === rating 
                              ? 'bg-primary bg-opacity-10' 
                              : 'hover:bg-gray-50'
                          }`}
                          style={{
                            backgroundColor: minRating === rating ? `${COLORS.primary}20` : undefined
                          }}
                        >
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= rating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm" style={{ color: COLORS.gray600 }}>
                            & Up
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: COLORS.dark }}>
                      Availability
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="in-stock"
                          checked={inStockOnly}
                          onCheckedChange={(checked) => setInStockOnly(checked === true)}
                        />
                        <label
                          htmlFor="in-stock"
                          className="text-sm cursor-pointer"
                          style={{ color: COLORS.gray700 }}
                        >
                          In Stock Only
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="on-sale"
                          checked={onSaleOnly}
                          onCheckedChange={(checked) => setOnSaleOnly(checked === true)}
                        />
                        <label
                          htmlFor="on-sale"
                          className="text-sm cursor-pointer"
                          style={{ color: COLORS.gray700 }}
                        >
                          On Sale
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm" style={{ color: COLORS.gray600 }}>
                Showing {filteredProducts.length} of {rawProducts.length} products
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <Search className="h-16 w-16 mx-auto" style={{ color: COLORS.gray300 }} />
                </div>
                <h3 className="text-lg font-medium mb-2" style={{ color: COLORS.gray900 }}>
                  No products found
                </h3>
                <p className="mb-4" style={{ color: COLORS.gray600 }}>
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearAllFilters} style={{ backgroundColor: COLORS.primary }}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div 
                className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    colors={COLORS}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Product Card Component
interface ProductCardProps {
  product: DisplayProduct;
  viewMode: 'grid' | 'list';
  colors: typeof COLORS;
}

function ProductCard({ product, viewMode, colors }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(product.isWishlisted);

  // Create product URL using the same logic as the existing ProductCard
  const categorySlug = createSlug(product.category?.name || 'all');
  const productSlug = createSlug(product.name);
  const productUrl = `/products/${categorySlug}/${productSlug}`;

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex gap-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            <Image
              src={product.imageUrls.cover}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
            />
            {product.badge && (
              <span 
                className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full"
                style={{
                  backgroundColor: product.badge === 'sale' ? colors.accent : 
                                 product.badge === 'new' ? colors.primary : colors.dark,
                  color: colors.white
                }}
              >
                {product.badge.toUpperCase()}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <Link href={productUrl}>
              <h3 className="text-lg font-medium hover:underline" style={{ color: colors.dark }}>
                {product.name}
              </h3>
            </Link>
            <p className="text-sm mt-1 line-clamp-2" style={{ color: colors.gray600 }}>
              {product.description}
            </p>
            
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm ml-1" style={{ color: colors.gray500 }}>
                ({product.reviewCount})
              </span>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold" style={{ color: colors.accent }}>
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm line-through" style={{ color: colors.gray400 }}>
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Quick View
                </Button>
                <Button 
                  size="sm"
                  style={{ backgroundColor: colors.primary, color: colors.white }}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white rounded-lg border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Link href={productUrl}>
          <Image
            src={product.imageUrls.cover}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Badges */}
        {product.badge && (
          <span 
            className="absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded-full z-10"
            style={{
              backgroundColor: product.badge === 'sale' ? colors.accent : 
                             product.badge === 'new' ? colors.primary : colors.dark,
              color: colors.white
            }}
          >
            {product.badge.toUpperCase()}
          </span>
        )}

        {/* Stock indicator */}
        {product.stock <= 5 && product.stock > 0 && (
          <span 
            className="absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-full"
            style={{ backgroundColor: colors.accent, color: colors.white }}
          >
            Only {product.stock} left
          </span>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-medium">Out of Stock</span>
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <Heart 
                className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
              />
            </button>
          </div>
          
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              className="w-full"
              style={{ backgroundColor: colors.primary, color: colors.white }}
              disabled={product.stock === 0}
            >
              <Eye className="h-4 w-4 mr-2" />
              Quick View
            </Button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link href={productUrl}>
          <h3 className="font-medium text-sm line-clamp-2 hover:underline" style={{ color: colors.dark }}>
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-3 w-3 ${
                star <= Math.floor(product.rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-xs ml-1" style={{ color: colors.gray500 }}>
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg" style={{ color: colors.accent }}>
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm line-through" style={{ color: colors.gray400 }}>
                ${product.originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button 
          className="w-full mt-3"
          size="sm"
          style={{ backgroundColor: colors.primary, color: colors.white }}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
}

// Utility function for creating slugs (same as before)
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/'/g, '') // Remove apostrophes
    .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}