'use client';

import { ArrowLeftIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import Balancer from 'react-wrap-balancer';
import { useState, useEffect } from 'react';
import { Share2, Linkedin, Facebook, Mail, Star, List, Clock, User } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { motion } from 'framer-motion';
import { MDXContent, renderMarkdownContent } from './MDXContent';
import { generateTableOfContents, calculateReadingTime, type TOCItem } from '../utils/generateTOC';

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
  image?: { url: string; alt: string | null; width?: number; height?: number };
  date?: string;
  body?: { plainText: string };
  readTime?: string;
  tags?: string[];
  author?: string;
}

interface BlogPostContentProps {
  post: BlogPost;
}

export default function BlogPostContent({ post }: BlogPostContentProps) {
  const [email, setEmail] = useState('');
  const [tableOfContents, setTableOfContents] = useState<TOCItem[]>([]);
  const [activeHeading, setActiveHeading] = useState('');
  const [readingTime, setReadingTime] = useState('');

  // Generate table of contents and reading time from content
  useEffect(() => {
    const content = post.body?.plainText || post.description || '';
    const toc = generateTableOfContents(content);
    const time = post.readTime || calculateReadingTime(content);
    
    setTableOfContents(toc);
    setReadingTime(time);
  }, [post]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

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
                  <Balancer>{post._title}</Balancer>
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
                      alt={post.image.alt || post._title} 
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
                      </a>
                    ))
                  ) : (
                    <>
                      <a
                        href="#introduction"
                        className="block text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-md px-3 py-2 transition-all duration-200"
                      >
                        Introduction
                      </a>
                      <a
                        href="#by-2026"
                        className="block text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-md px-3 py-2 transition-all duration-200 pl-6"
                      >
                        By 2026: Agents take over the busywork
                      </a>
                      <a
                        href="#by-2027"
                        className="block text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-md px-3 py-2 transition-all duration-200 pl-6"
                      >
                        By 2027: Finance starts running in parallel
                      </a>
                    </>
                  )}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 sm:p-12">
                  <MDXContent>
                    {(() => {
                      // Safe content rendering with type checking
                      if (post.body?.plainText && typeof post.body.plainText === 'string' && post.body.plainText.trim().length > 0) {
                        return (
                          <div 
                            className="text-gray-700 leading-relaxed space-y-6"
                            dangerouslySetInnerHTML={{ __html: renderMarkdownContent(post.body.plainText) }}
                          />
                        );
                      } else if (post.description && typeof post.description === 'string') {
                        return (
                          <div 
                            className="text-gray-700 leading-relaxed space-y-6"
                            dangerouslySetInnerHTML={{ __html: renderMarkdownContent(post.description) }}
                          />
                        );
                      } else {
                        // Demo content with proper styling
                        return (
                          <div className="space-y-8">
                            <div id="rewind-to-the-year-2000">
                              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 mt-12 leading-tight scroll-mt-24">Rewind to the year 2000</h2>
                              
                              <p className="text-lg leading-relaxed mb-6 text-gray-700">
                                My school computer lab just upgraded to Windows 98. You dial up a travel agent to book your summer vacation. Finance teams are running on spreadsheets.
                              </p>
                              
                              <p className="text-lg leading-relaxed mb-6 text-gray-700">
                                Fast-forward to today. The same lab has kids writing software with AI agents. I can book a vacation with a few taps on my phone. Most finance teams? Still running on spreadsheets.
                              </p>
                              
                              <p className="text-lg leading-relaxed mb-8 text-gray-700">
                                So, what's the big rush? Well, how does any industry change?
                              </p>
                              
                              <blockquote className="border-l-4 pl-6 py-4 mb-8 italic text-gray-600 text-lg leading-relaxed bg-gray-50 rounded-r-lg" style={{ borderColor: '#16C1A8' }}>
                                <em>Gradually, then suddenly.</em>
                              </blockquote>
                              
                              <p className="text-lg leading-relaxed mb-6 text-gray-700">
                                Decades where nothing happens; months where decades happen.
                              </p>
                              
                              <p className="text-lg leading-relaxed mb-8 text-gray-700">
                                Three weeks ago we <a href="#" className="text-blue-600 underline hover:text-blue-800 transition-colors duration-200 font-medium">launched our first AI design agents</a>. Design teams at top companies have them working round the clock: creating variations, optimizing layouts, and generating custom apparel designs at scale.
                              </p>
                              
                              <p className="text-lg leading-relaxed mb-6 text-gray-700">
                                We used to train people to think like software. Now it's time for software to think like people: your most creative designers, brand strategists, and production experts.
                              </p>
                              
                              <p className="text-lg leading-relaxed mb-8 text-gray-700">
                                So, why are we expanding our AI capabilities so rapidly?
                              </p>
                              
                              <p className="text-lg leading-relaxed text-gray-700">
                                Because we're at a unique moment in custom design and manufacturing.
                              </p>
                            </div>

                            <div className="bg-teal-50 rounded-xl p-8 my-12" id="autonomous-design-is-being-built-right-now">
                              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 mt-10 leading-tight scroll-mt-24">Autonomous design is being built right now</h3>
                              <p className="text-lg leading-relaxed mb-6 text-gray-700">
                                The way custom apparel businesses manage design, production, and fulfillment will continue to shift towards AI automation over the next few years.
                              </p>
                              
                              <div className="space-y-4 text-lg mt-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                                  <span className="font-semibold">Manual Design</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                  <span>AI-Assisted Design</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                  <span>Fully Autonomous Creation</span>
                                </div>
                              </div>
                            </div>

                            <div id="by-2026-agents-take-over-the-busywork">
                              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 mt-12 leading-tight scroll-mt-24">By 2026: AI agents take over the design busywork</h2>
                              
                              <p className="text-lg leading-relaxed mb-6 text-gray-700">
                                Picture the most routine design task in your business: a customer wants a custom logo on a t-shirt for their company event.
                              </p>
                              
                              <ol className="space-y-4 mb-8 text-lg pl-6">
                                <li className="flex gap-4">
                                  <span className="font-bold text-teal-600">1.</span>
                                  <div className="text-gray-700">Customer describes their vision and uploads their logo: <strong>5 minutes</strong></div>
                                </li>
                                <li className="flex gap-4">
                                  <span className="font-bold text-teal-600">2.</span>
                                  <div className="text-gray-700">Designer reviews requirements and creates mockups: <strong>45 minutes</strong></div>
                                </li>
                                <li className="flex gap-4">
                                  <span className="font-bold text-teal-600">3.</span>
                                  <div className="text-gray-700">Back-and-forth revisions and file preparation: <strong>another 30 minutes</strong></div>
                                </li>
                              </ol>
                              
                              <p className="text-lg leading-relaxed mb-6 text-gray-700">
                                That's 80 minutes and $150 in design costs for a simple logo placement. Scale that across hundreds of custom orders and your design team is overwhelmed.
                              </p>
                              
                              <p className="text-lg leading-relaxed mb-8 text-gray-700">
                                With Promptly Printed's AI design agents, all you have to do is describe your vision and our agent immediately starts creating professional designs, suggesting improvements, and preparing print-ready files.
                              </p>
                              
                              <p className="text-lg leading-relaxed mb-6 text-gray-700">
                                If you're using <a href="#" className="text-blue-600 underline hover:text-blue-800 transition-colors duration-200 font-medium">our AI design platform</a>, here's what you're already seeing:
                              </p>
                              
                              <ul className="space-y-3 mb-8 text-lg pl-6">
                                <li className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                                  <span className="text-gray-700">Design teams? Creating 10x more custom designs per day</span>
                                </li>
                                <li className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                                  <span className="text-gray-700">Our AI agents? Generating 50+ design variations in seconds</span>
                                </li>
                                <li className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                                  <span className="text-gray-700">Your customers? Getting professional results without the wait</span>
                                </li>
                              </ul>
                              
                              <p className="text-lg leading-relaxed text-gray-700">
                                This is the first of a suite of AI design agents coming in the next year.
                              </p>
                            </div>

                            <div id="by-2027-design-starts-running-in-parallel" className="mt-16">
                              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 mt-12 leading-tight scroll-mt-24">By 2027: design starts running in parallel</h2>
                              
                              <p className="text-lg leading-relaxed mb-6 text-gray-700">
                                Today, custom design runs in 'series'. You're so used to it, you hardly notice.
                              </p>
                              
                              <p className="text-lg leading-relaxed mb-6 text-gray-700">
                                Take something simple: creating a custom t-shirt design.
                              </p>
                              
                              <ul className="space-y-4 mb-8 text-lg pl-6">
                                <li className="flex gap-4">
                                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-3"></div>
                                  <span className="text-gray-700">If you have an idea, then you sketch it out</span>
                                </li>
                                <li className="flex gap-4">
                                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-3"></div>
                                  <span className="text-gray-700">If the sketch looks good, then you digitize it</span>
                                </li>
                                <li className="flex gap-4">
                                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-3"></div>
                                  <span className="text-gray-700">If digital looks right, then you adjust colors and fonts</span>
                                </li>
                                <li className="flex gap-4">
                                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-3"></div>
                                  <span className="text-gray-700">If colors work, then you prepare files for printing</span>
                                </li>
                              </ul>
                              
                              <p className="text-lg leading-relaxed mb-6 text-gray-700">
                                It's a relay. Nothing moves until the previous step is completed. For as long as humans are doing the work this makes sense. Designers aren't going to waste time on printing prep until the design is approved.
                              </p>
                              
                              <p className="text-lg leading-relaxed text-gray-700">
                                But what if it's not humans doing the work? What if AI agents can work on all steps simultaneously, creating multiple variations and preparing them for production in real-time?
                              </p>
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </MDXContent>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}