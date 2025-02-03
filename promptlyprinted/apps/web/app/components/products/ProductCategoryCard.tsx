'use client';

import Link from 'next/link';
import * as Icons from 'lucide-react';
import { type IconName } from './productCategories';

interface ProductCategoryCardProps {
  title: string;
  href: string;
  iconName: IconName;
}

const iconMap: Record<IconName, keyof typeof Icons> = {
  'shirt': 'Shirt',
  'shopping-bag': 'ShoppingBag',
  'home': 'Home',
  'baby': 'Baby',
  'watch': 'Watch',
  'square': 'Square',
  'triangle': 'Triangle',
  'file-text': 'FileText',
  'gamepad-2': 'Gamepad2',
  'book': 'Book',
  'sticker': 'Sticker',
  'pen-tool': 'PenTool',
  'user': 'User',
  'key': 'Key',
  'ruler': 'Ruler',
};

export function ProductCategoryCard({ title, href, iconName }: ProductCategoryCardProps) {
  const Icon = Icons[iconMap[iconName]];

  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-4 bg-white border rounded-lg transition-shadow hover:shadow-md"
    >
      <div className="w-24 h-24 flex items-center justify-center border rounded-lg bg-gray-50">
        <Icon className="w-16 h-16 text-gray-600" strokeWidth={1} />
      </div>
      <span className="mt-3 text-sm font-medium text-gray-900 text-center">{title}</span>
    </Link>
  );
} 