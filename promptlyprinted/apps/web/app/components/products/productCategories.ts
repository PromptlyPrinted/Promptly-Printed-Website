import type { LucideIcon } from 'lucide-react';
import {
  Shirt,
  ShoppingBag,
  Home,
  Baby,
  Watch,
  Square,
  Triangle,
  FileText,
  Gamepad2,
  Book,
  Sticker,
  PenTool,
  User,
  Key,
  Ruler,
} from 'lucide-react';

// Define the icon names as a type for type safety
export type IconName =
  | 'shirt'
  | 'shopping-bag'
  | 'home'
  | 'baby'
  | 'watch'
  | 'square'
  | 'triangle'
  | 'file-text'
  | 'gamepad-2'
  | 'book'
  | 'sticker'
  | 'pen-tool'
  | 'user'
  | 'key'
  | 'ruler';

// Base apparel categories that appear in multiple sections
const baseApparelCategories = [
  { title: 'T-Shirts', href: '/products/t-shirts', iconName: 'shirt' as IconName },
  { title: 'Tank Tops', href: '/products/tank-tops', iconName: 'shirt' as IconName },
  { title: 'Long Sleeve Shirts', href: '/products/long-sleeve-shirts', iconName: 'shirt' as IconName },
  { title: 'Hoodies', href: '/products/hoodies', iconName: 'shirt' as IconName },
  { title: 'Sweatshirts', href: '/products/sweatshirts', iconName: 'shirt' as IconName },
  { title: 'Sweatpants', href: '/products/sweatpants', iconName: 'shirt' as IconName },
  { title: 'Shorts', href: '/products/shorts', iconName: 'shirt' as IconName },
  { title: 'Coats & Jackets', href: '/products/coats-jackets', iconName: 'shirt' as IconName },
];

// Accessories categories
const accessoryCategories = [
  { title: 'Bags', href: '/products/bags', iconName: 'shopping-bag' as IconName },
  { title: 'Watch Straps', href: '/products/watch-straps', iconName: 'watch' as IconName },
  { title: 'Mats & Sleeves', href: '/products/mats-sleeves', iconName: 'ruler' as IconName },
  { title: 'Socks & Flip-flops', href: '/products/socks-flipflops', iconName: 'ruler' as IconName },
  { title: 'Pendants & Keyrings', href: '/products/pendants-keyrings', iconName: 'key' as IconName },
];

// Home & Living categories
const homeLivingCategories = [
  { title: 'Cushions', href: '/products/cushions', iconName: 'square' as IconName },
  { title: 'Gallery Boards', href: '/products/gallery-boards', iconName: 'file-text' as IconName },
  { title: 'Acrylic Prisms', href: '/products/acrylic-prisms', iconName: 'triangle' as IconName },
  { title: 'Prints and Posters', href: '/products/prints-posters', iconName: 'file-text' as IconName },
];

// Other categories
const otherCategories = [
  { title: 'Games', href: '/products/games', iconName: 'gamepad-2' as IconName },
  { title: 'Books', href: '/products/books', iconName: 'book' as IconName },
  { title: 'Notebooks', href: '/products/notebooks', iconName: 'book' as IconName },
  { title: 'Stickers', href: '/products/stickers', iconName: 'sticker' as IconName },
  { title: 'Tattoos', href: '/products/tattoos', iconName: 'pen-tool' as IconName },
];

interface CategoryData {
  title: string;
  description: string;
  categories: Array<{
    title: string;
    href: string;
    iconName: IconName;
  }>;
}

// Category-specific data
export const categoryData: Record<string, CategoryData> = {
  all: {
    title: 'All Products',
    description: 'Customize high-quality garments and have your creations shipped directly to you or your customers.',
    categories: [
      ...baseApparelCategories,
      ...accessoryCategories,
      ...homeLivingCategories,
      ...otherCategories,
    ],
  },
  men: {
    title: "All Men's Clothing",
    description: "High-quality men's apparel for every occasion, fully customizable with your unique designs.",
    categories: baseApparelCategories.map(cat => ({
      ...cat,
      href: `/products/mens${cat.href.replace('/products', '')}`,
    })),
  },
  women: {
    title: "All Women's Clothing",
    description: "Stylish women's apparel that you can personalize with your creative designs.",
    categories: [
      ...baseApparelCategories,
      { title: 'Dresses', href: '/products/womens/dresses', iconName: 'shirt' as IconName },
      { title: 'Swimwear', href: '/products/womens/swimwear', iconName: 'shirt' as IconName },
      { title: 'Sportswear', href: '/products/womens/sportswear', iconName: 'shirt' as IconName },
    ].map(cat => ({
      ...cat,
      href: cat.href.startsWith('/products/womens') ? cat.href : `/products/womens${cat.href.replace('/products', '')}`,
    })),
  },
  'kids-baby': {
    title: 'Kids & Baby Clothing',
    description: 'Adorable and comfortable clothing for kids and babies, perfect for customization.',
    categories: baseApparelCategories.map(cat => ({
      ...cat,
      href: `/products/kids${cat.href.replace('/products', '')}`,
      iconName: cat.iconName === 'shirt' ? 'baby' : cat.iconName,
    })),
  },
  accessories: {
    title: 'Accessories',
    description: 'Complete your look with our range of customizable accessories.',
    categories: accessoryCategories,
  },
  'home-living': {
    title: 'Home & Living',
    description: 'Bring your designs into your living space with our home decor items.',
    categories: homeLivingCategories,
  },
  others: {
    title: 'Other Products',
    description: 'Explore our unique collection of customizable items.',
    categories: otherCategories,
  },
}; 