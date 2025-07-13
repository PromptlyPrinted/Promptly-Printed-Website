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
  | 'book-open'
  | 'book'
  | 'sticker'
  | 'pen-tool'
  | 'user'
  | 'key'
  | 'ruler'
  | 'tablet'
  | 'utensils'
  | 'dog';

// Base apparel categories that appear in multiple sections
const baseApparelCategories = [
  {
    id: 445,
    title: 'T-Shirts',
    href: '/products',
    iconName: 'shirt' as IconName,
  },
  {
    id: 446,
    title: 'Tank Tops',
    href: '/products',
    iconName: 'shirt' as IconName,
  },
  {
    id: 447,
    title: 'Long Sleeve Shirts',
    href: '/products',
    iconName: 'shirt' as IconName,
  },
  {
    id: 448,
    title: 'Hoodies',
    href: '/products',
    iconName: 'shirt' as IconName,
  },
  {
    id: 449,
    title: 'Sweatshirts',
    href: '/products',
    iconName: 'shirt' as IconName,
  },
  {
    id: 450,
    title: 'Sweatpants',
    href: '/products',
    iconName: 'shirt' as IconName,
  },
  {
    id: 451,
    title: 'Shorts',
    href: '/products',
    iconName: 'shirt' as IconName,
  },
  {
    id: 452,
    title: 'Coats & Jackets',
    href: '/products',
    iconName: 'shirt' as IconName,
  },
];

// Accessories categories
const accessoryCategories = [
  {
    id: 453,
    title: 'Bags',
    href: '/products/accessories',
    iconName: 'shopping-bag' as IconName,
  },
  {
    id: 454,
    title: 'Watch Straps',
    href: '/products/accessories',
    iconName: 'watch' as IconName,
  },
  {
    id: 455,
    title: 'Mats & Sleeves',
    href: '/products/accessories',
    iconName: 'ruler' as IconName,
  },
  {
    id: 456,
    title: 'Socks & Flip-flops',
    href: '/products/accessories',
    iconName: 'ruler' as IconName,
  },
  {
    id: 457,
    title: 'Pendants & Keyrings',
    href: '/products/accessories',
    iconName: 'key' as IconName,
  },
];

// Home & Living categories
const homeLivingCategories = [
  {
    id: 458,
    title: 'Cushions',
    href: '/products/home-living',
    iconName: 'square' as IconName,
  },
  {
    id: 459,
    title: 'Gallery Boards',
    href: '/products/home-living',
    iconName: 'file-text' as IconName,
  },
  {
    id: 460,
    title: 'Acrylic Prisms',
    href: '/products/home-living',
    iconName: 'triangle' as IconName,
  },
  {
    id: 461,
    title: 'Prints and Posters',
    href: '/products/home-living',
    iconName: 'file-text' as IconName,
  },
];

// Other categories
const otherCategories = [
  {
    id: 462,
    title: 'Games',
    href: '/products/others',
    iconName: 'gamepad-2' as IconName,
  },
  {
    id: 463,
    title: 'Books',
    href: '/products/others',
    iconName: 'book-open' as IconName,
  },
  {
    id: 464,
    title: 'Notebooks',
    href: '/products/others',
    iconName: 'book' as IconName,
  },
  {
    id: 465,
    title: 'Stickers',
    href: '/products/others',
    iconName: 'sticker' as IconName,
  },
  {
    id: 466,
    title: 'Tattoos',
    href: '/products/others',
    iconName: 'pen-tool' as IconName,
  },
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
    description:
      'Customize high-quality garments and have your creations shipped directly to you or your customers.',
    categories: [
      ...baseApparelCategories,
      ...accessoryCategories,
      ...homeLivingCategories,
      ...otherCategories,
    ],
  },
  men: {
    title: "All Men's Clothing",
    description:
      "High-quality men's apparel for every occasion, fully customizable with your unique designs.",
    categories: baseApparelCategories.map((cat) => ({
      ...cat,
      href: '/products/men',
    })),
  },
  women: {
    title: "All Women's Clothing",
    description:
      "Stylish women's apparel that you can personalize with your creative designs.",
    categories: baseApparelCategories.map((cat) => ({
      ...cat,
      href: '/products/women',
    })),
  },
  'kids-baby': {
    title: 'Kids & Baby Clothing',
    description:
      'Adorable and comfortable clothing for kids and babies, perfect for customization.',
    categories: baseApparelCategories.map((cat) => ({
      ...cat,
      href: '/products/kids-baby',
      iconName: cat.iconName === 'shirt' ? 'baby' : cat.iconName,
    })),
  },
  accessories: {
    title: 'Accessories',
    description:
      'Complete your look with our range of customizable accessories.',
    categories: accessoryCategories,
  },
  'home-living': {
    title: 'Home & Living',
    description:
      'Bring your designs into your living space with our home decor items.',
    categories: homeLivingCategories,
  },
  others: {
    title: 'Other Products',
    description: 'Explore our unique collection of customizable items.',
    categories: otherCategories,
  },
};
