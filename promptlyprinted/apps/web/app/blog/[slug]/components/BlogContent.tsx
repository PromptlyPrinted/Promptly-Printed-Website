'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import { motion } from 'framer-motion';
import { Body } from '@repo/cms/components/body';

interface BlogContentProps {
  content?: any; // Rich content from CMS
  markdownContent?: string; // Fallback markdown content
  plainTextContent?: string; // Fallback plain text
}

// Custom components for ReactMarkdown
const MarkdownComponents = {
  h1: ({ children, ...props }: any) => (
    <h1 
      className="text-4xl font-display font-black mt-16 mb-6 border-l-4 pl-4 transition-colors duration-300 hover:text-teal-600" 
      style={{ 
        color: '#0F172A',
        borderLeftColor: '#14B8A6'
      }}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 
      className="text-4xl font-display font-black mt-16 mb-6 border-l-4 pl-4 transition-colors duration-300 hover:text-teal-600" 
      style={{ 
        color: '#0F172A',
        borderLeftColor: '#14B8A6'
      }}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 
      className="text-2xl font-display font-bold mt-12 mb-4 transition-colors duration-300 hover:text-teal-600" 
      style={{ color: '#0F172A' }}
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4 
      className="text-xl font-display font-bold mt-8 mb-3 transition-colors duration-300 hover:text-teal-600" 
      style={{ color: '#0F172A' }}
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }: any) => (
    <p 
      className="text-lg leading-relaxed mb-6" 
      style={{ color: '#475569' }}
      {...props}
    >
      {children}
    </p>
  ),
  ul: ({ children, ...props }: any) => (
    <ul 
      className="list-disc list-inside space-y-2 mb-6 pl-4" 
      style={{ color: '#475569' }}
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol 
      className="list-decimal list-inside space-y-2 mb-6 pl-4" 
      style={{ color: '#475569' }}
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li 
      className="text-lg leading-relaxed" 
      style={{ color: '#475569' }}
      {...props}
    >
      {children}
    </li>
  ),
  a: ({ children, href, ...props }: any) => (
    <a 
      href={href}
      className="underline-offset-4 hover:underline transition-all duration-200 font-medium hover:scale-105" 
      style={{ color: '#14B8A6' }}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote 
      className="border-l-4 pl-6 py-4 my-8 italic rounded-r-lg transition-all duration-300 hover:shadow-md" 
      style={{
        borderLeftColor: '#F97316',
        backgroundColor: 'rgba(249, 115, 22, 0.05)',
        color: '#475569'
      }}
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...props }: any) => {
    const isInline = !className;
    
    if (isInline) {
      return (
        <code 
          className="px-2 py-1 rounded text-sm font-mono transition-colors duration-200 hover:bg-orange-100"
          style={{
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            color: '#F97316'
          }}
          {...props}
        >
          {children}
        </code>
      );
    }
    
    return (
      <code 
        className={`block p-4 rounded-lg overflow-x-auto font-mono text-sm border ${className}`}
        style={{
          backgroundColor: '#F8FAFC',
          color: '#0F172A',
          borderColor: 'rgba(71, 85, 105, 0.2)'
        }}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: any) => (
    <pre 
      className="bg-blog-surface text-blog-primary-text p-6 rounded-xl overflow-x-auto my-6 border border-blog-surface"
      {...props}
    >
      {children}
    </pre>
  ),
  img: ({ src, alt, ...props }: any) => (
    <div className="my-8">
      <img
        src={src}
        alt={alt}
        className="w-full rounded-xl shadow-lg border border-blog-surface/20"
        {...props}
      />
      {alt && (
        <p className="text-center text-blog-secondary-text text-sm mt-2 italic">
          {alt}
        </p>
      )}
    </div>
  ),
  hr: ({ ...props }: any) => (
    <hr 
      className="border-blog-secondary-text/30 my-12 border-t-2" 
      {...props} 
    />
  ),
  strong: ({ children, ...props }: any) => (
    <strong 
      className="font-bold text-blog-primary-text" 
      {...props}
    >
      {children}
    </strong>
  ),
  em: ({ children, ...props }: any) => (
    <em 
      className="italic text-blog-primary-text" 
      {...props}
    >
      {children}
    </em>
  ),
};

// Component that adds IDs to headings in CMS content
const BodyWithHeadingIds = ({ content }: { content: any }) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!bodyRef.current) return;
    
    // Find all headings and add IDs
    const headings = bodyRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headings.forEach((heading) => {
      const text = heading.textContent || '';
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      heading.id = id;
      heading.classList.add('scroll-mt-24');
    });
  }, [content]);

  return (
    <div ref={bodyRef} className="cms-content">
      <Body content={content} />
    </div>
  );
};

export default function BlogContent({ 
  content, 
  markdownContent, 
  plainTextContent 
}: BlogContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <motion.article 
      ref={containerRef}
      className="max-w-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      style={{ maxWidth: '75ch' }} // Optimal reading line length
    >
      {content ? (
        // Rich CMS content
        <div className="prose prose-lg max-w-none
          prose-headings:text-blog-primary-text prose-headings:font-display prose-headings:font-black
          prose-p:text-blog-primary-text prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
          prose-a:text-blog-accent prose-a:underline-offset-4 hover:prose-a:underline prose-a:font-medium
          prose-strong:text-blog-primary-text prose-strong:font-bold
          prose-ul:my-6 prose-ol:my-6 prose-li:my-2 prose-li:text-blog-primary-text
          prose-blockquote:border-l-4 prose-blockquote:border-blog-secondary-text/50 prose-blockquote:bg-blog-surface/20 prose-blockquote:p-6 prose-blockquote:my-8 prose-blockquote:rounded-r-lg
          prose-code:bg-blog-surface prose-code:text-blog-accent prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
          prose-pre:bg-blog-surface prose-pre:text-blog-primary-text prose-pre:p-6 prose-pre:rounded-xl prose-pre:border prose-pre:border-blog-surface
          prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-blog-surface/20
          prose-hr:border-blog-secondary-text/30 prose-hr:my-12 prose-hr:border-t-2
          prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:border-l-4 prose-h2:border-blog-accent prose-h2:pl-4
          prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4
          prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-3
        ">
          <BodyWithHeadingIds content={content} />
        </div>
      ) : markdownContent ? (
        // Markdown content
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={MarkdownComponents}
            rehypePlugins={[rehypeSlug]}
          >
            {markdownContent}
          </ReactMarkdown>
        </div>
      ) : plainTextContent ? (
        // Plain text content
        <div className="text-lg leading-relaxed text-blog-primary-text space-y-6 whitespace-pre-line">
          {plainTextContent}
        </div>
      ) : (
        // No content fallback
        <div className="text-blog-secondary-text text-center py-8">
          <p className="text-lg">No content available.</p>
        </div>
      )}
    </motion.article>
  );
}