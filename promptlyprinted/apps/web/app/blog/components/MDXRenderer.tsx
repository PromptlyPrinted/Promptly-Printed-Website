'use client';

import { useMemo } from 'react';
import { bundleMDX } from 'mdx-bundler';
import { getMDXComponent } from 'mdx-bundler/client';
import { mdxComponents } from './MDXComponents';

interface MDXRendererProps {
  source: string;
}

export default function MDXRenderer({ source }: MDXRendererProps) {
  const Component = useMemo(() => {
    if (!source) return null;

    try {
      // Get the MDX component from the bundled source
      return getMDXComponent(source);
    } catch (error) {
      console.error('Error rendering MDX:', error);
      
      // Fallback to rendering as plain text with basic formatting
      return () => (
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ 
            __html: source
              .replace(/\n\n/g, '</p><p>')
              .replace(/\n/g, '<br>')
              .replace(/^/, '<p>')
              .replace(/$/, '</p>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/`(.*?)`/g, '<code>$1</code>')
          }} />
        </div>
      );
    }
  }, [source]);

  if (!Component) {
    return (
      <div className="prose prose-lg max-w-none">
        <p className="text-slate-600">No content available.</p>
      </div>
    );
  }

  return (
    <div className="prose prose-lg max-w-none">
      <Component components={mdxComponents as any} />
    </div>
  );
}

// Server-side MDX processing function
export async function processMDX(markdown: string) {
  if (!markdown) return null;

  try {
    const { code } = await bundleMDX({
      source: markdown,
      mdxOptions: (options) => ({
        ...options,
        remarkPlugins: [...(options.remarkPlugins ?? [])],
        rehypePlugins: [...(options.rehypePlugins ?? [])],
        development: process.env.NODE_ENV === 'development',
      }),
    });

    return code;
  } catch (error) {
    console.error('Error processing MDX:', error);
    return null;
  }
}