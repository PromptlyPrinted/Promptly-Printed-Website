"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Search, ArrowRight } from "lucide-react";
import { Input } from "@repo/design-system/components/ui/input";
import Link from "next/link";

export type SearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches] = useState([
    "T-shirts",
    "Hoodies",
    "Kids Apparel",
    "Accessories",
    "Home Decor",
  ]);

  const [suggestedCategories] = useState([
    { name: "Men's Apparel", href: "/products/mens" },
    { name: "Women's Apparel", href: "/products/womens" },
    { name: "Kids & Babies", href: "/products/kids+babies" },
    { name: "Accessories", href: "/products/accessories" },
    { name: "Home & Living", href: "/products/home-living" },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when the overlay is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }

    return () => {
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Centered Search Overlay */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 flex items-center justify-center z-50 px-4"
      >
        <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Search input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full h-16 rounded-full border border-gray-200 bg-white pl-16 pr-20 text-2xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={handleSearch}
              className="absolute inset-y-0 right-4 flex items-center"
            >
              <ArrowRight className="h-6 w-6 text-teal-500 hover:text-teal-600 transition-colors" />
            </button>
          </div>

          {/* Recent Searches */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Recent Searches
            </h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {recentSearches.map((search) => (
                <button
                  key={search}
                  onClick={() => {
                    setSearchQuery(search);
                    handleSearch();
                  }}
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Popular Categories */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10"
          >
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Popular Categories
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {suggestedCategories.map((category) => (
                <Link
                  key={category.href}
                  href={category.href}
                  className="flex items-center justify-center rounded-xl bg-gray-100 px-4 py-6 text-center text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                  onClick={onClose}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>,
    document.body
  );
}