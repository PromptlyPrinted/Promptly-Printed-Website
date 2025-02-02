// ProductsDropdown.tsx
"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shirt,
  User,
  Baby,
  Ruler,
  Key,
  Watch,
  Square,
  Image as ImageIcon,
  Triangle,
  FileText,
  Gamepad2,
  BookOpen,
  Book,
  Sticker,
  PenTool,
  ShoppingBag,
  Home,
  MoreHorizontal,
} from "lucide-react";

type ProductsDropdownProps = {
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
    // Render the portal only on the client.
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      style={{ top: headerBottom }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute left-0 right-0 z-40 bg-white shadow-lg"
      onMouseEnter={onDropdownEnter}
      onMouseLeave={onDropdownLeave}
    >
      <div className="mx-auto max-w-7xl p-6">
        <div className="flex divide-x">
          {/* Column 1: Intro/Promotional Section */}
          <div className="pr-8">
            <h3 className="text-xl font-semibold text-gray-800">
              Use your imagination
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center justify-center aspect-square rounded-xl bg-gradient-to-br from-pink-100 via-green-100 to-purple-100 p-4">
                <Shirt className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex items-center justify-center aspect-square rounded-xl bg-gradient-to-br from-pink-100 via-green-100 to-purple-100 p-4">
                <ShoppingBag className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex items-center justify-center aspect-square rounded-xl bg-gradient-to-br from-pink-100 via-green-100 to-purple-100 p-4">
                <Home className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex items-center justify-center aspect-square rounded-xl bg-gradient-to-br from-pink-100 via-green-100 to-purple-100 p-4">
                <MoreHorizontal className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Discover unique products that spark creativity and imagination.
            </p>
            <Link
              href="/products/all"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-900 transition-colors duration-200 hover:text-gray-700"
            >
              <Shirt className="h-5 w-5" />
              Explore Products →
            </Link>
          </div>

          {/* Column 2: Apparel */}
          <div className="px-8">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
              <Shirt className="h-6 w-6" /> Apparel
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/products/all"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Shirt className="h-5 w-5" />
                  All
                </Link>
              </li>
              <li>
                <Link
                  href="/products/mens"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <User className="h-5 w-5" />
                  Men
                </Link>
              </li>
              <li>
                <Link
                  href="/products/womens"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <User className="h-5 w-5" />
                  Women
                </Link>
              </li>
              <li>
                <Link
                  href="/products/kids+babies"
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
            <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
              <ShoppingBag className="h-6 w-6" /> Accessories
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/products/mats-sleeves"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Ruler className="h-5 w-5" />
                  Mats &amp; Sleeves
                </Link>
              </li>
              <li>
                <Link
                  href="/products/socks-flipflops"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  {/* Using an arbitrary icon for Socks & Flip-flops */}
                  <Ruler className="h-5 w-5" />
                  Socks &amp; Flip-flops
                </Link>
              </li>
              <li>
                <Link
                  href="/products/pendants-keyrings"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Key className="h-5 w-5" />
                  Pendants &amp; Keyrings
                </Link>
              </li>
              <li>
                <Link
                  href="/products/bags"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Bags
                </Link>
              </li>
              <li>
                <Link
                  href="/products/watch-straps"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Watch className="h-5 w-5" />
                  Apple Watch Straps
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Home & Living */}
          <div className="px-8">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
              <Home className="h-6 w-6" /> Home &amp; Living
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/products/cushions"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Square className="h-5 w-5" />
                  Cushions
                </Link>
              </li>
              <li>
                <Link
                  href="/products/gallery-boards"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <ImageIcon className="h-5 w-5" />
                  Gallery Boards
                </Link>
              </li>
              <li>
                <Link
                  href="/products/acrylic-prisms"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Triangle className="h-5 w-5" />
                  Acrylic Prisms
                </Link>
              </li>
              <li>
                <Link
                  href="/products/prints-posters"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <FileText className="h-5 w-5" />
                  Prints and Posters
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Others */}
          <div className="pl-8">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
              <MoreHorizontal className="h-6 w-6" /> Others
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/products/games"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Gamepad2 className="h-5 w-5" />
                  Games
                </Link>
              </li>
              <li>
                <Link
                  href="/products/books"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <BookOpen className="h-5 w-5" />
                  Books
                </Link>
              </li>
              <li>
                <Link
                  href="/products/notebooks"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Book className="h-10 w-10" />
                  Notebooks
                </Link>
              </li>
              <li>
                <Link
                  href="/products/stickers"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Sticker className="h-5 w-5" />
                  Stickers
                </Link>
              </li>
              <li>
                <Link
                  href="/products/tattoos"
                  className="flex items-center gap-2 rounded px-3 py-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                >
                  <PenTool className="h-5 w-5" />
                  Tattoos
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