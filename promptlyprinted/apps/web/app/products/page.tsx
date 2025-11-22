'use client';

import './products-background.css';
import type { Product } from '@/types/product';
import {
  Search,
  Filter,
  X,
  Star,
  Heart,
  Eye,
  Grid3X3,
  List,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  // Variant system
  isVariantProduct?: boolean;
  variantCount?: number;
  variantOptions?: Array<{
    optionName: string;
    optionValue: string;
    displayOrder: number;
  }>;
  variants?: Array<{
    id: number;
    sku: string;
    name: string;
    price: number;
    variantAttributes: any;
    stock: number;
  }>;
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

const subcategories = {
  mens: [
    { id: 'mens-classic-tee', name: 'Classic T-Shirt', count: 0 },
    { id: 'mens-vneck-tee', name: 'V-Neck T-Shirt', count: 0 },
    { id: 'mens-triblend-tee', name: 'Triblend T-Shirt', count: 0 },
    { id: 'mens-tank-top', name: 'Tank Top', count: 0 },
    { id: 'mens-long-sleeve', name: 'Long Sleeve', count: 0 },
  ],
  womens: [
    { id: 'womens-classic-tee', name: 'Classic T-Shirt', count: 0 },
    { id: 'womens-vneck-tee', name: 'V-Neck T-Shirt', count: 0 },
    { id: 'womens-fitted-tee', name: 'Fitted T-Shirt', count: 0 },
  ],
  kids: [
    { id: 'kids-tee', name: 'Kids T-Shirt', count: 0 },
    { id: 'baby-bodysuit', name: 'Baby Bodysuit', count: 0 },
    { id: 'baby-tee', name: 'Baby T-Shirt', count: 0 },
    { id: 'kids-sweatshirt', name: 'Kids Sweatshirt', count: 0 },
  ],
  accessories: [
    { id: 'bags', name: 'Bags', count: 0 },
    { id: 'watch-straps', name: 'Watch Straps', count: 0 },
    { id: 'mats-sleeves', name: 'Mats & Sleeves', count: 0 },
    { id: 'socks-flipflops', name: 'Socks & Flip-flops', count: 0 },
    { id: 'pendants-keyrings', name: 'Pendants & Keyrings', count: 0 },
  ],
  home: [
    { id: 'cushions', name: 'Cushions', count: 0 },
    { id: 'gallery-boards', name: 'Gallery Boards', count: 0 },
    { id: 'acrylic-prisms', name: 'Acrylic Prisms', count: 0 },
    { id: 'prints-posters', name: 'Prints & Posters', count: 0 },
  ],
  others: [
    { id: 'games', name: 'Games', count: 0 },
    { id: 'books', name: 'Books', count: 0 },
    { id: 'notebooks', name: 'Notebooks', count: 0 },
    { id: 'stickers', name: 'Stickers', count: 0 },
    { id: 'tattoos', name: 'Tattoos', count: 0 },
  ],
};

const colors = [
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'red', name: 'Red', hex: '#FF0000' },
  { id: 'navy', name: 'Navy', hex: '#000080' },
  { id: 'kelly-green', name: 'Kelly Green', hex: '#4CBB17' },
  { id: 'sun-yellow', name: 'Sun Yellow', hex: '#FFD700' },
  { id: 'royal-blue', name: 'Royal Blue', hex: '#4169E1' },
  { id: 'burgundy', name: 'Burgundy', hex: '#800020' },
  { id: 'sport-grey', name: 'Sports Grey', hex: '#808080' },
  { id: 'light-pink', name: 'Light Pink', hex: '#FFB6C1' },
  { id: 'vintage-white', name: 'Vintage White', hex: '#F5F5DC' },
  { id: 'french-navy', name: 'French Navy', hex: '#002654' },
  { id: 'bright-blue', name: 'Bright Blue', hex: '#0047AB' },
  { id: 'cotton-pink', name: 'Cotton Pink', hex: '#FFB3BA' },
  { id: 'glazed-green', name: 'Glazed Green', hex: '#8FBC8F' },
  { id: 'khaki', name: 'Khaki', hex: '#F0E68C' },
  { id: 'desert-dust', name: 'Desert Dust', hex: '#EDC9AF' },
  { id: 'ochre', name: 'Ochre', hex: '#CC7722' },
  { id: 'spectra-yellow', name: 'Spectra Yellow', hex: '#FFFF00' },
  { id: 'anthracite', name: 'Anthracite', hex: '#36454F' },
  { id: 'dark-heather-grey', name: 'Dark Heather Grey', hex: '#616161' },
  { id: 'india-ink-grey', name: 'India Ink Grey', hex: '#414A4C' },
  { id: 'stargazer', name: 'Stargazer', hex: '#4B0082' },
  { id: 'heather-mauve', name: 'Heather Mauve', hex: '#998FC7' },
  { id: 'military-green-triblend', name: 'Military Green Triblend', hex: '#4B5320' },
  { id: 'vintage-royal-triblend', name: 'Vintage Royal Triblend', hex: '#002FA7' },
  { id: 'light-blue', name: 'Light Blue', hex: '#ADD8E6' },
  { id: 'arctic-white', name: 'Arctic White', hex: '#F0F8FF' },
  { id: 'jet-black', name: 'Jet Black', hex: '#0A0A0A' },
  { id: 'charcoal', name: 'Charcoal', hex: '#36454F' },
  { id: 'heather-grey', name: 'Heather Grey', hex: '#D3D3D3' },
  { id: 'oxford-navy', name: 'Oxford Navy', hex: '#14213D' },
  { id: 'sky-blue', name: 'Sky Blue', hex: '#87CEEB' },
  { id: 'bottle-green', name: 'Bottle Green', hex: '#006A4E' },
];

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'bestseller', label: 'Bestseller' },
];

const IMAGE_PLACEHOLDER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

