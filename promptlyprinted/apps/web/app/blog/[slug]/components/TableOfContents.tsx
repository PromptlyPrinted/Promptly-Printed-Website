'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { List } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content?: any; // Rich CMS content
  markdownContent?: string; // Markdown content
}

// Parse markdown content to extract headings
const parseMarkdownHeadings = (markdown: string): TOCItem[] => {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    headings.push({ id, text, level });
  }

  return headings;
};

// Parse CMS rich content to extract headings
const parseCMSHeadings = (content: any): TOCItem[] => {
  if (!content?.content) return [];

  const headings: TOCItem[] = [];

  const traverseContent = (nodes: any[]) => {
    nodes.forEach((node) => {
      if (node.nodeType === 'heading' && node.content) {
        const level = parseInt(node.attrs?.level || '1');
        const text = node.content
          .map((textNode: any) => textNode.value || '')
          .join('')
          .trim();
        
        if (text) {
          const id = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

          headings.push({ id, text, level });
        }
      }

      if (node.content) {
        traverseContent(node.content);
      }
    });
  };

  traverseContent(content.content);
  return headings;
};

export default function TableOfContents({ content, markdownContent }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // Generate table of contents from content
  useEffect(() => {
    let tocItems: TOCItem[] = [];

    if (content) {
      // Parse CMS content
      tocItems = parseCMSHeadings(content);
    } else if (markdownContent) {
      // Parse Markdown content
      tocItems = parseMarkdownHeadings(markdownContent);
    }

    setHeadings(tocItems);
  }, [content, markdownContent]);

  // Set up intersection observer for scroll tracking
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry that's most visible
        let mostVisibleEntry = entries[0];
        let maxVisibility = 0;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxVisibility) {
            maxVisibility = entry.intersectionRatio;
            mostVisibleEntry = entry;
          }
        });

        if (mostVisibleEntry?.isIntersecting) {
          const headingElement = mostVisibleEntry.target as HTMLElement;
          setActiveId(headingElement.id);
        }
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    // Observe all headings
    const headingElements = headings
      .map(heading => document.getElementById(heading.id))
      .filter(Boolean) as HTMLElement[];

    headingElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      headingElements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, [headings]);

  // Smooth scroll to heading
  const scrollToHeading = useCallback((headingId: string) => {
    const element = document.getElementById(headingId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      setActiveId(headingId);
    }
  }, []);

  if (headings.length === 0) {
    return null;
  }

  return (
    <motion.div 
      className="sticky top-24 bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
        <List className="w-5 h-5" style={{ color: '#14B8A6' }} />
        <h3 className="font-display font-bold" style={{ color: '#0F172A' }}>Contents</h3>
      </div>

      <nav className="space-y-1">
        {headings.map((heading, index) => {
          const isActive = activeId === heading.id;
          const indentClass = 
            heading.level === 1 ? 'pl-0' :
            heading.level === 2 ? 'pl-4' :
            heading.level === 3 ? 'pl-8' :
            'pl-12';

          return (
            <div key={heading.id} className="relative">
              {/* Active highlight with layoutId for smooth animation */}
              {isActive && (
                <motion.div
                  layoutId="active-highlight"
                  className="absolute inset-0 rounded-lg border-l-2"
                  style={{ 
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    borderLeftColor: '#14B8A6'
                  }}
                  initial={false}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 30 
                  }}
                />
              )}
              
              <motion.button
                onClick={() => scrollToHeading(heading.id)}
                className={`
                  relative z-10 w-full text-left px-3 py-2 rounded-lg transition-all duration-200
                  ${indentClass}
                  font-medium
                `}
                style={{
                  color: isActive ? '#14B8A6' : '#475569'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#0F172A';
                    e.currentTarget.style.backgroundColor = 'rgba(241, 245, 249, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <span className="text-sm leading-relaxed block">
                  {heading.text}
                </span>
              </motion.button>
            </div>
          );
        })}
      </nav>

      {/* Reading Progress Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs" style={{ color: '#475569' }}>
          <div className="flex-1">
            <div className="h-1 rounded-full overflow-hidden bg-gray-100">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: '#14B8A6' }}
                initial={{ width: 0 }}
                animate={{ 
                  width: headings.length > 0 
                    ? `${((headings.findIndex(h => h.id === activeId) + 1) / headings.length) * 100}%`
                    : '0%'
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
          <span className="whitespace-nowrap">
            {headings.findIndex(h => h.id === activeId) + 1} of {headings.length}
          </span>
        </div>
      </div>
    </motion.div>
  );
}