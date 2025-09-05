'use client';

import { ArrowLeftIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import Balancer from 'react-wrap-balancer';
import { useState, useEffect, useRef } from 'react';
import { Share2, Linkedin, Facebook, Mail, Star, List, Clock, User } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { motion } from 'framer-motion';
import { Body } from '@repo/cms/components/body';
import { generateTableOfContents, generateTableOfContentsFromRichContent, calculateReadingTime, type TOCItem } from '../utils/generateTOC';
import ClientOnly from './ClientOnly';

const COLORS = {
  // Official Brand Colors from Logo
  promptlyTeal: '#16C1A8',     // Primary vibrant cyan
  promptlyOrange: '#FF8A26',   // Energetic secondary color  
  promptlyBlue: '#0D2C45',     // Deep navy for high-contrast text
  neutralWhite: '#FFFFFF',     // Clean white for emphasis
  lightGray: '#E2E8F0',        // Soft off-white for body text
  darkGray: '#334155',         // Background for code blocks
  
  // Legacy aliases for existing code
  navy: '#0D2C45',
  teal: '#16C1A8', 
  orange: '#FF8A26',
  white: '#FFFFFF',
  lightTeal: '#4ECDC4',
  darkNavy: '#0A1B2E',
};

// Generate URL-friendly slug from text
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Component that adds IDs to headings in the rendered content
const BodyWithHeadingIds = ({ content }: { content: any }) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!bodyRef.current) return;
    
    // Find all headings and add IDs
    const headings = bodyRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headings.forEach((heading) => {
      const text = heading.textContent || '';
      const id = generateSlug(text);
      
      // Set ID
      heading.id = id;
      
      // ID added for navigation - scroll offset handled in TOC onClick
    });
  }, [content]);

  return (
    <div ref={bodyRef}>
      <Body content={content} />
    </div>
  );
};

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  image?: { url: string; alt: string | null; width?: number; height?: number };
  date?: string;
  plainTextContent?: string;
  readTime?: string;
  tags?: string[];
  author?: string;
}

interface BlogPostContentProps {
  post: BlogPost;
  richContent?: any;
}

