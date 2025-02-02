// ResourcesDropdown.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Book, Store, HelpCircle, Users2, Gift, MessageSquare, FileCheck } from "lucide-react";

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
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Resources */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Resources</h2>
            <div className="space-y-3">
              <Link href="/faq" className="flex items-center text-gray-600 hover:text-gray-900">
                <HelpCircle size={18} className="mr-2" />
                <span>FAQ & Help Center</span>
              </Link>
              <Link href="/blog" className="flex items-center text-gray-600 hover:text-gray-900">
                <FileText size={18} className="mr-2" />
                <span>Blog</span>
              </Link>
              <Link href="/etsy-store" className="flex items-center text-gray-600 hover:text-gray-900">
                <Store size={18} className="mr-2" />
                <span>Etsy Store</span>
              </Link>
            </div>
          </div>

          {/* Learn */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Learn</h2>
            <div className="space-y-3">
              <Link href="/blog" className="flex items-center text-gray-600 hover:text-gray-900">
                <FileText size={18} className="mr-2" />
                <span>Blog</span>
              </Link>
              <Link href="/prompt-library" className="flex items-center text-gray-600 hover:text-gray-900">
                <Book size={18} className="mr-2" />
                <span>Prompt Library</span>
              </Link>
            </div>
          </div>

          {/* Community (formerly Grow) */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Community</h2>
            <div className="space-y-3">
              <Link href="/affiliate-program" className="flex items-center text-gray-600 hover:text-gray-900">
                <Users2 size={18} className="mr-2" />
                <span>Affiliate Program</span>
              </Link>
              <Link href="/refer-friend" className="flex items-center text-gray-600 hover:text-gray-900">
                <Gift size={18} className="mr-2" />
                <span>Refer a Friend Program</span>
              </Link>
              <Link href="/etsy-store" className="flex items-center text-gray-600 hover:text-gray-900">
                <Store size={18} className="mr-2" />
                <span>Etsy Store</span>
              </Link>
            </div>
          </div>

          {/* Get Support */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Get Support</h2>
            <div className="space-y-3">
              <Link href="/policies" className="flex items-center text-gray-600 hover:text-gray-900">
                <FileCheck size={18} className="mr-2" />
                <span>Policies</span>
              </Link>
              <Link href="/faq" className="flex items-center text-gray-600 hover:text-gray-900">
                <HelpCircle size={18} className="mr-2" />
                <span>FAQ & Help Center</span>
              </Link>
              <Link href="/track-order" className="flex items-center text-gray-600 hover:text-gray-900">
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