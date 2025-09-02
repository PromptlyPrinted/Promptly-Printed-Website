'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

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

interface ArticleGridProps {
  articles: Article[];
  currentPage: number;
  articlesPerPage: number;
}

const categoryColors: Record<string, string> = {
  'AI': 'bg-purple-100 text-purple-700 border-purple-200',
  'Design': 'bg-pink-100 text-pink-700 border-pink-200',
  'Trends': 'bg-orange-100 text-orange-700 border-orange-200',
  'Technology': 'bg-blue-100 text-blue-700 border-blue-200',
  'Sustainability': 'bg-green-100 text-green-700 border-green-200'
};

export default function ArticleGrid({ articles, currentPage, articlesPerPage }: ArticleGridProps) {
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const displayedArticles = articles.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {displayedArticles.map((article, index) => (
        <motion.article
          key={article.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: index * 0.1,
            ease: "easeOut"
          }}
          className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-slate-200"
        >
          <Link href={`/blog/${article.slug}`}>
            {/* Image */}
            <div className="relative aspect-video overflow-hidden bg-slate-100">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.image-fallback')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'image-fallback absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center';
                    fallback.innerHTML = '<div class="text-slate-500 text-center"><svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg><p class="text-xs">Image</p></div>';
                    parent.appendChild(fallback);
                  }
                }}
              />
              
              {/* Featured Badge */}
              {article.featured && (
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-gradient-to-r from-teal-500 to-orange-500 text-white text-xs font-semibold rounded-full">
                    Featured
                  </span>
                </div>
              )}

              {/* Popular Badge */}
              {article.popular && !article.featured && (
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                    Popular
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Category */}
              <div className="mb-3">
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${
                  categoryColors[article.category] || 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {article.category}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-teal-700 transition-colors duration-200">
                {article.title}
              </h2>

              {/* Excerpt */}
              <p className="text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                {article.excerpt}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between text-sm text-slate-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(article.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{article.readTime}</span>
                  </div>
                </div>

                {/* Read More Arrow */}
                <div className="flex items-center gap-1 text-teal-600 group-hover:text-teal-700 font-medium">
                  <span className="text-xs">Read</span>
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    →
                  </motion.div>
                </div>
              </div>
            </div>
          </Link>
        </motion.article>
      ))}
    </div>
  );
}