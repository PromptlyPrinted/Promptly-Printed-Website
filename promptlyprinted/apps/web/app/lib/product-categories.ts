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
  | 'ruler'
  | 'more-horizontal';

export interface ProductCategory {
  title: string;
  href: string;
  iconName: IconName;
  description?: string;
  subcategories?: ProductCategory[];
}

export const productCategories: ProductCategory[] = [
  {
    title: "Men's",
    href: '/products/mens',
    iconName: 'user',
    description: "High-quality men's apparel for every occasion",
    subcategories: [
      { title: 'T-Shirts', href: '/products/mens/t-shirts', iconName: 'shirt' },
      { title: 'Tank Tops', href: '/products/mens/tank-tops', iconName: 'shirt' },
      { title: 'Long Sleeve Shirts', href: '/products/mens/long-sleeve-shirts', iconName: 'shirt' },
      { title: 'Hoodies', href: '/products/mens/hoodies', iconName: 'shirt' },
      { title: 'Sweatshirts', href: '/products/mens/sweatshirts', iconName: 'shirt' },
      { title: 'Sweatpants', href: '/products/mens/sweatpants', iconName: 'shirt' },
      { title: 'Shorts', href: '/products/mens/shorts', iconName: 'shirt' },
      { title: 'Coats & Jackets', href: '/products/mens/coats-jackets', iconName: 'shirt' },
    ],
  },
  {
    title: "Women's",
    href: '/products/womens',
    iconName: 'user',
    description: "Stylish women's apparel that you can personalize",
    subcategories: [
      { title: 'T-Shirts', href: '/products/womens/t-shirts', iconName: 'shirt' },
      { title: 'Tank Tops', href: '/products/womens/tank-tops', iconName: 'shirt' },
      { title: 'Long Sleeve Shirts', href: '/products/womens/long-sleeve-shirts', iconName: 'shirt' },
      { title: 'Hoodies', href: '/products/womens/hoodies', iconName: 'shirt' },
      { title: 'Sweatshirts', href: '/products/womens/sweatshirts', iconName: 'shirt' },
      { title: 'Sweatpants', href: '/products/womens/sweatpants', iconName: 'shirt' },
      { title: 'Shorts', href: '/products/womens/shorts', iconName: 'shirt' },
      { title: 'Coats & Jackets', href: '/products/womens/coats-jackets', iconName: 'shirt' },
      { title: 'Dresses', href: '/products/womens/dresses', iconName: 'shirt' },
      { title: 'Swimwear', href: '/products/womens/swimwear', iconName: 'shirt' },
      { title: 'Sportswear', href: '/products/womens/sportswear', iconName: 'shirt' },
    ],
  },
  {
    title: 'Kids & Babies',
    href: '/products/kids-babies',
    iconName: 'baby',
    description: 'Adorable and comfortable clothing for kids and babies',
    subcategories: [
      { title: 'T-Shirts', href: '/products/kids-babies/t-shirts', iconName: 'baby' },
      { title: 'Tank Tops', href: '/products/kids-babies/tank-tops', iconName: 'baby' },
      { title: 'Long Sleeve Shirts', href: '/products/kids-babies/long-sleeve-shirts', iconName: 'baby' },
      { title: 'Hoodies', href: '/products/kids-babies/hoodies', iconName: 'baby' },
      { title: 'Sweatshirts', href: '/products/kids-babies/sweatshirts', iconName: 'baby' },
      { title: 'Sweatpants', href: '/products/kids-babies/sweatpants', iconName: 'baby' },
      { title: 'Shorts', href: '/products/kids-babies/shorts', iconName: 'baby' },
      { title: 'Coats & Jackets', href: '/products/kids-babies/coats-jackets', iconName: 'baby' },
    ],
  },
  {
    title: 'Accessories',
    href: '/products/accessories',
    iconName: 'shopping-bag',
    description: 'Complete your look with our range of customizable accessories',
    subcategories: [
      { title: 'Bags', href: '/products/bags', iconName: 'shopping-bag' },
      { title: 'Watch Straps', href: '/products/watch-straps', iconName: 'watch' },
      { title: 'Mats & Sleeves', href: '/products/mats-sleeves', iconName: 'ruler' },
      { title: 'Socks & Flip-flops', href: '/products/socks-flipflops', iconName: 'ruler' },
      { title: 'Pendants & Keyrings', href: '/products/pendants-keyrings', iconName: 'key' },
    ],
  },
  {
    title: 'Home & Living',
    href: '/products/home-living',
    iconName: 'home',
    description: 'Bring your designs into your living space',
    subcategories: [
      { title: 'Cushions', href: '/products/cushions', iconName: 'square' },
      { title: 'Gallery Boards', href: '/products/gallery-boards', iconName: 'file-text' },
      { title: 'Acrylic Prisms', href: '/products/acrylic-prisms', iconName: 'triangle' },
      { title: 'Prints and Posters', href: '/products/prints-posters', iconName: 'file-text' },
    ],
  },
  {
    title: 'Others',
    href: '/products/others',
    iconName: 'more-horizontal',
    description: 'Explore our unique collection of customizable items',
    subcategories: [
      { title: 'Games', href: '/products/games', iconName: 'gamepad-2' },
      { title: 'Books', href: '/products/books', iconName: 'book' },
      { title: 'Notebooks', href: '/products/notebooks', iconName: 'book' },
      { title: 'Stickers', href: '/products/stickers', iconName: 'sticker' },
      { title: 'Tattoos', href: '/products/tattoos', iconName: 'pen-tool' },
    ],
  },
]; 