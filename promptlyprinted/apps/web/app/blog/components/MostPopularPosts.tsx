'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { Calendar, User, Clock, TrendingUp, Eye } from 'lucide-react';
import GlassmorphismCard from './GlassmorphismCard';

const COLORS = {
  navy: '#0D2C45',
  teal: '#16C1A8', 
  orange: '#FF8A26',
  white: '#FFFFFF',
  purple: '#9333EA',
  cyan: '#00FFF0',
};

interface BlogPost {
  _slug: string;
  _title: string;
  description: string;
  image: { url: string; alt: string; width: number; height: number };
  date: string;
  readTime?: string;
  tags?: string[];
  author?: string;
  featured?: boolean;
  views?: string;
  trending?: boolean;
}

interface MostPopularPostsProps {
  posts: BlogPost[];
}

export default function MostPopularPosts({ posts }: MostPopularPostsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  // Get top 5 popular posts (prioritize featured, then by date)
  const popularPosts = posts
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, 5);

  const featuredPost = popularPosts[0];
  const otherPosts = popularPosts.slice(1, 5);

  return (
    <motion.section
      id="trending-articles"
      ref={sectionRef}
      className="py-20 bg-gray-50 overflow-hidden"
    >
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          style={{ y }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)`,
              color: COLORS.white
            }}
            whileHover={{ scale: 1.05 }}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">Most Popular</span>
          </motion.div>
          
          <h2 
            className="text-4xl md:text-5xl font-black mb-4"
            style={{ color: COLORS.navy }}
          >
            Trending Articles
          </h2>
          <div 
            className="w-24 h-1 mx-auto rounded-full"
            style={{ 
              background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)` 
            }} 
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Post - Large */}
          {featuredPost && (
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <GlassmorphismCard className="h-full overflow-hidden group">
                <Link href={`/blog/${featuredPost._slug}`} className="block h-full">
                  <div className="relative h-80 mb-6 rounded-xl overflow-hidden">
                    {/* Featured Badge */}
                    <motion.div
                      className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm"
                      style={{ 
                        background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)` 
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                    >
                      <TrendingUp className="w-3 h-3" />
                      FEATURED
                    </motion.div>

                    {/* Views Badge */}
                    <motion.div
                      className="absolute top-4 right-4 z-20 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white bg-black/30 backdrop-blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Eye className="w-3 h-3" />
                      12.5K
                    </motion.div>

                    {/* Gradient Overlay */}
                    <div 
                      className="absolute inset-0 z-10"
                      style={{ 
                        background: `linear-gradient(to top, ${COLORS.navy}CC 0%, transparent 100%)` 
                      }} 
                    />
                    
                    {/* Image */}
                    {featuredPost.image?.url ? (
                      <motion.img
                        src={featuredPost.image.url}
                        alt={featuredPost.image.alt}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        whileHover={{ scale: 1.05 }}
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ 
                          background: `linear-gradient(135deg, ${COLORS.teal}40 0%, ${COLORS.orange}40 100%)` 
                        }}
                      >
                        <TrendingUp className="w-16 h-16 text-white/30" />
                      </div>
                    )}
                  </div>

                  <div className="relative z-10">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {featuredPost.tags?.slice(0, 3).map((tag) => (
                        <motion.span
                          key={tag}
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            background: `${COLORS.teal}20`, 
                            color: COLORS.teal 
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          #{tag}
                        </motion.span>
                      ))}
                    </div>

                    {/* Title */}
                    <h3 
                      className="text-2xl md:text-3xl font-bold mb-4 leading-tight transition-colors duration-300 group-hover:text-teal-600"
                      style={{ color: COLORS.navy }}
                    >
                      {featuredPost._title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                      {featuredPost.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        {featuredPost.author && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{featuredPost.author}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(featuredPost.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                      </div>
                      {featuredPost.readTime && (
                        <div className="flex items-center gap-1 text-teal-600 font-medium">
                          <Clock className="w-4 h-4" />
                          <span>{featuredPost.readTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </GlassmorphismCard>
            </motion.div>
          )}

          {/* Other Popular Posts - Smaller Cards */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {otherPosts.map((post, index) => (
              <motion.div
                key={post._slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                viewport={{ once: true }}
              >
                <GlassmorphismCard className="group">
                  <Link href={`/blog/${post._slug}`} className="block">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                        {post.image?.url ? (
                          <motion.img
                            src={post.image.url}
                            alt={post.image.alt}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{ 
                              background: `linear-gradient(135deg, ${COLORS.teal}30 0%, ${COLORS.orange}30 100%)` 
                            }}
                          >
                            <TrendingUp className="w-6 h-6 text-white/50" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 
                          className="font-bold leading-tight mb-2 group-hover:text-teal-600 transition-colors duration-300 line-clamp-2"
                          style={{ color: COLORS.navy }}
                        >
                          {post._title}
                        </h4>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {post.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-3">
                            <span>{new Date(post.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}</span>
                            {post.readTime && (
                              <span className="text-teal-600 font-medium">
                                {post.readTime}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-orange-500">
                            <Eye className="w-3 h-3" />
                            <span>{Math.floor(Math.random() * 10 + 1)}K</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </GlassmorphismCard>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* View All Link */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <Link href="/blog/all-articles">
            <motion.div
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)`,
                color: COLORS.white
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>View All Articles</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.div>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}