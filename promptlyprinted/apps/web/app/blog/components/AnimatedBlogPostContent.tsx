'use client';

import { ArrowLeftIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import Balancer from 'react-wrap-balancer';
import { useState, useEffect, useRef } from 'react';
import { Share2, Linkedin, Facebook, Mail, List, Clock, User, Heart, Bookmark, Eye } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { MDXContent, renderMarkdownContent } from '../[slug]/components/MDXContent';
import { generateTableOfContents, calculateReadingTime, type TOCItem } from '../[slug]/utils/generateTOC';
import GlassmorphismCard from './GlassmorphismCard';
import ThreeBackground from './ThreeBackground';

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
  image?: { url: string; alt: string | null; width?: number; height?: number };
  date?: string;
  body?: { plainText: string };
  readTime?: string;
  tags?: string[];
  author?: string;
}

interface AnimatedBlogPostContentProps {
  post: BlogPost;
}

export default function AnimatedBlogPostContent({ post }: AnimatedBlogPostContentProps) {
  const [tableOfContents, setTableOfContents] = useState<TOCItem[]>([]);
  const [activeHeading, setActiveHeading] = useState('');
  const [readingTime, setReadingTime] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const headerY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Generate table of contents and reading time from content
  useEffect(() => {
    const content = post.body?.plainText || post.description || '';
    const toc = generateTableOfContents(content);
    const time = post.readTime || calculateReadingTime(content);
    
    setTableOfContents(toc);
    setReadingTime(time);
  }, [post]);

  // Track reading progress
  useEffect(() => {
    const updateReadingProgress = () => {
      const element = document.querySelector('.article-content');
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const documentHeight = element.scrollHeight;
      
      const scrolled = Math.max(0, windowHeight - rect.top);
      const progress = Math.min(100, (scrolled / documentHeight) * 100);
      
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', updateReadingProgress);
    updateReadingProgress();
    
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, []);

  const shareOnSocial = (platform: string) => {
    const url = window.location.href;
    const title = post._title;
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
    setShowShareMenu(false);
  };

  return (
    <div ref={containerRef} className="min-h-screen">
      {/* Three.js Background */}
      <ThreeBackground />
      
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r z-50"
        style={{
          background: `linear-gradient(90deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)`,
          scaleX: scrollYProgress
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: readingProgress / 100 }}
        transition={{ duration: 0.2 }}
      />

      {/* Floating Action Buttons */}
      <motion.div
        className="fixed right-6 top-1/2 -translate-y-1/2 z-40 space-y-4"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        {/* Share Button */}
        <motion.div className="relative">
          <motion.button
            className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center backdrop-blur-sm"
            style={{
              background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.orange} 100%)`,
              color: COLORS.white
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowShareMenu(!showShareMenu)}
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
          
          <AnimatePresence>
            {showShareMenu && (
              <motion.div
                className="absolute right-full mr-4 top-0"
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <GlassmorphismCard className="p-2 min-w-max">
                  <div className="flex gap-2">
                    {[
                      { icon: Linkedin, action: () => shareOnSocial('linkedin'), color: '#0077B5' },
                      { icon: Facebook, action: () => shareOnSocial('facebook'), color: '#1877F2' },
                      { icon: Mail, action: () => shareOnSocial('email'), color: COLORS.navy },
                    ].map(({ icon: Icon, action, color }, index) => (
                      <motion.button
                        key={index}
                        className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                        style={{ color }}
                        onClick={action}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.button>
                    ))}
                  </div>
                </GlassmorphismCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Like Button */}
        <motion.button
          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm shadow-lg flex items-center justify-center border border-white/20"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsLiked(!isLiked)}
          animate={{ 
            backgroundColor: isLiked ? '#ef4444' : 'rgba(255,255,255,0.2)' 
          }}
          transition={{ duration: 0.3 }}
        >
          <Heart 
            className={`w-5 h-5 transition-colors duration-300 ${
              isLiked ? 'text-white fill-current' : 'text-gray-600'
            }`} 
          />
        </motion.button>

        {/* Bookmark Button */}
        <motion.button
          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm shadow-lg flex items-center justify-center border border-white/20"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsBookmarked(!isBookmarked)}
          animate={{ 
            backgroundColor: isBookmarked ? COLORS.teal : 'rgba(255,255,255,0.2)' 
          }}
          transition={{ duration: 0.3 }}
        >
          <Bookmark 
            className={`w-5 h-5 transition-colors duration-300 ${
              isBookmarked ? 'text-white fill-current' : 'text-gray-600'
            }`} 
          />
        </motion.button>
      </motion.div>

      {/* Header Section */}
      <motion.div 
        className="relative overflow-hidden -mt-[1px]" 
        style={{ 
          background: `linear-gradient(135deg, ${COLORS.navy} 0%, #1a4055 100%)`,
          y: headerY
        }}
      >
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

        <div className="relative z-10">
          {/* Back to Blog Navigation */}
          <motion.div 
            className="px-6 py-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="max-w-7xl mx-auto">
              <Link
                href="/blog"
                className="inline-flex items-center text-sm text-white/80 hover:text-white transition-colors duration-200 group"
              >
                <motion.div
                  whileHover={{ x: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                </motion.div>
                Back to Blog
              </Link>
            </div>
          </motion.div>

          {/* Hero Section */}
          <div className="px-6 pb-16 pt-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-4xl mx-auto">
                {/* Stats Row */}
                <motion.div
                  className="flex items-center justify-center gap-6 mb-6 text-white/60 text-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>2.3K views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>127 likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bookmark className="w-4 h-4" />
                    <span>89 saves</span>
                  </div>
                </motion.div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <motion.div 
                    className="flex flex-wrap justify-center gap-2 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {post.tags.map((tag, index) => (
                      <motion.span 
                        key={tag}
                        className="px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm"
                        style={{ background: `${COLORS.teal}40`, color: COLORS.teal }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        #{tag}
                      </motion.span>
                    ))}
                  </motion.div>
                )}

                <motion.h1 
                  className="text-4xl md:text-6xl font-black mb-6 leading-tight text-white"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <Balancer>{post._title}</Balancer>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-gray-300 mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  {post.description}
                </motion.p>

                {/* Meta Info */}
                <motion.div 
                  className="flex items-center justify-center gap-6 text-gray-400 mb-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author || 'Promptly Printed Team'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(post.date || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {readingTime && (
                    <div className="flex items-center gap-2">
                      <span>{readingTime} read</span>
                    </div>
                  )}
                </motion.div>

                {/* Hero Image */}
                {post.image?.url && (
                  <motion.div 
                    className="mb-8"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                  >
                    <GlassmorphismCard>
                      <img 
                        src={post.image.url} 
                        alt={post.image.alt || post._title} 
                        className="w-full max-w-4xl mx-auto h-60 sm:h-96 object-cover rounded-xl"
                        width={post.image.width || 800}
                        height={post.image.height || 400}
                      />
                    </GlassmorphismCard>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <motion.div 
        className="bg-gray-50 min-h-screen relative z-10"
        style={{ y: contentY }}
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Left Sidebar */}
            <motion.div 
              className="lg:col-span-1 space-y-8 lg:sticky lg:top-8 lg:self-start"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {/* Table of Contents */}
              <GlassmorphismCard>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <List className="w-5 h-5" style={{ color: COLORS.teal }} />
                  Contents
                </h3>
                <nav className="space-y-2">
                  {tableOfContents.length > 0 ? (
                    tableOfContents.map((item, index) => (
                      <motion.a
                        key={item.id}
                        href={`#${item.id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        onClick={(e) => {
                          e.preventDefault();
                          const element = document.getElementById(item.id);
                          if (element) {
                            element.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start'
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
                      </motion.a>
                    ))
                  ) : (
                    <>
                      <motion.a
                        href="#introduction"
                        className="block text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-md px-3 py-2 transition-all duration-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        Introduction
                      </motion.a>
                      <motion.a
                        href="#by-2026"
                        className="block text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-md px-3 py-2 transition-all duration-200 pl-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        By 2026: AI takes over the busywork
                      </motion.a>
                      <motion.a
                        href="#by-2027"
                        className="block text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-md px-3 py-2 transition-all duration-200 pl-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        By 2027: Design starts running in parallel
                      </motion.a>
                    </>
                  )}
                </nav>
              </GlassmorphismCard>
            </motion.div>

            {/* Main Content */}
            <motion.div 
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <GlassmorphismCard className="article-content">
                <MDXContent>
                  {(() => {
                    // Safe content rendering with enhanced demo content
                    if (post.body?.plainText && typeof post.body.plainText === 'string' && post.body.plainText.trim().length > 0) {
                      return (
                        <div 
                          className="text-gray-700 leading-relaxed space-y-6"
                          dangerouslySetInnerHTML={{ __html: renderMarkdownContent(post.body.plainText) }}
                        />
                      );
                    } else {
                      // Enhanced demo content with animations
                      return (
                        <div className="space-y-8">
                          <motion.div 
                            id="rewind-to-the-year-2000"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                          >
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 mt-12 leading-tight scroll-mt-24">Rewind to the year 2000</h2>
                            
                            <p className="text-lg leading-relaxed mb-6 text-gray-700">
                              My school computer lab just upgraded to Windows 98. You dial up a travel agent to book your summer vacation. Finance teams are running on spreadsheets.
                            </p>
                            
                            <p className="text-lg leading-relaxed mb-6 text-gray-700">
                              Fast-forward to today. The same lab has kids writing software with AI agents. I can book a vacation with a few taps on my phone. Most finance teams? Still running on spreadsheets.
                            </p>
                            
                            <blockquote className="border-l-4 pl-6 py-4 mb-8 italic text-gray-600 text-lg leading-relaxed bg-gray-50 rounded-r-lg" style={{ borderColor: COLORS.teal }}>
                              <em>Gradually, then suddenly.</em>
                            </blockquote>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-r from-teal-50 to-orange-50 rounded-2xl p-8 my-12"
                          >
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                              The AI Revolution in Custom Design
                            </h3>
                            <p className="text-lg leading-relaxed text-gray-700">
                              We're witnessing the transformation of how custom apparel businesses operate. 
                              AI is not just assisting designers—it's revolutionizing the entire creative process.
                            </p>
                          </motion.div>

                          <motion.div 
                            id="by-2026-agents-take-over-the-busywork"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            viewport={{ once: true }}
                          >
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 mt-12 leading-tight scroll-mt-24">
                              By 2026: AI agents take over the design busywork
                            </h2>
                            
                            <p className="text-lg leading-relaxed mb-6 text-gray-700">
                              Picture the most routine design task in your business: a customer wants a custom logo on a t-shirt for their company event.
                            </p>
                            
                            <motion.ol 
                              className="space-y-4 mb-8 text-lg pl-6"
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              transition={{ duration: 0.6, staggerChildren: 0.1 }}
                              viewport={{ once: true }}
                            >
                              {[
                                { step: "1.", text: "Customer describes their vision and uploads their logo: ", time: "5 minutes" },
                                { step: "2.", text: "Designer reviews requirements and creates mockups: ", time: "45 minutes" },
                                { step: "3.", text: "Back-and-forth revisions and file preparation: ", time: "another 30 minutes" }
                              ].map((item, index) => (
                                <motion.li 
                                  key={index}
                                  className="flex gap-4"
                                  initial={{ opacity: 0, x: -20 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.4, delay: index * 0.1 }}
                                  viewport={{ once: true }}
                                >
                                  <span className="font-bold text-teal-600">{item.step}</span>
                                  <div className="text-gray-700">
                                    {item.text}<strong>{item.time}</strong>
                                  </div>
                                </motion.li>
                              ))}
                            </motion.ol>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-2xl p-8 border border-purple-100"
                          >
                            <h4 className="text-xl font-bold text-gray-900 mb-4">
                              The Promptly Printed Advantage
                            </h4>
                            <p className="text-lg leading-relaxed mb-6 text-gray-700">
                              With our AI design agents, that 80-minute process becomes a 5-minute interaction. 
                              Our AI understands your brand, generates multiple variations, and prepares print-ready files automatically.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {[
                                { metric: "10x", desc: "More designs per day" },
                                { metric: "50+", desc: "Variations in seconds" },
                                { metric: "0", desc: "Wait time for customers" }
                              ].map((item, index) => (
                                <motion.div
                                  key={index}
                                  className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  whileInView={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.4, delay: index * 0.1 }}
                                  viewport={{ once: true }}
                                >
                                  <div className="text-2xl font-black text-teal-600 mb-1">{item.metric}</div>
                                  <div className="text-sm text-gray-600">{item.desc}</div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        </div>
                      );
                    }
                  })()}
                </MDXContent>
              </GlassmorphismCard>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}