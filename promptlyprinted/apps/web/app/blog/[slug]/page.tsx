import { Sidebar } from '@/components/sidebar';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { blog } from '@repo/cms';
import { Body } from '@repo/cms/components/body';
import { Feed } from '@repo/cms/components/feed';
import { Image } from '@repo/cms/components/image';
import { TableOfContents } from '@repo/cms/components/toc';
import { env } from '@repo/env';
import { JsonLd } from '@repo/seo/json-ld';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Balancer from 'react-wrap-balancer';

type BlogPostProperties = {
  readonly params: {
    slug: string;
  };
};

export const generateMetadata = async ({
  params,
}: BlogPostProperties): Promise<Metadata> => {
  const { slug } = params;
  const post = await blog.getPost(slug);

  if (!post) {
    return {};
  }

  return createMetadata({
    title: post._title,
    description: post.description,
    image: post.image.url,
  });
};

export const generateStaticParams = async (): Promise<{ slug: string }[]> => {
  const posts = await blog.getPosts();

  return posts.map(({ _slug }) => ({ slug: _slug }));
};

const BlogPost = async ({ params }: BlogPostProperties) => {
  const { slug } = params;
  const draft = draftMode();
  const post = await blog.getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/blog" className="mb-8 inline-flex items-center text-gray-600 hover:text-gray-800">
        <ArrowLeftIcon className="mr-2" /> Back to Blog
      </Link>
      <article className="prose prose-lg mx-auto">
        <h1 className="mb-4 text-4xl font-bold">
          <Balancer>{post._title}</Balancer>
        </h1>
        {post.image && (
          <div className="mb-8">
            <Image {...post.image} alt={post._title} className="rounded-lg" />
          </div>
        )}
        <Body content={post.content} />
      </article>
      <JsonLd
        schema={{
          '@type': 'BlogPosting',
          headline: post._title,
          description: post.description,
          image: post.image?.url,
          datePublished: post._sys.createdAt,
          dateModified: post._sys.updatedAt,
        }}
      />
    </div>
  );
};

export default BlogPost;
