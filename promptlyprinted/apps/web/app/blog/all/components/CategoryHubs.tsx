'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  CpuChipIcon, 
  PaintBrushIcon, 
  ArrowTrendingUpIcon, 
  CogIcon, 
  GlobeAltIcon 
} from '@heroicons/react/24/outline';

interface Category {
  name: string;
  description: string;
}

interface CategoryHubsProps {
  categories: Category[];
}

const categoryIcons: Record<string, any> = {
  'AI': CpuChipIcon,
  'Design': PaintBrushIcon,
  'Trends': ArrowTrendingUpIcon,
  'Technology': CogIcon,
  'Sustainability': GlobeAltIcon
};

const categoryGradients: Record<string, string> = {
  'AI': 'from-purple-500 to-indigo-600',
  'Design': 'from-pink-500 to-rose-600',
  'Trends': 'from-orange-500 to-red-600',
  'Technology': 'from-blue-500 to-cyan-600',
  'Sustainability': 'from-green-500 to-emerald-600'
};

export default function CategoryHubs({ categories }: CategoryHubsProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Explore by Category
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Dive deep into specific topics that interest you most
          </p>
        </motion.div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {categories.map((category, index) => {
            const IconComponent = categoryIcons[category.name] || CogIcon;
            const gradient = categoryGradients[category.name] || 'from-slate-500 to-slate-600';

            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
              >
                <Link
                  href={`/blog/${category.name.toLowerCase()}`}
                  className="group block"
                >
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-200 overflow-hidden"
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    
                    {/* Icon */}
                    <div className="relative mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {category.description}
                      </p>
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.div
                        className={`w-8 h-8 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center`}
                        animate={{ x: [0, 3, 0] }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6">
                      <div className={`w-full h-full bg-gradient-to-br ${gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-slate-600 mb-6">
            Can't find what you're looking for?
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <span>Browse All Topics</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}