import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { blog } from '@repo/cms';
import { Feed } from '@repo/cms/components/feed';
import { createMetadata } from '@repo/seo/metadata';
import type { WithContext, BlogPosting } from '@repo/seo/json-ld';
import { JsonLd } from '@repo/seo/json-ld';
import { draftMode } from 'next/headers';
import BlogPostContent from './components/BlogPostContent';
import { Body } from '@repo/cms/components/body';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for the blog post
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const draft = await draftMode();
  const { slug } = await params;
  
  try {
    // This would fetch the specific post data
    // For now, return default metadata
    return createMetadata({
      title: 'Blog Post | Promptly Printed',
      description: 'Read our latest insights on AI-powered design and custom apparel.',
      canonical: `/blog/${slug}`
    });
  } catch (error) {
    return createMetadata({
      title: 'Blog Post Not Found | Promptly Printed',
      description: 'The requested blog post could not be found.',
    });
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const draft = await draftMode();
  const { slug } = await params;

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-xl text-slate-600">Loading article...</div>
      </div>
    }>
      <Feed queries={[blog.postsQuery]} draft={draft.isEnabled}>
        {async ([data]) => {
          'use server';

          // Find the specific post by slug
          const posts = data?.blog?.posts?.items || [];
          const post = posts.find((p: any) => p._slug === slug);

          if (!post) {
            notFound();
          }

          // Process the post data safely
          const safePost = {
            id: post._id || slug,
            slug: post._slug || slug,
            title: post._title || 'Untitled Post',
            content: post.body?.json?.content || null,
            plainTextContent: post.body?.plainText || '',
            description: post.description || '',
            image: post.image?.url ? {
              url: post.image.url,
              alt: post.image.alt || post._title || 'Blog post image'
            } : null,
            date: post.date || new Date().toISOString(),
            author: post.authors?.[0]?._title || 'Promptly Printed Team',
            category: post.categories?.[0]?._title || 'General',
            tags: post.categories?.map((cat: any) => cat._title) || [],
            readTime: '5 min read',
            featured: false
          };

          // Rich content is available directly from the CMS

          // JSON-LD for blog posting
          const blogPostJsonLd: WithContext<BlogPosting> = {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: safePost.title,
            description: safePost.description,
            image: safePost.image?.url ? `https://promptlyprinted.com${safePost.image.url}` : undefined,
            datePublished: safePost.date,
            dateModified: safePost.date,
            author: {
              '@type': 'Person',
              name: safePost.author
            },
            publisher: {
              '@type': 'Organization',
              name: 'Promptly Printed',
              logo: {
                '@type': 'ImageObject',
                url: 'https://promptlyprinted.com/logo.png'
              }
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://promptlyprinted.com/blog/${slug}`
            },
            articleSection: safePost.category,
            keywords: safePost.tags.join(', ')
          };

          return (
            <>
              <JsonLd code={blogPostJsonLd} />
              <BlogPostContent 
                post={safePost} 
                richContent={safePost.content}
              />
            </>
          );
        }}
      </Feed>
    </Suspense>
  );
}