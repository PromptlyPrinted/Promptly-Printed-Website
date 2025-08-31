'use client';

import { ReactNode } from 'react';

const COLORS = {
  navy: '#0D2C45',
  teal: '#16C1A8', 
  orange: '#FF8A26',
  white: '#FFFFFF',
};

// Custom components for styled content rendering
export const MDXComponents = {
  // Headings with proper SEO structure and styling
  h1: ({ children, id, ...props }: { children: ReactNode; id?: string }) => (
    <h1 
      id={id} 
      className="text-4xl md:text-5xl font-black text-gray-900 mb-8 mt-12 leading-tight scroll-mt-24" 
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, id, ...props }: { children: ReactNode; id?: string }) => (
    <h2 
      id={id} 
      className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 mt-12 leading-tight scroll-mt-24" 
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, id, ...props }: { children: ReactNode; id?: string }) => (
    <h3 
      id={id} 
      className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 mt-10 leading-tight scroll-mt-24" 
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, id, ...props }: { children: ReactNode; id?: string }) => (
    <h4 
      id={id} 
      className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 mt-8 leading-tight scroll-mt-24" 
      {...props}
    >
      {children}
    </h4>
  ),
  h5: ({ children, id, ...props }: { children: ReactNode; id?: string }) => (
    <h5 
      id={id} 
      className="text-lg md:text-xl font-semibold text-gray-900 mb-3 mt-6 leading-tight scroll-mt-24" 
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ children, id, ...props }: { children: ReactNode; id?: string }) => (
    <h6 
      id={id} 
      className="text-base md:text-lg font-semibold text-gray-900 mb-3 mt-6 leading-tight scroll-mt-24" 
      {...props}
    >
      {children}
    </h6>
  ),

  // Paragraphs
  p: ({ children, ...props }: { children: ReactNode }) => (
    <p className="text-lg leading-relaxed mb-6 text-gray-700" {...props}>
      {children}
    </p>
  ),

  // Links
  a: ({ children, href, ...props }: { children: ReactNode; href?: string }) => (
    <a 
      href={href} 
      className="text-blue-600 underline hover:text-blue-800 transition-colors duration-200 font-medium" 
      {...props}
    >
      {children}
    </a>
  ),

  // Lists
  ul: ({ children, ...props }: { children: ReactNode }) => (
    <ul className="space-y-3 mb-8 text-lg pl-6" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: { children: ReactNode }) => (
    <ol className="space-y-4 mb-8 text-lg pl-6" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: { children: ReactNode }) => (
    <li className="flex gap-4 text-gray-700 leading-relaxed" {...props}>
      {children}
    </li>
  ),

  // Code blocks
  pre: ({ children, ...props }: { children: ReactNode }) => (
    <pre 
      className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto mb-8 text-sm leading-relaxed" 
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({ children, ...props }: { children: ReactNode }) => (
    <code 
      className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono" 
      {...props}
    >
      {children}
    </code>
  ),

  // Blockquotes
  blockquote: ({ children, ...props }: { children: ReactNode }) => (
    <blockquote 
      className="border-l-4 pl-6 py-4 mb-8 italic text-gray-600 text-lg leading-relaxed bg-gray-50 rounded-r-lg" 
      style={{ borderColor: COLORS.teal }}
      {...props}
    >
      {children}
    </blockquote>
  ),

  // Images
  img: ({ src, alt, width, height, ...props }: { src?: string; alt?: string; width?: number; height?: number }) => (
    <div className="mb-8">
      <img 
        src={src} 
        alt={alt} 
        width={width}
        height={height}
        className="w-full h-auto object-cover rounded-xl shadow-lg" 
        {...props}
      />
      {alt && <p className="text-sm text-gray-500 mt-2 text-center italic">{alt}</p>}
    </div>
  ),

  // Tables
  table: ({ children, ...props }: { children: ReactNode }) => (
    <div className="overflow-x-auto mb-8">
      <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: { children: ReactNode }) => (
    <thead className="bg-gray-50" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: { children: ReactNode }) => (
    <tbody {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }: { children: ReactNode }) => (
    <tr className="border-b border-gray-200" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }: { children: ReactNode }) => (
    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-200 last:border-r-0" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: { children: ReactNode }) => (
    <td className="px-6 py-4 text-sm text-gray-700 border-r border-gray-200 last:border-r-0" {...props}>
      {children}
    </td>
  ),

  // Horizontal rule
  hr: ({ ...props }) => (
    <hr className="border-t-2 border-gray-200 my-12" {...props} />
  ),

  // Emphasized content
  em: ({ children, ...props }: { children: ReactNode }) => (
    <em className="italic text-gray-600" {...props}>
      {children}
    </em>
  ),
  strong: ({ children, ...props }: { children: ReactNode }) => (
    <strong className="font-bold text-gray-900" {...props}>
      {children}
    </strong>
  ),

  // Special components for blog content
  CalloutBox: ({ children, type = 'info', ...props }: { children: ReactNode; type?: 'info' | 'warning' | 'success' | 'error' }) => {
    const colors = {
      info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
      warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
      success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
      error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
    };
    const colorClasses = colors[type];
    
    return (
      <div 
        className={`${colorClasses.bg} ${colorClasses.border} ${colorClasses.text} border-l-4 p-6 mb-8 rounded-r-lg`} 
        {...props}
      >
        {children}
      </div>
    );
  },

  HighlightBox: ({ children, ...props }: { children: ReactNode }) => (
    <div 
      className="bg-teal-50 rounded-xl p-8 my-12 border-l-4" 
      style={{ borderColor: COLORS.teal }}
      {...props}
    >
      {children}
    </div>
  ),
};

interface MDXContentProps {
  children: ReactNode;
  className?: string;
}

export function MDXContent({ children, className = '' }: MDXContentProps) {
  return (
    <div className={`prose prose-lg max-w-none mdx-content ${className}`}>
      {children}
    </div>
  );
}

// Utility function to render markdown-like content with proper styling
export function renderMarkdownContent(content: string): string {
  if (!content) return '';
  
  return content
    .replace(/^### (.*$)/gim, '<h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4 mt-10 leading-tight scroll-mt-24">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6 mt-12 leading-tight scroll-mt-24">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-4xl md:text-5xl font-black text-gray-900 mb-8 mt-12 leading-tight scroll-mt-24">$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold text-gray-900">$1</strong>')
    .replace(/\*(.*)\*/gim, '<em class="italic text-gray-600">$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-600 underline hover:text-blue-800 transition-colors duration-200 font-medium">$1</a>')
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 pl-6 py-4 mb-8 italic text-gray-600 text-lg leading-relaxed bg-gray-50 rounded-r-lg" style="border-color: #16C1A8">$1</blockquote>')
    .replace(/\n\n/gim, '</p><p class="text-lg leading-relaxed mb-6 text-gray-700">')
    .replace(/^(?!<[h|b|u|e])/gim, '<p class="text-lg leading-relaxed mb-6 text-gray-700">')
    .replace(/$/gim, '</p>');
}

export default MDXContent;