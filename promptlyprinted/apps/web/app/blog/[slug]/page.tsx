import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { blog } from '@repo/cms';
import { JsonLd } from '@repo/seo/json-ld';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Balancer from 'react-wrap-balancer';

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
  const draft = draftMode();
  const post = await blog.getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center text-gray-600 hover:text-gray-800"
      >
        <ArrowLeftIcon className="mr-2" /> Back to Blog
      </Link>
      <article className="prose prose-lg mx-auto">
        <h1 className="mb-4 font-bold text-4xl">
          <Balancer>{post._title}</Balancer>
        </h1>
        {post.image?.url && (
          <div className="mb-8">
            <img 
              src={post.image.url} 
              alt={post.image.alt || post._title} 
              className="rounded-lg w-full h-auto object-cover"
              width={post.image.width || 800}
              height={post.image.height || 400}
            />
          </div>
        )}
        {(() => {
          // Debug logging
          console.log('Post body type:', typeof post.body);
          console.log('Post body value:', post.body);
          
          // Safe content rendering with type checking
          if (post.body?.plainText && typeof post.body.plainText === 'string' && post.body.plainText.trim().length > 0) {
            return (
              <div className="text-gray-700 whitespace-pre-wrap">
                {post.body.plainText}
              </div>
            );
          } else if (post.description && typeof post.description === 'string') {
            return (
              <div className="text-gray-700 whitespace-pre-wrap">
                {post.description}
              </div>
            );
          } else {
            return (
              <div className="text-gray-600">
                <p>Content not available for this post.</p>
                <p className="text-sm mt-2">
                  Debug: Body type: {typeof post.body}, Value: {JSON.stringify(post.body)}
                </p>
              </div>
            );
          }
        })()}
      </article>
      <JsonLd
        code={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post._title,
          description: post.description || '',
          image: post.image?.url || '',
          datePublished: post.date || new Date().toISOString(),
          dateModified: post.date || new Date().toISOString(),
        }}
      />
    </div>
  );
};

export default BlogPost;
