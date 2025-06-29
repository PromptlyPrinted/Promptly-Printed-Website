// ResourcesDropdown.tsx
'use client';

import { motion } from 'framer-motion';
import {
  Book,
  FileCheck,
  FileText,
  Gift,
  HelpCircle,
  MessageSquare,
  Store,
  Users2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type ResourcesDropdownProps = {
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
    // Ensure the portal renders only on the client.
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      // Use fixed positioning so the dropdown stays relative to the viewport.
      // Remove the extra +8 offset so it sits flush with the header.
      style={{ top: headerBottom }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="fixed right-0 left-0 z-40 bg-white shadow-lg"
      onMouseEnter={onDropdownEnter}
      onMouseLeave={onDropdownLeave}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col divide-y md:flex-row md:divide-x md:divide-y-0">
          {/* RESOURCES */}
          <div className="flex-1 px-8 py-6">
            <h2 className="mb-2 font-semibold text-gray-900 text-lg">
              Resources
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link
                href="/faq"
                className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-green-50 p-6 transition-shadow hover:shadow-md"
              >
                <MessageSquare size={32} className="text-gray-700" />
                <span className="mt-2 font-medium text-gray-900">
                  FAQ &amp; Help Center
                </span>
              </Link>
              <Link
                href="/blog"
                className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-purple-50 p-6 transition-shadow hover:shadow-md"
              >
                <FileText size={32} className="text-gray-700" />
                <span className="mt-2 font-medium text-gray-900">Blog</span>
              </Link>
              <Link
                href="/etsy-store"
                className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-blue-50 p-6 transition-shadow hover:shadow-md"
              >
                <Store size={32} className="text-gray-700" />
                <span className="mt-2 font-medium text-gray-900">
                  Etsy Store
                </span>
              </Link>
            </div>
          </div>

          {/* LEARN */}
          <div className="flex-1 px-8 py-6">
            <h2 className="mb-2 font-semibold text-gray-900 text-lg">Learn</h2>
            <div className="flex flex-col space-y-3">
              <Link
                href="/blog"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <FileText size={18} className="mr-2" />
                <span>Blog</span>
              </Link>
              <Link
                href="/prompt-library"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <Book size={18} className="mr-2" />
                <span>Prompt Library</span>
              </Link>
            </div>
          </div>

          {/* COMMUNITY */}
          <div className="flex-1 px-8 py-6">
            <h2 className="mb-2 font-semibold text-gray-900 text-lg">
              Community
            </h2>
            <div className="flex flex-col space-y-3">
              <Link
                href="/affiliate-program"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <Users2 size={18} className="mr-2" />
                <span>Affiliate Program</span>
              </Link>
              <Link
                href="/refer-friend"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <Gift size={18} className="mr-2" />
                <span>Refer a Friend Program</span>
              </Link>
              <Link
                href="/etsy-store"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <Store size={18} className="mr-2" />
                <span>Etsy Store</span>
              </Link>
            </div>
          </div>

          {/* GET SUPPORT */}
          <div className="flex-1 px-8 py-6">
            <h2 className="mb-2 font-semibold text-gray-900 text-lg">
              Get Support
            </h2>
            <div className="flex flex-col space-y-3">
              <Link
                href="/legal"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <FileCheck size={18} className="mr-2" />
                <span>Policies</span>
              </Link>
              <Link
                href="/faq"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <HelpCircle size={18} className="mr-2" />
                <span>FAQ &amp; Help Center</span>
              </Link>
              <Link
                href="/track-order"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <MessageSquare size={18} className="mr-2" />
                <span>Track Order</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>,
    document.body
  );
}
