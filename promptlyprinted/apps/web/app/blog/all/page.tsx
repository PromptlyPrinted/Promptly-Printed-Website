import { Suspense } from 'react';
import { Metadata } from 'next';
import { blog } from '@repo/cms';
import { Feed } from '@repo/cms/components/feed';
import { createMetadata } from '@repo/seo/metadata';
import type { WithContext, CollectionPage, BreadcrumbList } from '@repo/seo/json-ld';
import { JsonLd } from '@repo/seo/json-ld';
import { draftMode } from 'next/headers';
import AllArticlesContent from './components/AllArticlesContent';

const title = 'All Articles | Promptly Printed Blog';
const description = 'Browse every article on AI-powered design, apparel trends, sustainable printing, and more.';

export const metadata: Metadata = createMetadata({ 
  title, 
  description,
  canonical: '/blog/all'
});


const categories = [
  { name: 'AI', description: 'Artificial intelligence in design and printing' },
  { name: 'Design', description: 'Creative principles and design techniques' },
  { name: 'Trends', description: 'Latest fashion and apparel trends' },
  { name: 'Technology', description: 'Cutting-edge printing and production tech' },
  { name: 'Sustainability', description: 'Eco-friendly practices and materials' }
];

export default async function AllArticlesPage() {
  const draft = await draftMode();

  // JSON-LD for breadcrumbs
  const breadcrumbsJsonLd: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://promptlyprinted.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://promptlyprinted.com/blog'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'All Articles',
        item: 'https://promptlyprinted.com/blog/all'
      }
    ]
  };

  return (
    <>
      <JsonLd code={breadcrumbsJsonLd} />
      
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="text-xl text-white">Loading articles...</div>
        </div>
      }>
        <Feed queries={[blog.postsQuery]} draft={draft.isEnabled}>
          {async ([data]) => {
            'use server';

            let articles: Array<{
              id: string;
              slug: string;
              title: string;
              excerpt: string;
              category: string;
              image: string;
              date: string;
              readTime: string;
              featured: boolean;
              popular: boolean;
            }> = [];

            // Transform Basehub data using the same logic as the main blog page
            try {
              if (data?.blog?.posts?.items && Array.isArray(data.blog.posts.items) && data.blog.posts.items.length > 0) {
                articles = data.blog.posts.items.map((post: any, index: number) => {
                  // Safe property access with multiple fallbacks
                  const safePost = post || {};
                  const safeSys = safePost._sys || {};
                  const safeImage = safePost.image || {};
                  
                  // Generate safe date with comprehensive fallbacks
                  let safeDate = new Date().toISOString();
                  try {
                    // Get all possible date fields from the object
                    const getAllDateFields = (obj: any): string[] => {
                      const dates: string[] = [];
                      for (const key in obj) {
                        if (obj[key] && typeof obj[key] === 'string') {
                          // Check if it looks like a date string
                          if (key.toLowerCase().includes('date') || 
                              key.toLowerCase().includes('created') || 
                              key.toLowerCase().includes('published') || 
                              key.toLowerCase().includes('updated') ||
                              key.toLowerCase().includes('modified')) {
                            dates.push(obj[key]);
                          }
                        }
                      }
                      return dates;
                    };

                    const dateOptions = [
                      ...getAllDateFields(safePost),
                      ...getAllDateFields(safeSys)
                    ].filter(Boolean);
                    
                    if (dateOptions.length > 0) {
                      safeDate = new Date(dateOptions[0]).toISOString();
                    }
                  } catch (dateError) {
                    console.warn('Date parsing error for post:', safePost._slug || 'unknown', dateError);
                  }

                  // Generate safe description
                  const description = safePost.description || safePost.excerpt || safePost.summary || safePost.content?.substring(0, 300) || '';

                  // Safe image handling
                  let safeImageObj = null;
                  if (safeImage?.url && typeof safeImage.url === 'string') {
                    safeImageObj = {
                      url: safeImage.url,
                      alt: safeImage.alt || safePost._title || safePost.title || 'Blog post'
                    };
                  } else {
                    safeImageObj = {
                      url: '/blog/default.jpg',
                      alt: safePost._title || safePost.title || 'Blog post'
                    };
                  }

                  return {
                    id: safePost._id || `post-${index}-${Date.now()}`,
                    slug: safePost._slug || safePost.slug || `post-${index}-${Date.now()}`,
                    title: safePost._title || safePost.title || safePost.name || 'Untitled Post',
                    excerpt: description,
                    category: safePost.category || safePost.tags?.[0] || 'General',
                    image: safeImageObj.url,
                    date: safeDate,
                    readTime: safePost.readTime || `${Math.max(1, Math.ceil((description.length || 300) / 200))} min read`,
                    featured: safePost.featured || safePost.isFeatured || safePost.isHighlighted || false,
                    popular: safePost.popular || safePost.isPopular || false
                  };
                });
              }
            } catch (error) {
              console.error('Error processing Basehub data:', error);
              articles = [];
            }

            // JSON-LD for collection page with real data
            const collectionJsonLd: WithContext<CollectionPage> = {
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: 'All Articles - Promptly Printed Blog',
              description: 'Browse every article on AI-powered design, apparel trends, sustainable printing, and more.',
              url: 'https://promptlyprinted.com/blog/all',
              mainEntity: {
                '@type': 'ItemList',
                numberOfItems: articles.length,
                itemListElement: articles.map((article, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  item: {
                    '@type': 'BlogPosting',
                    headline: article.title,
                    description: article.excerpt,
                    url: `https://promptlyprinted.com/blog/${article.slug}`,
                    datePublished: article.date,
                    author: {
                      '@type': 'Organization',
                      name: 'Promptly Printed'
                    },
                    image: `https://promptlyprinted.com${article.image}`
                  }
                }))
              }
            };

            return (
              <>
                <JsonLd code={collectionJsonLd} />
                <AllArticlesContent articles={articles} categories={categories} />
              </>
            );
          }}
        </Feed>
      </Suspense>
    </>
  );
}