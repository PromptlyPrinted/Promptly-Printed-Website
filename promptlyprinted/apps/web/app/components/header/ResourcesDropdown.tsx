// ResourcesDropdown.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Book, TrendingUp, LifeBuoy } from "lucide-react";

type ResourcesDropdownProps = {
  headerBottom: number;
  onDropdownEnter: () => void;
  onDropdownLeave: () => void;
};

export function ResourcesDropdown({
  headerBottom,
  onDropdownEnter,
  onDropdownLeave,
}: ResourcesDropdownProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
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
      <div className="max-w-7xl mx-auto p-8">
        {/* Flex container: On desktop the columns are side by side; on mobile they stack */}
        <div className="flex flex-wrap gap-8">
          {/* Column 1: Resources */}
          <div className="w-full md:w-1/4 bg-white border border-gray-200 rounded shadow-sm p-4">
            <h2 className="flex items-center text-xl font-semibold mb-4 text-gray-800">
              <FileText size={20} className="mr-2 text-gray-600" />
              Resources
            </h2>
            <ul className="list-none m-0 p-0">
              <li className="mb-2">
                <Link
                  href="/faq"
                  className="text-gray-800 hover:text-gray-600 hover:underline"
                >
                  FAQ &amp; Help Center
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  href="/blog"
                  className="text-gray-800 hover:text-gray-600 hover:underline"
                >
                  Blog
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  href="/etsy-store"
                  className="text-gray-800 hover:text-gray-600 hover:underline"
                >
                  Etsy Store
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Learn */}
          <div className="w-full md:w-1/4 bg-white border border-gray-200 rounded shadow-sm p-4">
            <h2 className="flex items-center text-xl font-semibold mb-4 text-gray-800">
              <Book size={20} className="mr-2 text-gray-600" />
              Learn
            </h2>
            <ul className="list-none m-0 p-0">
              <li className="mb-2">
                <Link
                  href="/blog"
                  className="text-gray-800 hover:text-gray-600 hover:underline"
                >
                  Blog
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  href="/prompt-library"
                  className="text-gray-800 hover:text-gray-600 hover:underline"
                >
                  Prompt Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Grow */}
          <div className="w-full md:w-1/4 bg-white border border-gray-200 rounded shadow-sm p-4">
            <h2 className="flex items-center text-xl font-semibold mb-4 text-gray-800">
              <TrendingUp size={20} className="mr-2 text-gray-600" />
              Grow
            </h2>
            <ul className="list-none m-0 p-0">
              <li className="mb-2">
                <Link
                  href="/affiliate-program"
                  className="text-gray-800 hover:text-gray-600 hover:underline"
                >
                  Affiliate Program
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  href="/refer-a-friend"
                  className="text-gray-800 hover:text-gray-600 hover:underline"
                >
                  Refer a Friend Program
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  href="/etsy-store"
                  className="text-gray-800 hover:text-gray-600 hover:underline"
                >
                  Etsy Store
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Get Support */}
          <div className="w-full md:w-1/4 bg-white border border-gray-200 rounded shadow-sm p-4">
            <h2 className="flex items-center text-xl font-semibold mb-4 text-gray-800">
              <LifeBuoy size={20} className="mr-2 text-gray-600" />
              Get Support
            </h2>
            <ul className="list-none m-0 p-0">
              <li className="mb-2">
                <Link
                  href="/policies"
                  className="text-gray-800 hover:text-gray-600 hover:underline"
                >
                  Policies
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  href="/faq"
                  className="text-gray-800 hover:text-gray-600 hover:underline"
                >
                  FAQ &amp; Help Center
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  href="/track-order"
                  className="text-gray-800 hover:text-gray-600 hover:underline"
                >
                  Track Order
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