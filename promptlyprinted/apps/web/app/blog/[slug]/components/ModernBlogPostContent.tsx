'use client';

import { motion } from 'framer-motion';
import Hero from './Hero';
import BlogContent from './BlogContent';
import TableOfContents from './TableOfContents';
import ShareWidget from './ShareWidget';
import '../modern-blog.css';
import '../../blog-layout.css';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content?: any;
  plainTextContent?: string;
  description?: string;
  image?: { url: string; alt: string | null };
  date?: string;
  author?: string;
  category?: string;
  tags?: string[];
  readTime?: string;
  featured?: boolean;
}

interface ModernBlogPostContentProps {
  post: BlogPost;
  richContent?: any;
}

export default function ModernBlogPostContent({ post, richContent }: ModernBlogPostContentProps) {
  return (
    <div className="min-h-screen modern-blog blog-layout bg-white">
      {/* Hero Section */}
      <div className="blog-hero">
        <Hero post={post} />
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
            {/* Left Sidebar - Table of Contents and Share Widget */}
            <motion.div 
              className="lg:col-span-3 space-y-8 order-2 lg:order-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="hidden lg:block">
                <TableOfContents 
                  content={richContent} 
                  markdownContent={post.plainTextContent} 
                />
              </div>
              
              <div className="hidden lg:block">
                <ShareWidget 
                  title={post.title}
                  description={post.description}
                />
              </div>
            </motion.div>

            {/* Main Content Area */}
            <motion.main 
              className="lg:col-span-9 order-1 lg:order-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <article 
                className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg border border-gray-100"
              >
                <BlogContent
                  content={richContent}
                  plainTextContent={post.plainTextContent}
                />
              </article>
            </motion.main>
          </div>

          {/* Mobile Table of Contents and Share */}
          <div className="lg:hidden mt-12 space-y-8">
            <TableOfContents 
              content={richContent} 
              markdownContent={post.plainTextContent} 
            />
            
            <ShareWidget 
              title={post.title}
              description={post.description}
            />
          </div>
        </div>
      </div>

      {/* Additional Sections could go here */}
      {/* Newsletter Signup, Related Articles, Comments, etc. */}
    </div>
  );
}