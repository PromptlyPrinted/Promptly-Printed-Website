'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import ThreeHero from './ThreeHero';
import Toolbar from './Toolbar';
import ArticleGrid from './ArticleGrid';
import Pagination from './Pagination';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  date: string;
  readTime: string;
  featured?: boolean;
  popular?: boolean;
}

interface Category {
  name: string;
  description: string;
}

interface AllArticlesContentProps {
  articles: Article[];
  categories: Category[];
}

const ARTICLES_PER_PAGE = 6;

export default function AllArticlesContent({ articles, categories }: AllArticlesContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('new-to-old');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort articles
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (activeCategory !== 'All') {
      filtered = filtered.filter(article => 
        article.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'new-to-old':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'old-to-new':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'most-popular':
          // Featured articles first, then popular, then others
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'featured':
          // Featured first, then by date
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return sorted;
  }, [articles, searchQuery, sortBy, activeCategory]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedArticles.length / ARTICLES_PER_PAGE);

  // Reset to page 1 when search or sort changes
  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <ThreeHero 
        title="All Articles"
        subtitle="Explore our latest insights on AI design, apparel trends, sustainable printing, and more."
      />

      {/* Toolbar */}
      <Toolbar 
        categories={categories}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onCategoryChange={handleCategoryChange}
        currentSort={sortBy}
        activeCategory={activeCategory}
      />

      {/* Articles Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <p className="text-slate-600">
              {searchQuery ? (
                <>
                  Showing <span className="font-semibold text-slate-900">{filteredAndSortedArticles.length}</span> results 
                  for "<span className="font-semibold text-slate-900">{searchQuery}</span>"
                </>
              ) : (
                <>
                  Showing <span className="font-semibold text-slate-900">{filteredAndSortedArticles.length}</span> articles
                </>
              )}
            </p>
          </motion.div>

          {/* Article Grid */}
          {filteredAndSortedArticles.length > 0 ? (
            <>
              <ArticleGrid 
                articles={filteredAndSortedArticles}
                currentPage={currentPage}
                articlesPerPage={ARTICLES_PER_PAGE}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-16"
                >
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </motion.div>
              )}
            </>
          ) : (
            /* No Results */
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No articles found</h3>
                <p className="text-slate-600 mb-6">
                  Try adjusting your search terms or browse our categories below.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSortBy('newest');
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}