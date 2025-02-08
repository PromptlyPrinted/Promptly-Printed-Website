'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import * as Icons from 'lucide-react';
import { type IconName } from './productCategories';
import type { LucideIcon } from 'lucide-react';

interface ProductCategoryCardProps {
  title: string;
  href: string;
  iconName: IconName;
  categoryId?: number;
}

const iconMap: Record<IconName, LucideIcon> = {
  'shirt': Icons.Shirt,
  'shopping-bag': Icons.ShoppingBag,
  'home': Icons.Home,
  'baby': Icons.Baby,
  'watch': Icons.Watch,
  'square': Icons.Square,
  'triangle': Icons.Triangle,
  'file-text': Icons.FileText,
  'gamepad-2': Icons.Gamepad2,
  'book-open': Icons.BookOpen,
  'book': Icons.Book,
  'sticker': Icons.Sticker,
  'pen-tool': Icons.PenTool,
  'user': Icons.User,
  'key': Icons.Key,
  'ruler': Icons.Ruler,
  'tablet': Icons.Tablet,
  'utensils': Icons.Utensils,
  'dog': Icons.Dog,
};

export function ProductCategoryCard({ title, href, iconName, categoryId }: ProductCategoryCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const Icon = iconMap[iconName];

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    // Preserve existing parameters we want to keep
    const maxPrice = searchParams.get('maxPrice') || '1000';
    const country = searchParams.get('country') || 'US';
    
    // Set the parameters
    params.set('maxPrice', maxPrice);
    params.set('country', country);
    
    // Add category ID if present
    if (categoryId) {
      params.set('category', categoryId.toString());
    }
    
    // Navigate to the base URL with the parameters
    router.push(`${href}?${params.toString()}`);
  };

  if (!Icon) {
    console.warn(`Icon not found for iconName: ${iconName}`);
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center justify-center p-4 bg-white border rounded-lg transition-shadow hover:shadow-md w-full"
    >
      <div className="w-24 h-24 flex items-center justify-center border rounded-lg bg-gray-50">
        <Icon className="w-16 h-16 text-gray-600" strokeWidth={1} />
      </div>
      <span className="mt-3 text-sm font-medium text-gray-900 text-center">{title}</span>
    </button>
  );
} 