type ApiProductResponse = {
  id?: number | string;
  sku?: string;
  name: string;
  description?: string | null;
  pricing?: Array<{ amount: number; currency: string }>;
  price?: number | null;
  customerPrice?: number | null;
  currency?: string | null;
  shippingCost?: number | null;
  imageUrls?: {
    base?: string;
    cover?: string;
    sizeChart?: string;
    productImage?: string;
  };
  category?: {
    id?: number | string;
    name: string;
    description?: string | null;
  } | null;
  specifications?: Product['specifications'];
  prodigiVariants?: Product['prodigiVariants'];
  savedImages?: any[];
  wishedBy?: any[];
  stock?: number | null;
  // Variant system
  isVariantProduct?: boolean;
  variantCount?: number;
  variantOptions?: Array<{
    optionName: string;
    optionValue: string;
    displayOrder: number;
  }>;
  variants?: Array<{
    id: number;
    sku: string;
    name: string;
    price: number;
    variantAttributes: any;
    stock: number;
  }>;
};

// No fallback products - only show products from database that are listed and active
const FALLBACK_PRODUCTS: DisplayProduct[] = [];

function buildProductsFromApi(products: ApiProductResponse[]): DisplayProduct[] {
  return products.map((product, index) => {
    const price =
      product.customerPrice ??
      product.price ??
      product.pricing?.[0]?.amount ??
      0;
    const currency =
      product.currency ?? product.pricing?.[0]?.currency ?? 'USD';
    const imageBase =
      product.prodigiVariants?.imageUrls?.base ||
      product.imageUrls?.base ||
      '';
    const coverImage =
      product.imageUrls?.cover ||
      product.imageUrls?.productImage ||
      (imageBase ? `${imageBase}/cover.png` : '');

    return {
      id:
        (typeof product.id === 'number'
          ? product.id.toString()
          : product.id) ||
        product.sku ||
        `product-${index}`,
      name: product.name,
      description: product.description || '',
      category: product.category
        ? {
            id:
              (typeof product.category.id === 'number'
                ? product.category.id.toString()
                : product.category.id) || product.category.name,
            name: product.category.name,
            description: product.category.description ?? undefined,
          }
        : { id: 'uncategorized', name: 'Uncategorized' },
      price,
      pricing:
        product.pricing && product.pricing.length > 0
          ? product.pricing
          : [{ amount: price, currency }],
      shippingCost: product.shippingCost ?? 0,
      imageUrls: {
        base: imageBase,
        cover: coverImage,
        sizeChart: product.imageUrls?.sizeChart || '',
      },
      sku: product.sku,
      specifications: product.specifications ?? undefined,
      prodigiVariants: product.prodigiVariants ?? undefined,
      savedImages: product.savedImages ?? [],
      wishedBy: product.wishedBy ?? [],
      badge:
        index % 5 === 0
          ? 'bestseller'
          : index % 7 === 0
            ? 'new'
            : index % 3 === 0
              ? 'sale'
              : undefined,
      originalPrice: index % 3 === 0 ? price * 1.2 : undefined,
      rating: 3.5 + (index % 3) * 0.5,
      reviewCount: 12 + (index * 7) % 89,
      stock:
        product.stock ??
        (index % 10 === 0
          ? 2
          : index % 15 === 0
            ? 0
            : 25 + ((index * 3) % 50)),
      isWishlisted: false,
      // Variant system
      isVariantProduct: product.isVariantProduct ?? false,
      variantCount: product.variantCount ?? 0,
      variantOptions: product.variantOptions ?? [],
      variants: product.variants ?? [],
    };
  });
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Initialize state from URL parameters
  const getInitialCategory = () => {
    const category = searchParams.get('category');
    if (category) {
      return [category];
    }
    return ['all'];
  };

  // State management
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(getInitialCategory);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [showAllColors, setShowAllColors] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const priceInitialized = useRef(false);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Products (API backed with fallback)
  const [rawProducts, setRawProducts] = useState<DisplayProduct[]>(() => [
    ...FALLBACK_PRODUCTS,
  ]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        const response = await fetch('/api/products/list', {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = await response.json();
        const fetchedProducts = Array.isArray(data.products)
          ? buildProductsFromApi(data.products)
          : [];

        if (!cancelled) {
          priceInitialized.current = false;
          setRawProducts(fetchedProducts);
          setLoadError(null);
        }
      } catch (error) {
        console.error('Failed to fetch products list:', error);
        if (!cancelled) {
          priceInitialized.current = false;
          setRawProducts([]);
          setLoadError(
            'Unable to fetch products. Please try again later.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProducts(false);
        }
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate dynamic price range from products
  const { minPrice, maxPrice } = useMemo(() => {
    const prices = rawProducts.map(p => p.price || 0).filter(p => p > 0);
    if (prices.length === 0) {
      return { minPrice: 0, maxPrice: 200 };
    }
    return {
      minPrice: Math.floor(Math.min(...prices)),
      maxPrice: Math.ceil(Math.max(...prices))
    };
  }, [rawProducts]);

  // Initialize price range state with dynamic values
  useEffect(() => {
    if (!priceInitialized.current && minPrice >= 0 && maxPrice > minPrice) {
      setPriceRange([minPrice, maxPrice]);
      priceInitialized.current = true;
    }
  }, [minPrice, maxPrice]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = rawProducts;

    // Category filter
    if (!selectedCategories.includes('all')) {
      filtered = filtered.filter(product => {
        const categoryName = product.category?.name?.toLowerCase() || '';
        const productName = product.name?.toLowerCase() || '';
        return selectedCategories.some(cat => {
          switch (cat) {
            case 'mens':
              return (categoryName.includes("men's") ||
                     (categoryName.includes('men') && !categoryName.includes('women')) ||
                     productName.includes("men's") ||
                     (productName.includes('men') && !productName.includes('women')));
            case 'womens':
              return (categoryName.includes("women's") ||
                     categoryName.includes('women') ||
                     productName.includes("women's") ||
                     productName.includes('women'));
            case 'kids':
              return (categoryName.includes('kids') ||
                     categoryName.includes('baby') ||
                     categoryName.includes('kid') ||
                     productName.includes('kids') ||
                     productName.includes('kid'));
            case 'accessories': return categoryName.includes('accessories');
            case 'home': return categoryName.includes('home');
            case 'others': {
              const isMens = categoryName.includes("men's") || (categoryName.includes('men') && !categoryName.includes('women')) || productName.includes("men's") || (productName.includes('men') && !productName.includes('women'));
              const isWomens = categoryName.includes("women's") || categoryName.includes('women') || productName.includes("women's") || productName.includes('women');
              const isKids = categoryName.includes('kids') || categoryName.includes('baby') || categoryName.includes('kid') || productName.includes('kids') || productName.includes('kid');
              const isAccessories = categoryName.includes('accessories');
              const isHome = categoryName.includes('home');
              return !isMens && !isWomens && !isKids && !isAccessories && !isHome;
            }
            default: return true;
          }
        });
      });
    }

    // Subcategory filter
    if (selectedSubcategories.length > 0) {
      filtered = filtered.filter(product => {
        const productType = product.id.toLowerCase();
        const productName = product.name.toLowerCase();
        return selectedSubcategories.some(subcat => {
          switch (subcat) {
            case 'mens-classic-tee': 
            case 'womens-classic-tee': 
              return productType.includes('tee') && !productName.includes('v-neck') && !productName.includes('triblend');
            case 'mens-vneck-tee':
            case 'womens-vneck-tee': 
              return productName.includes('v-neck');
            case 'mens-triblend-tee': 
              return productName.includes('triblend');
            case 'mens-tank-top': 
              return productName.includes('tank');
            case 'mens-long-sleeve': 
              return productName.includes('long sleeve');
            case 'womens-fitted-tee': 
              return productName.includes('fitted');
            case 'kids-tee': 
              return productName.includes('kids') && productName.includes('t-shirt');
            case 'baby-bodysuit': 
              return productName.includes('bodysuit');
            case 'baby-tee': 
              return productName.includes('baby') && productName.includes('t-shirt');
            case 'kids-sweatshirt': 
              return productName.includes('kids') && productName.includes('sweatshirt');
            default: return true;
          }
        });
      });
    }

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product => {
        const prodigiColorNames =
          product.prodigiVariants?.colorOptions?.map(color =>
            color.name.toLowerCase()
          ) || [];
        const specificationColors =
          product.specifications?.color?.map(color =>
            color.toLowerCase()
          ) || [];
        const allProductColors = new Set([
          ...prodigiColorNames,
          ...specificationColors,
        ]);

        return selectedColors.some(selectedColor => {
          const paletteColor =
            colors.find(c => c.id === selectedColor)?.name.toLowerCase() || '';
          if (!paletteColor) {
            return false;
          }
          return Array.from(allProductColors).some(productColor =>
            productColor.includes(paletteColor) ||
            paletteColor.includes(productColor)
          );
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
      // Helper to get category order
      const getCategoryOrder = (product: DisplayProduct) => {
        const categoryName = product.category?.name?.toLowerCase() || '';
        const productName = product.name?.toLowerCase() || '';

        // Check Men's first (before Women's to avoid "women" matching "men")
        if (categoryName.includes("men's") || (categoryName.includes('men') && !categoryName.includes('women')) ||
            productName.includes("men's") || (productName.includes('men') && !productName.includes('women'))) return 0;

        // Check Women's
        if (categoryName.includes("women's") || categoryName.includes('women') ||
            productName.includes("women's") || productName.includes('women')) return 1;

        // Check Kids
        if (categoryName.includes('kids') || categoryName.includes('baby') || categoryName.includes('kid') ||
            productName.includes('kids') || productName.includes('kid')) return 2;

        // Check Accessories
        if (categoryName.includes('accessories') || categoryName.includes('watch') || categoryName.includes('bag') ||
            categoryName.includes('mat') || categoryName.includes('sleeve') || categoryName.includes('sock') ||
            categoryName.includes('flip') || categoryName.includes('keyring') || categoryName.includes('pendant')) return 3;

        // Check Home & Living
        if (categoryName.includes('home') || categoryName.includes('cushion') || categoryName.includes('gallery') ||
            categoryName.includes('acrylic') || categoryName.includes('print') || categoryName.includes('poster') ||
            categoryName.includes('mug') || categoryName.includes('cutting board')) return 4;

        return 5; // Others
      };

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
          // Default 'relevance' - sort by category order first, then by name
          const categoryDiff = getCategoryOrder(a) - getCategoryOrder(b);
          if (categoryDiff !== 0) return categoryDiff;
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [rawProducts, selectedCategories, selectedSubcategories, selectedColors, searchTerm, priceRange, minRating, inStockOnly, onSaleOnly, sortBy]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (!selectedCategories.includes('all')) count++;
    if (selectedSubcategories.length > 0) count++;
    if (selectedColors.length > 0) count++;
    if (priceRange[0] > minPrice || priceRange[1] < maxPrice) count++;
    if (minRating > 0) count++;
    if (inStockOnly) count++;
    if (onSaleOnly) count++;
    return count;
  }, [selectedCategories, selectedSubcategories, selectedColors, priceRange, minRating, inStockOnly, onSaleOnly, minPrice, maxPrice]);

  // Update URL with current filters
  const updateURL = useCallback((filters: {
    categories?: string[];
    search?: string;
    brands?: string[];
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    inStock?: boolean;
    onSale?: boolean;
    sort?: string;
  }) => {
    const params = new URLSearchParams(searchParams);
    
    // Update category
    if (filters.categories && !filters.categories.includes('all')) {
      params.set('category', filters.categories[0]);
    } else {
      params.delete('category');
    }
    
    // Update search
    if (filters.search) {
      params.set('search', filters.search);
    } else {
      params.delete('search');
    }
    
    // Update other filters
    if (filters.brands && filters.brands.length > 0) {
      params.set('brands', filters.brands.join(','));
    } else {
      params.delete('brands');
    }
    
    if (filters.priceMin !== undefined && filters.priceMin > minPrice) {
      params.set('priceMin', filters.priceMin.toString());
    } else {
      params.delete('priceMin');
    }
    
    if (filters.priceMax !== undefined && filters.priceMax < maxPrice) {
      params.set('priceMax', filters.priceMax.toString());
    } else {
      params.delete('priceMax');
    }
    
    if (filters.rating && filters.rating > 0) {
      params.set('rating', filters.rating.toString());
    } else {
      params.delete('rating');
    }
    
    if (filters.inStock) {
      params.set('inStock', 'true');
    } else {
      params.delete('inStock');
    }
    
    if (filters.onSale) {
      params.set('onSale', 'true');
    } else {
      params.delete('onSale');
    }
    
    if (filters.sort && filters.sort !== 'relevance') {
      params.set('sort', filters.sort);
    } else {
      params.delete('sort');
    }
    
    router.push(`/products?${params.toString()}`, { scroll: false });
  }, [searchParams, router, minPrice, maxPrice]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedCategories(['all']);
    setSelectedSubcategories([]);
    setSelectedColors([]);
    setShowAllColors(false);
    setPriceRange([minPrice, maxPrice]);
    priceInitialized.current = true;
    setMinRating(0);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSearchTerm('');
    router.push('/products', { scroll: false });
  }, [router, minPrice, maxPrice]);

  // Toggle category
  const toggleCategory = useCallback((categoryId: string) => {
    let newCategories: string[];
    if (categoryId === 'all') {
      newCategories = ['all'];
    } else {
      const currentCategories = selectedCategories.filter(c => c !== 'all');
      if (currentCategories.includes(categoryId)) {
        const filtered = currentCategories.filter(c => c !== categoryId);
        newCategories = filtered.length === 0 ? ['all'] : filtered;
      } else {
        newCategories = [...currentCategories, categoryId];
      }
    }
    setSelectedCategories(newCategories);
    updateURL({ categories: newCategories });
  }, [selectedCategories, updateURL]);

  // Toggle subcategory
  const toggleSubcategory = useCallback((subcategory: string) => {
    const newSubcategories = selectedSubcategories.includes(subcategory)
      ? selectedSubcategories.filter(s => s !== subcategory)
      : [...selectedSubcategories, subcategory];
    setSelectedSubcategories(newSubcategories);
    // Note: URL update could be added here if needed
  }, [selectedSubcategories]);

  // Toggle color
  const toggleColor = useCallback((color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    setSelectedColors(newColors);
    // Note: URL update could be added here if needed
  }, [selectedColors]);

  // Add effect to sync URL changes with state
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    
    if (category && !selectedCategories.includes(category)) {
      setSelectedCategories([category]);
    }
    if (search && search !== searchTerm) {
      setSearchTerm(search);
    }
    if (sort && sort !== sortBy) {
      setSortBy(sort);
    }
  }, [searchParams, selectedCategories, searchTerm, sortBy]);

  return (
    <div className="min-h-screen product-grid-background">
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
      <div className="mx-auto max-w-7xl px-4 py-6 product-grid-container">
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  updateURL({ search: e.target.value });
                }}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={(value) => { setSortBy(value); updateURL({ sort: value }); }}>
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

                {selectedSubcategories.map(subcat => (
                  <span
                    key={subcat}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: COLORS.lightMint, 
                      color: COLORS.dark 
                    }}
                  >
                    {Object.values(subcategories).flat().find(s => s.id === subcat)?.name}
                    <button onClick={() => toggleSubcategory(subcat)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}

                {selectedColors.map(colorId => (
                  <span
                    key={colorId}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: COLORS.lightMint,
                      color: COLORS.dark
                    }}
                  >
                    {colors.find(c => c.id === colorId)?.name}
                    <button onClick={() => toggleColor(colorId)}>
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
                        onValueChange={(value) => {
                          setPriceRange(value);
                          updateURL({ priceMin: value[0], priceMax: value[1] });
                        }}
                        max={maxPrice}
                        min={minPrice}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => {
                            const newRange = [Number(e.target.value), priceRange[1]];
                            setPriceRange(newRange);
                            updateURL({ priceMin: newRange[0], priceMax: newRange[1] });
                          }}
                          className="w-20 text-xs"
                          min={minPrice.toString()}
                          max={maxPrice.toString()}
                        />
                        <span style={{ color: COLORS.gray400 }}>-</span>
                        <Input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => {
                            const newRange = [priceRange[0], Number(e.target.value)];
                            setPriceRange(newRange);
                            updateURL({ priceMin: newRange[0], priceMax: newRange[1] });
                          }}
                          className="w-20 text-xs"
                          min={minPrice.toString()}
                          max={maxPrice.toString()}
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

                  {/* Subcategories */}
                  {selectedCategories.some(cat => cat !== 'all' && subcategories[cat as keyof typeof subcategories]) && (
                    <div>
                      <h4 className="text-sm font-medium mb-3" style={{ color: COLORS.dark }}>
                        Product Types
                      </h4>
                      <div className="space-y-2">
                        {selectedCategories.filter(cat => cat !== 'all').map(cat => 
                          subcategories[cat as keyof typeof subcategories] || []
                        ).flat().map((subcategory) => (
                          <div key={subcategory.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={subcategory.id}
                              checked={selectedSubcategories.includes(subcategory.id)}
                              onCheckedChange={() => toggleSubcategory(subcategory.id)}
                            />
                            <label
                              htmlFor={subcategory.id}
                              className="text-sm cursor-pointer"
                              style={{ color: COLORS.gray700 }}
                            >
                              {subcategory.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Colors */}
                  <div>
                    <h4 className="text-sm font-medium mb-3" style={{ color: COLORS.dark }}>
                      Colors
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {(showAllColors ? colors : colors.slice(0, 16)).map((color) => (
                        <button
                          key={color.id}
                          onClick={() => toggleColor(color.id)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            selectedColors.includes(color.id) 
                              ? 'ring-2 ring-offset-2 ring-primary' 
                              : 'hover:scale-110'
                          }`}
                          style={{ 
                            backgroundColor: color.hex,
                            borderColor: selectedColors.includes(color.id) ? COLORS.primary : COLORS.gray300
                          }}
                          title={color.name}
                        />
                      ))}
                    </div>
                    {colors.length > 16 && (
                      <div className="mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          style={{ color: COLORS.gray500 }}
                          onClick={() => setShowAllColors(!showAllColors)}
                        >
                          {showAllColors ? 'Show fewer colors' : `Show all colors (${colors.length})`}
                        </Button>
                      </div>
                    )}
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
                          onClick={() => {
                            const newRating = minRating === rating ? 0 : rating;
                            setMinRating(newRating);
                            updateURL({ rating: newRating });
                          }}
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
                          onCheckedChange={(checked) => {
                            const newValue = checked === true;
                            setInStockOnly(newValue);
                            updateURL({ inStock: newValue });
                          }}
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
                          onCheckedChange={(checked) => {
                            const newValue = checked === true;
                            setOnSaleOnly(newValue);
                            updateURL({ onSale: newValue });
                          }}
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
            {loadError && (
              <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                {loadError}
              </div>
            )}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm" style={{ color: COLORS.gray600 }}>
                {isLoadingProducts
                  ? 'Loading products...'
                  : `Showing ${filteredProducts.length} of ${rawProducts.length} products`}
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
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedVariantOptions, setSelectedVariantOptions] = useState<Record<string, string>>({});
  const [showColorOptions, setShowColorOptions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  const formatColorForUrl = (colorName: string) =>
    colorName.replace(/\s+/g, '-').toLowerCase();

  // Separate variant options into color/finish vs other attributes (size, shape, pieces, type)
  const variantColorOptions = product.isVariantProduct && product.variantOptions
    ? product.variantOptions
        .filter(opt =>
          opt.optionName.toLowerCase() === 'color' ||
          opt.optionName.toLowerCase() === 'finish'
        )
        .map(opt => ({
          name: opt.optionValue,
          filename: `${formatColorForUrl(opt.optionValue)}.png`,
        }))
    : [];

  // Get non-color variant options (size, shape, pieces, type, etc.)
  const nonColorVariantOptions = product.isVariantProduct && product.variantOptions
    ? product.variantOptions.filter(opt =>
        opt.optionName.toLowerCase() !== 'color' &&
        opt.optionName.toLowerCase() !== 'finish'
      )
    : [];

  // Group non-color options by option name
  const groupedVariantOptions = nonColorVariantOptions.reduce((acc, opt) => {
    if (!acc[opt.optionName]) {
      acc[opt.optionName] = [];
    }
    if (!acc[opt.optionName].includes(opt.optionValue)) {
      acc[opt.optionName].push(opt.optionValue);
    }
    return acc;
  }, {} as Record<string, string[]>);

  // If this is a variant product, ONLY show colors if it has color/finish options
  // Don't fall back to template colors for variant products
  const colorOptions = product.isVariantProduct
    ? variantColorOptions
    : (product.prodigiVariants?.colorOptions ??
       product.specifications?.color?.map((name) => ({
         name,
         filename: `${formatColorForUrl(name)}.png`,
       })) ??
       []);
  const imageBase =
    product.prodigiVariants?.imageUrls?.base || product.imageUrls.base;
  const defaultImage =
    product.imageUrls.cover ||
    (imageBase
      ? `${imageBase}/cover.png`
      : product.imageUrls.base || IMAGE_PLACEHOLDER);
  const selectedColorLabel = selectedColor
    ? selectedColor.replace(/-/g, ' ')
    : null;
  const prettySelectedColor = selectedColorLabel
    ? selectedColorLabel.replace(/\b\w/g, (letter) => letter.toUpperCase())
    : null;

  // Find matching variant based on selected options
  const getMatchingVariant = () => {
    if (!product.isVariantProduct || !product.variants || product.variants.length === 0) {
      return null;
    }

    // Build the selection criteria including color/finish
    const selectedAttributes: Record<string, string> = { ...selectedVariantOptions };
    if (selectedColor) {
      // Check if we have a color or finish option
      const hasColorOption = variantColorOptions.some(opt =>
        formatColorForUrl(opt.name) === selectedColor
      );
      if (hasColorOption) {
        const colorOpt = variantColorOptions.find(opt => formatColorForUrl(opt.name) === selectedColor);
        if (colorOpt) {
          // Determine if it's a color or finish based on variant options
          const isFinish = product.variantOptions?.some(opt =>
            opt.optionName.toLowerCase() === 'finish' && opt.optionValue === colorOpt.name
          );
          selectedAttributes[isFinish ? 'finish' : 'color'] = colorOpt.name;
        }
      }
    }

    // Only search if we have selections
    if (Object.keys(selectedAttributes).length === 0) {
      return null;
    }

    // Find variant that matches all selected attributes
    return product.variants.find(variant => {
      const variantAttrs = variant.variantAttributes as Record<string, string> | null;
      if (!variantAttrs) return false;

      return Object.entries(selectedAttributes).every(([key, value]) => {
        const normalizedKey = key.toLowerCase();
        const variantValue = variantAttrs[normalizedKey] || variantAttrs[key];
        return variantValue && variantValue.toLowerCase() === value.toLowerCase();
      });
    });
  };

  const matchingVariant = getMatchingVariant();
  const displayPrice = matchingVariant ? matchingVariant.price : product.price;
  
  // Create product URL using the same logic as the existing ProductCard
  const categorySlug = createSlug(product.category?.name || 'all');
  const productSlug = createSlug(product.name);
  const productUrl = `/products/${categorySlug}/${productSlug}`;
  
  // Get current image based on selected color or current index
  const getCurrentImage = () => {
    if (selectedColor && imageBase) {
      const colorOption = colorOptions.find(
        (option) => formatColorForUrl(option.name) === selectedColor
      );
      if (colorOption) {
        const filename =
          'filename' in colorOption && colorOption.filename
            ? colorOption.filename
            : `${formatColorForUrl(colorOption.name)}.png`;
        return `${imageBase}/${filename}`;
      }
    }

    if (isHovered && !selectedColor && colorOptions.length > 0 && imageBase) {
      const currentColorOption = colorOptions[currentColorIndex];
      if (currentColorOption) {
        const filename =
          'filename' in currentColorOption && currentColorOption.filename
            ? currentColorOption.filename
            : `${formatColorForUrl(currentColorOption.name)}.png`;
        return `${imageBase}/${filename}`;
      }
    }

    // Debug: log the default image being used
    if (typeof window !== 'undefined' && !defaultImage) {
      console.warn(`No default image for product: ${product.name}`, {
        cover: product.imageUrls?.cover,
        base: product.imageUrls?.base,
        imageBase,
        defaultImage
      });
    }

    // Ensure we always return a valid image path, never empty string
    return defaultImage || IMAGE_PLACEHOLDER;
  };
  
  // Handle color selection
  const handleColorSelect = (colorName: string) => {
    const formattedColorName = formatColorForUrl(colorName);
    setSelectedColor(selectedColor === formattedColorName ? null : formattedColorName);
    // Update the current color index to match the selected color
    const colorIndex = colorOptions.findIndex(c => formatColorForUrl(c.name) === formattedColorName);
    if (colorIndex !== -1) {
      setCurrentColorIndex(colorIndex);
    }
  };

  // Navigation functions
  const handlePrevColor = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = currentColorIndex === 0 ? colorOptions.length - 1 : currentColorIndex - 1;
    setCurrentColorIndex(newIndex);
    // Set the selected color to the new current color (formatted)
    if (colorOptions[newIndex]) {
      setSelectedColor(formatColorForUrl(colorOptions[newIndex].name));
    }
  };

  const handleNextColor = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = currentColorIndex === colorOptions.length - 1 ? 0 : currentColorIndex + 1;
    setCurrentColorIndex(newIndex);
    // Set the selected color to the new current color (formatted)
    if (colorOptions[newIndex]) {
      setSelectedColor(formatColorForUrl(colorOptions[newIndex].name));
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border hover:shadow-lg transition-all duration-300">
        <div className="flex gap-6 p-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            <Link href={selectedColor ? `${productUrl}?color=${encodeURIComponent(selectedColor)}` : productUrl}>
              <Image
                src={getCurrentImage()}
                alt={product.name}
                fill
                className="object-contain rounded-lg group-hover:scale-[1.03] transition-all duration-300"
              />
            </Link>
            <div className="absolute top-2 left-2 flex flex-col gap-2">
              {product.badge && (
                <span
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: product.badge === 'sale' ? colors.accent :
                                   product.badge === 'new' ? colors.primary : colors.dark,
                    color: colors.white
                  }}
                >
                  {product.badge.toUpperCase()}
                </span>
              )}
              {product.isVariantProduct && product.variantCount && product.variantCount > 0 && (
                <span
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: colors.secondary,
                    color: colors.dark
                  }}
                >
                  {product.variantCount} {product.variantCount === 1 ? 'Option' : 'Options'}
                </span>
              )}
            </div>
            
            {/* Design icon on hover for list view */}
            {isHovered && (
              <div className="absolute top-2 right-2 z-20">
                <div className="bg-white bg-opacity-75 rounded-full p-1.5 shadow-sm">
                  <svg className="h-3 w-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <Link href={selectedColor ? `${productUrl}?color=${encodeURIComponent(selectedColor)}` : productUrl}>
              <h3 className="text-lg font-medium hover:underline" style={{ color: colors.dark }}>
                {product.name}
              </h3>
            </Link>
            {/* Show selected variant options */}
            {(prettySelectedColor || Object.keys(selectedVariantOptions).length > 0) && (
              <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                {prettySelectedColor && <p>Color: {prettySelectedColor}</p>}
                {Object.entries(selectedVariantOptions).map(([key, value]) =>
                  value && <p key={key}>{key}: {value}</p>
                )}
              </div>
            )}
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
                  ${displayPrice?.toFixed(2) || '0.00'}
                </span>
                {product.originalPrice && (
                  <span className="text-sm line-through" style={{ color: colors.gray400 }}>
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Link href={selectedColor ? `${productUrl}?color=${encodeURIComponent(selectedColor)}` : productUrl}>
                  <button
                    className="py-2 px-4 rounded-full font-medium text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                    style={{
                      backgroundColor: colors.accent,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    {(() => {
                      const selections = [];
                      if (prettySelectedColor) selections.push(prettySelectedColor);
                      Object.values(selectedVariantOptions).forEach(v => v && selections.push(v));
                      return selections.length > 0 ? `Design (${selections.join(', ')})` : 'Design Now';
                    })()}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Color swatches positioned outside content for list view */}
        {colorOptions.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {colorOptions.map((colorOption, index) => {
                const colorSlug = formatColorForUrl(colorOption.name);
                const colorHex = getColorHex(colorOption.name) || '#CCCCCC';
                const isSelected =
                  selectedColor
                    ? selectedColor === colorSlug
                    : index === currentColorIndex;

                return (
                  <button
                    key={colorOption.name}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleColorSelect(colorOption.name);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    className={`relative w-6 h-6 rounded-full transition-all duration-200 flex items-center justify-center ${
                      isSelected
                        ? 'scale-110 shadow-md'
                        : 'hover:shadow-sm'
                    }`}
                    style={{
                      transform: isSelected ? 'scale(1.1) translateY(-1px)' : 'scale(1)'
                    }}
                    aria-label={`Select ${colorOption.name.replace(/-/g, ' ')}`}
                    title={colorOption.name.replace(/-/g, ' ')}
                  >
                    {/* Full-filled color circle with contrasting ring */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-gray-800'
                          : 'border-white hover:border-gray-200'
                      }`}
                      style={{
                        backgroundColor: colorHex,
                        boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Variant selectors for list view */}
        {Object.keys(groupedVariantOptions).length > 0 && (
          <div className="px-6 pb-4 space-y-2">
            {Object.entries(groupedVariantOptions).map(([optionName, values]) => (
              <div key={optionName}>
                <p className="text-xs font-medium mb-1.5" style={{ color: colors.gray600 }}>
                  {optionName}:
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {values.map((value) => {
                    const isSelected = selectedVariantOptions[optionName] === value;
                    return (
                      <button
                        key={value}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedVariantOptions(prev => ({
                            ...prev,
                            [optionName]: isSelected ? '' : value
                          }));
                        }}
                        className={`px-2.5 py-1.5 text-xs rounded-md transition-all duration-200 font-medium ${
                          isSelected
                            ? 'shadow-md scale-105'
                            : 'hover:shadow-sm hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: isSelected ? colors.primary : colors.gray100,
                          color: isSelected ? colors.white : colors.gray700,
                          border: `1px solid ${isSelected ? colors.primary : colors.gray300}`
                        }}
                        title={value}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="group relative bg-white rounded-lg border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowColorOptions(false);
        setSelectedColor(null);
        setSelectedVariantOptions({});
        setCurrentColorIndex(0);
      }}
    >
      {/* Image Container */}
      <div
        className="relative aspect-square overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(248, 250, 252, 0.95) 0%, rgba(243, 247, 251, 0.9) 100%), linear-gradient(135deg, rgba(22, 193, 168, 0.02) 0%, rgba(255, 138, 38, 0.02) 100%), #fafbfc'
        }}
      >
        <Link href={selectedColor ? `${productUrl}?color=${encodeURIComponent(selectedColor)}` : productUrl}>
          <Image
            src={getCurrentImage()}
            alt={product.name}
            fill
            className="object-contain group-hover:scale-[1.03] transition-all duration-300"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.badge && (
            <span
              className="px-2 py-1 text-xs font-medium rounded-full"
              style={{
                backgroundColor: product.badge === 'sale' ? colors.accent :
                               product.badge === 'new' ? colors.primary : colors.dark,
                color: colors.white
              }}
            >
              {product.badge.toUpperCase()}
            </span>
          )}
          {product.isVariantProduct && product.variantCount && product.variantCount > 0 && (
            <span
              className="px-2 py-1 text-xs font-medium rounded-full"
              style={{
                backgroundColor: colors.secondary,
                color: colors.dark
              }}
            >
              {product.variantCount} {product.variantCount === 1 ? 'Option' : 'Options'}
            </span>
          )}
        </div>

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

        {/* Design icon on hover */}
        {isHovered && (
          <div className="absolute top-3 right-3 z-20">
            <div className="bg-white bg-opacity-75 rounded-full p-2 shadow-sm">
              <svg className="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </div>
        )}

        {/* Wishlist button */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className="p-2 bg-white bg-opacity-75 rounded-full shadow-sm hover:shadow-md transition-all"
          >
            <Heart 
              className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </button>
        </div>
        
      </div>

      {/* Color swatches positioned completely outside the image */}
      {colorOptions.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {colorOptions.map((colorOption, index) => {
              const colorSlug = formatColorForUrl(colorOption.name);
              const colorHex = getColorHex(colorOption.name) || '#CCCCCC';
              const isSelected =
                selectedColor
                  ? selectedColor === colorSlug
                  : index === currentColorIndex;

              return (
                <button
                  key={colorOption.name}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleColorSelect(colorOption.name);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  className={`relative w-6 h-6 rounded-full transition-all duration-200 flex items-center justify-center ${
                    isSelected
                      ? 'scale-110 shadow-md'
                      : 'hover:shadow-sm'
                  }`}
                  style={{
                    transform: isSelected ? 'scale(1.1) translateY(-1px)' : 'scale(1)'
                  }}
                  aria-label={`Select ${colorOption.name.replace(/-/g, ' ')}`}
                  title={colorOption.name.replace(/-/g, ' ')}
                >
                  {/* Full-filled color circle with contrasting ring */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-gray-800'
                        : 'border-white hover:border-gray-200'
                    }`}
                    style={{
                      backgroundColor: colorHex,
                      boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Variant selectors for size, shape, pieces, type, etc. */}
      {Object.keys(groupedVariantOptions).length > 0 && (
        <div className="px-4 pt-2 pb-1 space-y-2">
          {Object.entries(groupedVariantOptions).map(([optionName, values]) => (
            <div key={optionName}>
              <p className="text-xs font-medium mb-1 text-center" style={{ color: colors.gray600 }}>
                {optionName}:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {values.map((value) => {
                  const isSelected = selectedVariantOptions[optionName] === value;
                  return (
                    <button
                      key={value}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedVariantOptions(prev => ({
                          ...prev,
                          [optionName]: isSelected ? '' : value
                        }));
                      }}
                      className={`px-2 py-1 text-xs rounded-md transition-all duration-200 font-medium ${
                        isSelected
                          ? 'shadow-md scale-105'
                          : 'hover:shadow-sm hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: isSelected ? colors.primary : colors.gray100,
                        color: isSelected ? colors.white : colors.gray700,
                        border: `1px solid ${isSelected ? colors.primary : colors.gray300}`
                      }}
                      title={value}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Info */}
      <div className="p-4">
        <Link href={selectedColor ? `${productUrl}?color=${encodeURIComponent(selectedColor)}` : productUrl}>
          <h3 className="font-medium text-sm line-clamp-2 hover:underline" style={{ color: colors.dark }}>
            {product.name}
          </h3>
        </Link>
        {/* Show selected variant options */}
        {(prettySelectedColor || Object.keys(selectedVariantOptions).length > 0) && (
          <div className="text-xs text-gray-500 mt-1 space-y-0.5">
            {prettySelectedColor && <p>Color: {prettySelectedColor}</p>}
            {Object.entries(selectedVariantOptions).map(([key, value]) =>
              value && <p key={key}>{key}: {value}</p>
            )}
          </div>
        )}

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
              ${displayPrice?.toFixed(2) || '0.00'}
            </span>
            {product.originalPrice && (
              <span className="text-sm line-through" style={{ color: colors.gray400 }}>
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Design Now Button */}
        <Link href={selectedColor ? `${productUrl}?color=${encodeURIComponent(selectedColor)}` : productUrl}>
          <button
            className="w-full mt-4 py-3 px-6 rounded-full font-medium text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: product.stock === 0 ? colors.gray400 : colors.accent,
              boxShadow: product.stock === 0 ? 'none' : '0 4px 12px rgba(0,0,0,0.15)'
            }}
            disabled={product.stock === 0}
          >
            {product.stock === 0
              ? 'Out of Stock'
              : (() => {
                  const selections = [];
                  if (prettySelectedColor) selections.push(prettySelectedColor);
                  Object.values(selectedVariantOptions).forEach(v => v && selections.push(v));
                  return selections.length > 0 ? `Design (${selections.join(', ')})` : 'Design Now';
                })()
            }
          </button>
        </Link>
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

// Function to get hex color from color name
function getColorHex(colorName: string): string | null {
  const colorMap: Record<string, string> = {
    // Whites
    'white': '#FFFFFF',
    'vintage white': '#F5F5DC',
    'off white': '#FAF0E6',
    'arctic white': '#F0F8FF',

    // Blacks
    'black': '#000000',
    'jet black': '#0A0A0A',

    // Metallic finishes (for Apple Watch and accessories)
    'rose gold': '#B76E79',
    'gold': '#FFD700',
    'silver': '#C0C0C0',
    'standard': '#808080',

    // Sticker finishes
    'glossy': '#E8F4F8',
    'matte': '#D3D3D3',

    // Hoodie-specific colors
    'airforce blue': '#5D8AA8',
    'candy pink': '#FFB3D9',
    'fire red': '#DC143C',
    'hawaiian blue': '#1E90FF',
    'hot pink': '#FF69B4',
    'jade': '#00A86B',
    'lime green': '#32CD32',
    'new french navy': '#000080',
    'orange crush': '#FF8C00',
    'plum': '#8E4585',
    'red hot chilli': '#E23D28',
    'sapphire blue': '#0F52BA',

    // Greys
    'anthracite': '#36454F',
    'charcoal': '#36454F',
    'dark heather grey': '#616161',
    'india ink grey': '#414A4C',
    'heather grey': '#999999',
    'dark grey': '#696969',
    'sport grey': '#9E9E9E',
    'sports grey': '#9E9E9E',
    'heather': '#999999',
    'dark heather': '#6B6B6B',
    'athletic heather': '#D3D3D3',
    
    // Blues
    'navy': '#000080',
    'french navy': '#002654',
    'oxford navy': '#14213D',
    'bright blue': '#0047AB',
    'light blue': '#87CEEB',
    'royal blue': '#4169E1',
    'sky blue': '#87CEEB',
    'royal': '#4169E1',
    'true royal': '#002FA7',
    'blue': '#0066CC',
    
    // Purples
    'stargazer': '#4B0082',
    'purple': '#800080',
    'heather purple': '#9370DB',
    
    // Reds
    'red': '#DC143C',
    'burgundy': '#800020',
    
    // Pinks
    'cotton pink': '#FFB3BA',
    'pink': '#FF69B4',
    
    // Greens
    'glazed green': '#8FBC8F',
    'irish green': '#009A49',
    'bottle green': '#006A4E',
    'kelly green': '#4CBB17',
    'military green triblend': '#4B5320',
    'apple': '#8DB600',
    
    // Yellows
    'khaki': '#F0E68C',
    'desert dust': '#EDC9AF',
    'ochre': '#CC7722',
    'spectra yellow': '#FFFF00',
    'sun yellow': '#FFD700',
    'butter': '#FFDB58',
    'daisy': '#FFFF31',
    
    // Special colors
    'azalea': '#F56FA1',
    'cornsilk': '#FFF8DC',
    'vintage royal triblend': '#002FA7',
    
    // Legacy/additional colors
    'army green': '#4B5320',
    'ash': '#B2BEB5',
    'asphalt': '#36454F',
    'baby blue': '#89CFF0',
    'brown': '#8B4513',
    'burnt orange': '#CC5500',
    'cardinal': '#C41E3A',
    'chocolate': '#7B3F00',
    'cranberry': '#DC143C',
    'forest': '#228B22',
    'heather blue': '#4682B4',
    'heather prism lilac': '#C8A2C8',
    'heather prism mint': '#98FB98',
    'heather prism peach': '#FFCBA4',
    'kiwi': '#8EE53F',
    'light pink': '#FFB6C1',
    'maroon': '#800000',
    'natural': '#F5F5DC',
    'orange': '#FF8C00',
    'slate': '#708090',
    'tan': '#D2B48C',
    'yellow': '#FFD700',
    'coral': '#FF7F50',
    'mint': '#98FB98',
    'sage': '#87AE73',
    'steel': '#71797E',
    'cream': '#F5F5DC',
    'indigo': '#4B0082',
    'lavender': '#E6E6FA',
    'peach': '#FFCBA4',
    'turquoise': '#40E0D0',
    'violet': '#8A2BE2',
    'green': '#228B22',
    'grey': '#808080',
    'gray': '#808080'
  };

  return colorMap[colorName.toLowerCase()] || null;
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading products...</div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
