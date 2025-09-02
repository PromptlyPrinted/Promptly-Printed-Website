'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface ToolbarProps {
  categories: Array<{ name: string; description: string }>;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string) => void;
  onCategoryChange: (category: string) => void;
  currentSort: string;
  activeCategory: string;
}

const sortOptions = [
  { value: 'new-to-old', label: 'New to Old' },
  { value: 'old-to-new', label: 'Old to New' },
  { value: 'most-popular', label: 'Most Popular' },
  { value: 'featured', label: 'Featured' }
];

export default function Toolbar({ categories, onSearchChange, onSortChange, onCategoryChange, currentSort, activeCategory }: ToolbarProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.6; // 60vh hero height
      setIsSticky(window.scrollY > heroHeight - 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchValue);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    // Debounced search
    const timeoutId = setTimeout(() => {
      onSearchChange(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  return (
    <motion.div 
      className={`${
        isSticky 
          ? 'fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-lg' 
          : 'bg-white border-b border-slate-200'
      } transition-all duration-300`}
      animate={isSticky ? { y: 0 } : { y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="py-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          
          {/* Search */}
          <div className="flex-1 max-w-md">
            <form onSubmit={handleSearchSubmit} className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchValue}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
              />
            </form>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {/* All Categories Button */}
            <button
              onClick={() => onCategoryChange('All')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
                activeCategory === 'All'
                  ? 'bg-teal-500 text-white'
                  : 'text-slate-700 bg-slate-100 hover:bg-teal-100 hover:text-teal-700'
              }`}
            >
              All
            </button>
            
            {/* Category Filter Buttons */}
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => onCategoryChange(category.name)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
                  activeCategory === category.name
                    ? 'bg-teal-500 text-white'
                    : 'text-slate-700 bg-slate-100 hover:bg-teal-100 hover:text-teal-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-200"
            >
              {sortOptions.find(option => option.value === currentSort)?.label || 'Sort'}
              <ChevronDownIcon 
                className={`w-4 h-4 transition-transform duration-200 ${
                  sortDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            <AnimatePresence>
              {sortDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSortChange(option.value);
                        setSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                        currentSort === option.value
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {sortDropdownOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setSortDropdownOpen(false)}
        />
      )}
    </motion.div>
  );
}