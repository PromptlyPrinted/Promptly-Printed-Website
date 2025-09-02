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

const COLORS = {
  navy: '#0D2C45',
  teal: '#16C1A8', 
  orange: '#FF8A26',
  white: '#FFFFFF',
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
      heading.id = id;
      heading.classList.add('scroll-mt-24');
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

  // Generate table of contents and reading time from content
  useEffect(() => {
    const time = post.readTime || calculateReadingTime(post.plainTextContent || '');
    setReadingTime(time);
    
    // We'll generate the TOC after the content is rendered and headings have IDs
    // This ensures the TOC order matches the rendered heading order
    setTimeout(() => {
      const headings = document.querySelectorAll('.lg\\:col-span-3 h1, .lg\\:col-span-3 h2, .lg\\:col-span-3 h3, .lg\\:col-span-3 h4, .lg\\:col-span-3 h5, .lg\\:col-span-3 h6');
      const toc: TOCItem[] = Array.from(headings).map((heading) => {
        const text = heading.textContent || '';
        const id = heading.id || generateSlug(text);
        const level = parseInt(heading.tagName.replace('H', ''));
        
        return {
          id,
          text,
          level
        };
      });
      
      setTableOfContents(toc);
    }, 100); // Small delay to ensure content is rendered
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
    <div className="min-h-screen">
      {/* Header Section with Navbar style from blog page */}
      <div className="relative overflow-hidden -mt-[1px]" style={{ background: `linear-gradient(135deg, ${COLORS.navy} 0%, #1a4055 100%)` }}>
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
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-8 lg:self-start">
              {/* Social Sharing */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
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
              </div>

              {/* Table of Contents */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <List className="w-5 h-5" style={{ color: COLORS.teal }} />
                  Contents
                </h3>
                <nav className="space-y-2">
                  {tableOfContents.length > 0 ? (
                    tableOfContents.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          // Find all headings in the content area
                          const headings = document.querySelectorAll('.lg\\:col-span-3 h1, .lg\\:col-span-3 h2, .lg\\:col-span-3 h3, .lg\\:col-span-3 h4, .lg\\:col-span-3 h5, .lg\\:col-span-3 h6');
                          // Find the index of this TOC item
                          const tocIndex = tableOfContents.findIndex(tocItem => tocItem.id === item.id);
                          // Use the TOC index to get the corresponding rendered heading
                          const targetHeading = headings[tocIndex];
                          
                          console.log('TOC Click Debug:', {
                            clickedItem: item.text,
                            tocIndex,
                            totalHeadings: headings.length,
                            targetHeading: targetHeading?.textContent,
                            targetHeadingTag: targetHeading?.tagName
                          });
                          
                          if (targetHeading) {
                            // Get the heading's position
                            const rect = targetHeading.getBoundingClientRect();
                            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                            const targetY = rect.top + scrollTop - 100; // 100px offset for better visibility
                            
                            // Smooth scroll to the heading
                            window.scrollTo({
                              top: targetY,
                              behavior: 'smooth'
                            });
                            
                            setActiveHeading(item.id);
                          } else {
                            console.log('No target heading found!');
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
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 sm:p-12">
                  {richContent ? (
                    <div className="prose prose-lg prose-slate max-w-none
                      prose-headings:text-gray-900 prose-headings:font-bold
                      prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                      prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                      prose-strong:text-gray-900 prose-strong:font-semibold
                      prose-ul:my-6 prose-ol:my-6 prose-li:my-2
                      prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:bg-teal-50 prose-blockquote:p-6 prose-blockquote:my-8
                      prose-code:bg-slate-100 prose-code:text-slate-800 prose-code:px-2 prose-code:py-1 prose-code:rounded
                      prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:p-6 prose-pre:rounded-xl
                      prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-slate-200
                      prose-hr:border-slate-200 prose-hr:my-12
                    ">
                      <BodyWithHeadingIds content={richContent} />
                    </div>
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
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}