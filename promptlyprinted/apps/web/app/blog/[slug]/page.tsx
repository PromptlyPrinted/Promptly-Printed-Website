import { blog } from '@repo/cms';
import { JsonLd } from '@repo/seo/json-ld';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import AnimatedBlogPostContent from '../components/AnimatedBlogPostContent';
import '../blog.css';

type BlogPostProperties = {
  readonly params: Promise<{
    slug: string;
  }>;
};

export const generateMetadata = async ({
  params,
}: BlogPostProperties): Promise<Metadata> => {
  const { slug } = (await params);
  const post = await blog.getPost(slug);

  if (!post) {
    return {};
  }

  return createMetadata({
    title: post._title,
    description: post.description,
    image: post.image?.url,
  });
};

export const generateStaticParams = async (): Promise<{ slug: string }[]> => {
  const posts = await blog.getPosts();

  return posts.map(({ _slug }) => ({ slug: _slug }));
};

const BlogPost = async ({ params }: BlogPostProperties) => {
  const { slug } = (await params);
  const post = await blog.getPost(slug);

  if (!post) {
    notFound();
  }

  // Enhanced JSON-LD for better SEO
  const jsonLd = {
    '@context': 'https://schema.org' as const,
    '@type': 'BlogPosting' as const,
    headline: post._title,
    description: post.description || '',
    image: post.image?.url || '',
    datePublished: post.date || new Date().toISOString(),
    dateModified: post.date || new Date().toISOString(),
    author: {
      '@type': 'Person' as const,
      name: (post as any).author || (post as any).authors?.[0]?.name || 'Promptly Printed Team'
    },
    publisher: {
      '@type': 'Organization' as const,
      name: 'Promptly Printed',
      logo: {
        '@type': 'ImageObject' as const,
        url: 'https://promptlyprinted.com/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage' as const,
      '@id': `https://promptlyprinted.com/blog/${slug}`
    },
    keywords: (post as any).tags?.join?.(', ') || undefined
  };

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading amazing content...</div>
      </div>
    }>
      <AnimatedBlogPostContent post={post} />
      <JsonLd code={jsonLd} />
    </Suspense>
  );
};

export default BlogPost;
