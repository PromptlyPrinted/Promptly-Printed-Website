'use client';

import { cn } from '@repo/design-system/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarIcon, UserIcon, ArrowTrendingUpIcon, SparklesIcon } from '@heroicons/react/24/outline';
import ThreeBackground from './ThreeBackground';
import MostPopularPosts from './MostPopularPosts';
import ProductUpdatesSection from './ProductUpdatesSection';
import NewsletterSection from './NewsletterSection';
import CompanyEthosSection from './CompanyEthosSection';
import StartDesigningCTA from './StartDesigningCTA';

const COLORS = {
  navy: '#0D2C45',
  teal: '#16C1A8', 
  orange: '#FF8A26',
  white: '#FFFFFF',
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
}

interface AnimatedBlogContentProps {
  posts: BlogPost[];
}


const BlogCard = ({ post, index, featured = false }: { post: BlogPost; index: number; featured?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    className={cn(
      'group relative overflow-hidden rounded-2xl transition-all duration-500',
      'hover:shadow-2xl hover:-translate-y-2',
      featured ? 'md:col-span-2 lg:col-span-3' : 'col-span-1'
    )}
  >
    <Link href={`/blog/${post._slug}`} className="block">
      {/* Card Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700" 
           style={{ background: `linear-gradient(135deg, ${COLORS.navy} 0%, #1a4055 50%, ${COLORS.navy} 100%)` }} />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-20 h-20 rounded-full"
             style={{ background: `radial-gradient(circle, ${COLORS.teal} 0%, transparent 70%)` }} />
        <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full"
             style={{ background: `radial-gradient(circle, ${COLORS.orange} 0%, transparent 70%)` }} />
      </div>

      {/* Image Section */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent z-10" 
             style={{ background: `linear-gradient(to top, ${COLORS.navy}CC 0%, transparent 100%)` }} />
        
        {/* Safe image rendering with fallback */}
        {post.image?.url ? (
          <img 
            src={post.image.url} 
            alt={post.image.alt || post._title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.querySelector('.image-fallback')?.classList.remove('hidden');
            }}
          />
        ) : null}
        
        {/* Fallback placeholder */}
        <div className={`image-fallback w-full h-full bg-gradient-to-br from-teal-400/20 to-orange-400/20 flex items-center justify-center ${post.image?.url ? 'hidden' : ''}`}>
          <SparklesIcon className="w-16 h-16 text-white/30" />
        </div>
        
        {/* Featured Badge */}
        {featured && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-4 left-4 z-20"
          >
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm"
                 style={{ background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)` }}>
              <ArrowTrendingUpIcon className="w-3 h-3" />
              FEATURED
            </div>
          </motion.div>
        )}
      </div>

      {/* Content Section */}
      <div className="relative p-6 text-white">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags?.map((tag: string) => (
            <span 
              key={tag}
              className="px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm"
              style={{ background: `${COLORS.teal}40`, color: COLORS.teal }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className={cn(
          'font-bold leading-tight mb-3 group-hover:text-teal-300 transition-colors duration-300',
          featured ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
        )}>
          {post._title}
        </h3>

        {/* Description */}
        <p className="text-gray-300 mb-4 leading-relaxed">
          {post.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            {post.author && (
              <div className="flex items-center gap-1">
                <UserIcon className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
          {post.readTime && (
            <span className="text-teal-400 font-medium">{post.readTime}</span>
          )}
        </div>

        {/* Hover Arrow */}
        <motion.div
          className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
               style={{ background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)` }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.div>
      </div>
    </Link>
  </motion.div>
);

export default function AnimatedBlogContent({ posts }: AnimatedBlogContentProps) {


  return (
    <>
      {/* Three.js Background */}
      <ThreeBackground />
      
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden"
           style={{ background: `linear-gradient(135deg, ${COLORS.navy} 0%, #1a4055 50%, ${COLORS.navy} 100%)` }}>
        
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${COLORS.teal} 0%, transparent 70%)` }}
          />
          <motion.div
            animate={{ 
              rotate: [360, 0],
              scale: [1, 0.8, 1]
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${COLORS.orange} 0%, transparent 70%)` }}
          />
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-black mb-6 leading-tight"
              style={{ color: COLORS.white }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              The{' '}
              <motion.span
                className="bg-gradient-to-r bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)` }}
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Promptly Printed
              </motion.span>
              {' '}Blog
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Discover the latest in AI-powered design, custom apparel trends, and innovative printing techniques.
              <br />
              <span className="text-teal-400 font-semibold">Creativity Promptly Delivered.</span>
            </motion.p>

          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-teal-400 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-teal-400 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </div>

      {/* Company Ethos Quote Section (short + impactful) */}
      <CompanyEthosSection />

      {/* Most Popular / Trending Articles */}
      <MostPopularPosts posts={posts} />

      {/* Latest Releases (Product Updates) */}
      <ProductUpdatesSection />

      {/* Latest Posts + View All */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4"
                style={{ color: COLORS.navy }}>
              Latest Posts
            </h2>
            <div className="w-24 h-1 mx-auto rounded-full"
                 style={{ background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)` }} />
          </motion.div>

          {/* Posts Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {posts.map((post, index) => (
              <BlogCard
                key={post._slug}
                post={post}
                index={index}
                featured={false}
              />
            ))}
          </motion.div>

          {/* View All Articles Link */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link href="/blog/all">
              <motion.div
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all duration-300 hover:shadow-xl"
                style={{ background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)` }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
      </div>

      {/* Newsletter Signup */}
      <NewsletterSection />

      {/* Strong CTA: Start Designing */}
      <StartDesigningCTA />
    </>
  );
}