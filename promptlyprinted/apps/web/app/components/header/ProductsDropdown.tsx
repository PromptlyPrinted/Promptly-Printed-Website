// ProductsDropdown.tsx
"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

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
    // Ensure we only render the portal on the client.
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      style={{ top: headerBottom }}
      className="absolute left-0 right-0 z-40 bg-white shadow-sm"
      onMouseEnter={onDropdownEnter}
      onMouseLeave={onDropdownLeave}
    >
      <div className="mx-auto max-w-7xl p-6">
        <div className="flex divide-x">
          {/* Column 1: Intro/Promotional Section */}
          <div className="pr-8">
            <h3 className="text-lg font-semibold">Use your imagination</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="aspect-square rounded-xl bg-gradient-to-br from-pink-100 via-green-100 to-purple-100 p-4">
                {/* Your icon or image */}
              </div>
              <div className="aspect-square rounded-xl bg-gradient-to-br from-pink-100 via-green-100 to-purple-100 p-4">
                {/* Your icon or image */}
              </div>
              <div className="aspect-square rounded-xl bg-gradient-to-br from-pink-100 via-green-100 to-purple-100 p-4">
                {/* Your icon or image */}
              </div>
              <div className="aspect-square rounded-xl bg-gradient-to-br from-pink-100 via-green-100 to-purple-100 p-4">
                {/* Your icon or image */}
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Discover unique products that spark creativity and imagination.
            </p>
            <Link
              href="/products/all"
              className="mt-4 inline-flex items-center text-sm font-medium text-gray-900 hover:text-gray-700"
            >
              Explore Products →
            </Link>
          </div>

          {/* Column 2: Apparel */}
          <div className="px-8">
            <h3 className="text-lg font-semibold">Apparel</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/products/all"
                  className="text-gray-600 hover:text-gray-900"
                >
                  All
                </Link>
              </li>
              <li>
                <Link
                  href="/products/mens"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Men
                </Link>
              </li>
              <li>
                <Link
                  href="/products/womens"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Women
                </Link>
              </li>
              <li>
                <Link
                  href="/products/kids+babies"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Kids & Babies
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Accessories */}
          <div className="px-8">
            <h3 className="text-lg font-semibold">Accessories</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/products/mats-sleeves"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Mats & Sleeves
                </Link>
              </li>
              <li>
                <Link
                  href="/products/socks-flipflops"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Socks & Flip-flops
                </Link>
              </li>
              <li>
                <Link
                  href="/products/pendants-keyrings"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Pendants & Keyrings
                </Link>
              </li>
              <li>
                <Link
                  href="/products/bags"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Bags
                </Link>
              </li>
              <li>
                <Link
                  href="/products/watch-straps"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Apple Watch Straps
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Home & Living */}
          <div className="px-8">
            <h3 className="text-lg font-semibold">Home & Living</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/products/cushions"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Cushions
                </Link>
              </li>
              <li>
                <Link
                  href="/products/gallery-boards"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Gallery Boards
                </Link>
              </li>
              <li>
                <Link
                  href="/products/acrylic-prisms"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Acrylic Prisms
                </Link>
              </li>
              <li>
                <Link
                  href="/products/prints-posters"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Prints and Posters
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Others */}
          <div className="pl-8">
            <h3 className="text-lg font-semibold">Others</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/products/games"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Games
                </Link>
              </li>
              <li>
                <Link
                  href="/products/books"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Books
                </Link>
              </li>
              <li>
                <Link
                  href="/products/notebooks"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Notebooks
                </Link>
              </li>
              <li>
                <Link
                  href="/products/stickers"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Stickers
                </Link>
              </li>
              <li>
                <Link
                  href="/products/tattoos"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Tattoos
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}