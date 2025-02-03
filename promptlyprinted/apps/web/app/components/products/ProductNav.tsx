'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const categories = [
  { name: 'All', href: '/products/all' },
  { name: 'Men', href: '/products/men' },
  { name: 'Women', href: '/products/women' },
  { name: 'Kids & Baby', href: '/products/kids-baby' },
  { name: 'Accessories', href: '/products/accessories' },
  { name: 'Home & Living', href: '/products/home-living' },
  { name: 'Others', href: '/products/others' },
];

export function ProductNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b">
      <div className="container mx-auto">
        <div className="flex items-center justify-center space-x-8">
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className={`border-b-2 py-4 text-sm font-medium transition-colors hover:text-gray-900 ${
                pathname === category.href
                  ? 'border-black text-gray-900'
                  : 'border-transparent text-gray-600'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
} 