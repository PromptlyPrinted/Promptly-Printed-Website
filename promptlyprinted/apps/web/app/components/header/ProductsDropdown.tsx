// ProductsDropdown.tsx
'use client';

import { motion } from 'framer-motion';
import {
  Baby,
  Home,
  MoreHorizontal,
  Shirt,
  ShoppingBag,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type ProductsDropdownProps = {
  headerBottom: number;
  onDropdownEnter: () => void;
  onDropdownLeave: () => void;
};

export function ProductsDropdown({
  headerBottom,
  onDropdownEnter,
  onDropdownLeave,
}: ProductsDropdownProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ensure the portal renders only on the client.
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      // Use fixed positioning so the dropdown stays with the header.
      style={{ top: headerBottom }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="fixed right-0 left-0 z-40 bg-white shadow-lg"
      onMouseEnter={onDropdownEnter}
      onMouseLeave={onDropdownLeave}
    >
      <div className="mx-auto max-w-7xl p-6">
        <div className="flex divide-x">
          {/* Column 1: Intro/Promotional Section */}
          <div className="pr-8">
            <h3 className="font-semibold text-gray-800 text-xl">
              Use your imagination
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 via-green-100 to-purple-100 p-4">
                <Shirt className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 via-green-100 to-purple-100 p-4">
                <ShoppingBag className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 via-green-100 to-purple-100 p-4">
                <Home className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 via-green-100 to-purple-100 p-4">
                <MoreHorizontal className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <p className="mt-4 text-gray-600 text-sm">
              Discover unique products that spark creativity and imagination.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center gap-2 font-medium text-gray-900 text-sm transition-colors duration-200 hover:text-gray-700"
            >
              <Shirt className="h-5 w-5" />
              Explore Products →
            </Link>
          </div>

          {/* Column 2: Apparel */}
          <div className="px-8">
            <h3 className="flex items-center gap-2 font-semibold text-gray-800 text-xl">
              <Shirt className="h-6 w-6" /> Apparel
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/products"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Shirt className="h-5 w-5" />
                  All
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=mens"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <User className="h-5 w-5" />
                  Men
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=womens"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <User className="h-5 w-5" />
                  Women
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=kids"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Baby className="h-5 w-5" />
                  Kids &amp; Babies
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Accessories */}
          <div className="px-8">
            <h3 className="flex items-center gap-2 font-semibold text-gray-800 text-xl">
              <ShoppingBag className="h-6 w-6" /> Accessories
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/products?category=accessories"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <ShoppingBag className="h-5 w-5" />
                  All Accessories
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=accessories&subcategory=bags"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Bags
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=accessories&subcategory=watch-straps"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Watch Straps
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Home & Living */}
          <div className="px-8">
            <h3 className="flex items-center gap-2 font-semibold text-gray-800 text-xl">
              <Home className="h-6 w-6" /> Home &amp; Living
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/products?category=home"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Home className="h-5 w-5" />
                  All Home & Living
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=home&subcategory=cushions"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Home className="h-5 w-5" />
                  Cushions
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=home&subcategory=gallery-boards"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Home className="h-5 w-5" />
                  Gallery Boards
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Others */}
          <div className="pl-8">
            <h3 className="flex items-center gap-2 font-semibold text-gray-800 text-xl">
              <MoreHorizontal className="h-6 w-6" /> Others
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/products?category=others"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <MoreHorizontal className="h-5 w-5" />
                  All Others
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=others&subcategory=stickers"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <MoreHorizontal className="h-5 w-5" />
                  Stickers
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=others&subcategory=games"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <MoreHorizontal className="h-5 w-5" />
                  Games
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>,
    document.body
  );
}