export default function BlogPostContent({ post, richContent }: BlogPostContentProps) {
  const [email, setEmail] = useState('');
  const [tableOfContents, setTableOfContents] = useState<TOCItem[]>([]);
  const [activeHeading, setActiveHeading] = useState('');
  const [readingTime, setReadingTime] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);

  // Generate table of contents and reading time from content
  useEffect(() => {
    const time = post.readTime || calculateReadingTime(post.plainTextContent || '');
    setReadingTime(time);
    
    // Generate TOC after content is rendered
    setTimeout(() => {
      const headings = document.querySelectorAll('article h1, article h2, article h3, article h4, article h5, article h6');
      
      const toc: TOCItem[] = Array.from(headings).map((heading) => {
        const text = heading.textContent || '';
        const id = heading.id || generateSlug(text);
        const level = parseInt(heading.tagName.replace('H', ''));
        
        return {
          id,
          text: text.trim(),
          level
        };
      });
      
      setTableOfContents(toc);
    }, 100);

    // Reading progress tracker and active section detection
    const handleScroll = () => {
      const article = document.querySelector('article');
      if (!article) return;

      const scrollTop = window.pageYOffset;
      const docHeight = article.offsetHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = scrollTop / (docHeight - winHeight);
      const scrollPercentRounded = Math.round(scrollPercent * 100);
      
      setReadingProgress(Math.min(100, Math.max(0, scrollPercentRounded)));

      // Update active heading based on scroll position
      const headings = document.querySelectorAll('article h1, article h2, article h3, article h4, article h5, article h6');
      let activeId = '';
      
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        const rect = heading.getBoundingClientRect();
        
        // If heading is above the viewport center, it's the active one
        if (rect.top <= 150) {
          activeId = heading.id;
          break;
        }
      }
      
      if (activeId && activeId !== activeHeading) {
        setActiveHeading(activeId);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post, richContent]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  const shareOnSocial = (platform: string) => {
    const url = window.location.href;
    const title = post.title;
    const text = post.description || '';
    
    switch (platform) {
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + ' ' + url)}`;
        break;
      default:
        navigator.clipboard?.writeText(url);
        break;
    }
  };

  return (
    <div className="min-h-screen modern-blog">
      {/* Enhanced Reading Progress Bar - Client Only */}
      <ClientOnly>
        <div 
          className="fixed top-0 left-0 w-full h-1 z-50 bg-gradient-to-r from-transparent via-slate-800/20 to-transparent"
          style={{
            background: 'linear-gradient(90deg, rgba(22, 193, 168, 0.1), rgba(255, 138, 38, 0.1))'
          }}
        >
          <motion.div 
            className="h-full bg-gradient-to-r from-teal-400 via-orange-400 to-teal-500 relative overflow-hidden"
            style={{ 
              width: `${readingProgress}%`,
              background: 'linear-gradient(90deg, #16C1A8, #FF8A26, #4ECDC4)',
              boxShadow: '0 0 20px rgba(22, 193, 168, 0.4)'
            }}
            initial={{ width: 0 }}
            animate={{ 
              width: `${readingProgress}%`,
              boxShadow: [
                '0 0 20px rgba(22, 193, 168, 0.4)',
                '0 0 30px rgba(255, 138, 38, 0.6)',
                '0 0 20px rgba(22, 193, 168, 0.4)'
              ]
            }}
            transition={{ 
              width: { duration: 0.3, ease: "easeOut" },
              boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            {/* Animated shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{ transform: 'translateX(-100%)' }}
              animate={{ 
                transform: readingProgress > 0 ? 'translateX(400%)' : 'translateX(-100%)'
              }}
              transition={{ 
                duration: 1.5, 
                repeat: readingProgress > 0 ? Infinity : 0,
                repeatDelay: 2,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </ClientOnly>
      {/* Header Section with Navbar style from blog page */}
      <div className="relative overflow-hidden -mt-[1px]" style={{ background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.darkNavy} 100%)` }}>
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Floating geometric shapes */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
            style={{ background: `radial-gradient(circle, ${COLORS.teal} 0%, transparent 70%)` }}
          />
          <motion.div
            animate={{ 
              rotate: [360, 0],
              scale: [1, 0.8, 1.1, 1],
              x: [0, -40, 0],
              y: [0, 60, 0]
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15"
            style={{ background: `radial-gradient(circle, ${COLORS.orange} 0%, transparent 70%)` }}
          />
          <motion.div
            animate={{ 
              rotate: [0, -180, 0],
              scale: [0.8, 1.3, 0.8],
              x: [0, 80, 0],
              y: [0, -50, 0]
            }}
            transition={{ 
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${COLORS.lightTeal} 0%, transparent 60%)` }}
          />
          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full opacity-30"
              style={{ 
                background: i % 2 === 0 ? COLORS.teal : COLORS.orange,
                left: `${20 + i * 10}%`,
                top: `${30 + (i * 15) % 40}%`
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          {/* Back to Blog Navigation */}
          <div className="px-6 py-4">
            <div className="max-w-7xl mx-auto">
              <Link
                href="/blog"
                className="inline-flex items-center text-sm text-white/80 hover:text-white transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Blog
              </Link>
            </div>
          </div>

          {/* Hero Section with Title and Author */}
          <div className="px-6 pb-16 pt-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-4xl mx-auto">
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {post.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm"
                        style={{ background: `${COLORS.teal}40`, color: COLORS.teal }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <motion.h1 
                  className="text-4xl md:text-6xl font-black mb-6 leading-tight text-white"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Balancer>{post.title}</Balancer>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-gray-300 mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {post.description}
                </motion.p>

                {/* Meta Info */}
                <motion.div 
                  className="flex items-center justify-center gap-6 text-gray-400 mb-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author || 'Promptly Printed Team'}</span>
                  </div>
                  <ClientOnly fallback={
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Loading...</span>
                    </div>
                  }>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(post.date || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    {readingTime && (
                      <div className="flex items-center gap-2">
                        <span>{readingTime} read</span>
                      </div>
                    )}
                  </ClientOnly>
                </motion.div>

                {/* Hero Image */}
                {post.image?.url && (
                  <motion.div 
                    className="mb-8"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  >
                    <img 
                      src={post.image.url} 
                      alt={post.image.alt || post.title} 
                      className="w-full max-w-4xl mx-auto h-60 sm:h-96 object-cover rounded-2xl shadow-2xl"
                      width={post.image.width || 800}
                      height={post.image.height || 400}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-screen" style={{ background: `linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)` }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Left Sidebar */}
            <motion.div 
              className="lg:col-span-1 space-y-8 lg:sticky lg:top-8 lg:self-start"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              {/* Social Sharing */}
              <motion.div 
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                style={{ boxShadow: `0 10px 40px rgba(22, 193, 168, 0.1)` }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5" style={{ color: COLORS.teal }} />
                  Share this article
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareOnSocial('linkedin')}
                    className="flex items-center gap-2 hover:border-blue-500 hover:text-blue-600"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareOnSocial('facebook')}
                    className="flex items-center gap-2 hover:border-blue-500 hover:text-blue-600"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareOnSocial('email')}
                    className="flex items-center gap-2 hover:border-gray-600"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareOnSocial('share')}
                    className="flex items-center gap-2"
                    style={{ 
                      borderColor: COLORS.teal + '40',
                      color: COLORS.teal
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
              </motion.div>

              {/* Table of Contents */}
              <motion.div 
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                style={{ boxShadow: `0 10px 40px rgba(255, 138, 38, 0.1)` }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <List className="w-5 h-5" style={{ color: COLORS.teal }} />
                  Contents
                </h3>
                <ClientOnly fallback={
                  <div className="text-sm text-gray-500 px-3 py-2">
                    Loading contents...
                  </div>
                }>
                  <nav className="space-y-2">
                    {tableOfContents.length > 0 ? (
                      tableOfContents.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            
                            // Find the target element
                            const targetElement = document.getElementById(item.id);
                            
                            if (targetElement) {
                              // Get the element's position
                              const rect = targetElement.getBoundingClientRect();
                              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                              const targetY = rect.top + scrollTop - 170; // 170px offset for better visibility
                              
                              // Scroll to position with offset
                              window.scrollTo({
                                top: Math.max(0, targetY),
                                behavior: 'smooth'
                              });
                              
                              setActiveHeading(item.id);
                            }
                          }}
                          className={`block text-sm hover:text-teal-600 hover:bg-teal-50 rounded-md px-3 py-2 transition-all duration-200 ${
                            activeHeading === item.id ? 'text-teal-600 bg-teal-50 font-medium' : 'text-gray-600'
                          } ${
                            item.level === 1 ? '' : 
                            item.level === 2 ? 'pl-6' : 
                            item.level === 3 ? 'pl-9' :
                            'pl-12'
                          }`}
                        >
                          {item.text}
                        </a>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 px-3 py-2">
                        No headings found in this article.
                      </div>
                    )}
                  </nav>
                </ClientOnly>
              </motion.div>
            </motion.div>

            {/* Main Content */}
            <motion.div 
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              <motion.article 
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500"
                style={{ boxShadow: `0 20px 60px rgba(13, 44, 69, 0.15)` }}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="p-8 sm:p-12">
                  {richContent ? (
                    <motion.div 
                      className="prose prose-lg prose-slate max-w-none
                        prose-headings:font-bold prose-headings:scroll-mt-24
                        prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-0 
                        prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12 prose-h2:border-l-4 prose-h2:pl-6 prose-h2:py-2
                        prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 
                        prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-6
                        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
                        prose-strong:font-semibold
                        prose-ul:my-6 prose-ol:my-6 prose-li:my-2 prose-li:text-gray-700 prose-li:text-lg
                        prose-code:text-sm prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-medium
                        prose-pre:p-6 prose-pre:rounded-xl prose-pre:my-8
                        prose-img:rounded-xl prose-img:shadow-xl prose-img:border prose-img:border-gray-200 prose-img:my-8
                        prose-hr:my-12 prose-hr:border-gray-200
                      "
                      style={{
                        // Official Brand Colors CSS Custom Properties
                        ['--tw-prose-headings' as any]: COLORS.promptlyTeal,
                        ['--tw-prose-links' as any]: COLORS.promptlyTeal,
                        ['--tw-prose-body' as any]: COLORS.lightGray,
                        ['--tw-prose-bold' as any]: COLORS.neutralWhite,
                        
                        // Code styling - fix the white text issue
                        ['--tw-prose-code' as any]: COLORS.promptlyOrange,
                        ['--tw-prose-pre-code' as any]: COLORS.promptlyBlue,
                        ['--tw-prose-pre-bg' as any]: COLORS.darkGray,
                        
                        // Other elements
                        ['--tw-prose-blockquotes' as any]: COLORS.lightGray,
                        ['--tw-prose-quote-borders' as any]: COLORS.promptlyTeal,
                        ['--tw-prose-hr' as any]: COLORS.promptlyOrange,
                        
                        // List markers
                        ['--tw-prose-bullets' as any]: COLORS.promptlyTeal,
                        ['--tw-prose-counters' as any]: COLORS.promptlyTeal,
                      } as React.CSSProperties}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 1.8 }}
                    >
                      <ClientOnly>
                        <BodyWithHeadingIds content={richContent} />
                      </ClientOnly>
                    </motion.div>
                  ) : post.plainTextContent ? (
                    <div className="prose prose-lg prose-slate max-w-none">
                      <div className="text-gray-700 leading-relaxed space-y-6 whitespace-pre-line">
                        {post.plainTextContent}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-600 text-center py-8">
                      No content available.
                    </div>
                  )}
                </div>
              </motion.article>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}