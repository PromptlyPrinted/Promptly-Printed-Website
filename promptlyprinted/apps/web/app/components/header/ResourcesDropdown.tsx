// ResourcesDropdown.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  HelpCircle,
  FileText,
  Store,
  Book,
  Users2,
  Gift,
  MessageSquare,
  FileCheck,
  GraduationCap,
  Video as VideoIcon,
} from "lucide-react";

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
      // Extra offset so the dropdown isn’t flush with the header.
      style={{ top: headerBottom + 8 }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute left-0 right-0 z-40 bg-white shadow-lg"
      onMouseEnter={onDropdownEnter}
      onMouseLeave={onDropdownLeave}
    >
      <div className="max-w-7xl mx-auto">
        {/*
          Using a flex container with responsive classes:
          - On small screens: flex-col with divide-y (horizontal dividers)
          - On md and larger: flex-row with divide-x (vertical dividers)
        */}
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x">
          {/* RESOURCES */}
          <div className="flex-1 px-8 py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Resources
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/faq"
                className="bg-green-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow"
              >
                <MessageSquare size={32} className="text-gray-700" />
                <span className="mt-2 font-medium text-gray-900">
                  FAQ &amp; Help Center
                </span>
              </Link>

              <Link
                href="/blog"
                className="bg-purple-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow"
              >
                <FileText size={32} className="text-gray-700" />
                <span className="mt-2 font-medium text-gray-900">Blog</span>
              </Link>

              <Link
                href="/etsy-store"
                className="bg-blue-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center hover:shadow-md transition-shadow"
              >
                <Store size={32} className="text-gray-700" />
                <span className="mt-2 font-medium text-gray-900">Etsy Store</span>
              </Link>
            </div>
          </div>

          {/* LEARN */}
          <div className="flex-1 px-8 py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Learn</h2>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
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
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
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