import { Suspense } from 'react';
import { blog } from '@repo/cms';
import { Feed } from '@repo/cms/components/feed';
import type { Blog, WithContext } from '@repo/seo/json-ld';
import { JsonLd } from '@repo/seo/json-ld';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import AnimatedBlogContent from './components/AnimatedBlogContent';

const title = 'Blog';
const description = 'Thoughts, ideas, and opinions.';

export const metadata: Metadata = createMetadata({ title, description });

// Mock data with enhanced fields for demonstration
const mockPosts = [
  {
    _slug: 'ultimate-custom-tshirt-guide',
    _title: 'The Ultimate Guide to Custom T-Shirt Design in 2024',
    description: 'Discover the latest trends, AI-powered design tools, and expert tips for creating stunning custom apparel that stands out.',
    image: { url: '/blog/tshirt-guide.jpg', alt: 'Custom T-shirt design guide', width: 800, height: 400 },
    date: '2024-01-15',
    readTime: '8 min read',
    tags: ['Design', 'AI', 'Trends'],
    author: 'Sarah Johnson',
    featured: true
  },
  {
    _slug: 'ai-powered-printing',
    _title: 'How AI is Revolutionizing Print-on-Demand',
    description: 'Explore how artificial intelligence is transforming the way we create, customize, and print apparel.',
    image: { url: '/blog/ai-printing.jpg', alt: 'AI printing technology', width: 800, height: 400 },
    date: '2024-01-12',
    readTime: '6 min read',
    tags: ['AI', 'Technology', 'Innovation'],
    author: 'Mike Chen',
    featured: false
  },
  {
    _slug: 'sustainable-printing',
    _title: 'Sustainable Printing: Our Eco-Friendly Approach',
    description: 'Learn about our commitment to environmental sustainability and eco-friendly printing practices.',
    image: { url: '/blog/sustainable.jpg', alt: 'Sustainable printing practices', width: 800, height: 400 },
    date: '2024-01-10',
    readTime: '5 min read',
    tags: ['Sustainability', 'Environment', 'Innovation'],
    author: 'Emma Rodriguez',
    featured: false
  },
  {
    _slug: 'design-trends-2024',
    _title: '2024 Design Trends: What\'s Hot in Custom Apparel',
    description: 'Stay ahead of the curve with the latest design trends that are shaping the custom apparel industry.',
    image: { url: '/blog/trends-2024.jpg', alt: '2024 design trends', width: 800, height: 400 },
    date: '2024-01-08',
    readTime: '7 min read',
    tags: ['Trends', 'Design', 'Fashion'],
    author: 'Alex Kim',
    featured: false
  }
];

const BlogIndex = async () => {
  const draft = await draftMode();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl">Loading amazing blog content...</div>
    </div>}>
      <Feed queries={[blog.postsQuery]} draft={draft.isEnabled}>
        {async ([data]) => {
          'use server';

          let posts = mockPosts; // Default fallback

          // Debug: Log the actual Basehub structure
          console.log('Basehub data structure:', JSON.stringify(data, null, 2));
          if (data?.blog?.posts?.items?.[0]) {
            console.log('First post structure:', JSON.stringify(data.blog.posts.items[0], null, 2));
          }

          // Safely transform Basehub data
          try {
            if (data?.blog?.posts?.items && Array.isArray(data.blog.posts.items) && data.blog.posts.items.length > 0) {
              posts = data.blog.posts.items.map((post: any, index: number) => {
                // Safe property access with multiple fallbacks
                const safePost = post || {};
                const safeSys = safePost._sys || {};
                const safeAuthor = safePost.author || {};
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
                    alt: safeImage.alt || safePost._title || safePost.title || 'Blog post',
                    width: safeImage.width || 800,
                    height: safeImage.height || 400
                  };
                } else {
                  safeImageObj = {
                    url: '/blog/default.jpg',
                    alt: safePost._title || safePost.title || 'Blog post',
                    width: 800,
                    height: 400
                  };
                }

                return {
                  _slug: safePost._slug || safePost.slug || `post-${index}-${Date.now()}`,
                  _title: safePost._title || safePost.title || safePost.name || 'Untitled Post',
                  description,
                  image: safeImageObj,
                  date: safeDate,
                  readTime: safePost.readTime || `${Math.max(1, Math.ceil((description.length || 300) / 200))} min read`,
                  tags: safePost.tags || safePost.categories || safePost.topics || [],
                  author: safeAuthor.name || safeAuthor.displayName || safePost.author || safePost.authorName || 'Promptly Printed Team',
                  featured: safePost.featured || safePost.isFeatured || safePost.isHighlighted || index === 0
                };
              });
            }
          } catch (error) {
            console.error('Error processing Basehub data, using fallback:', error);
            posts = mockPosts;
          }

          // Enhanced JSON-LD for better SEO
          const jsonLd: WithContext<Blog> = {
            '@type': 'Blog',
            '@context': 'https://schema.org',
            name: 'Promptly Printed Blog',
            description: 'Discover the latest in AI-powered design, custom apparel trends, and innovative printing techniques.',
            url: 'https://promptlyprinted.com/blog',
            publisher: {
              '@type': 'Organization',
              name: 'Promptly Printed',
              logo: {
                '@type': 'ImageObject',
                url: 'https://promptlyprinted.com/logo.png'
              }
            },
            blogPost: posts.map(post => ({
              '@type': 'BlogPosting',
              headline: post._title,
              description: post.description,
              datePublished: post.date,
              author: {
                '@type': 'Person',
                name: post.author
              },
              image: post.image.url,
              url: `https://promptlyprinted.com/blog/${post._slug}`,
              keywords: post.tags?.join(', ') || undefined
            }))
          };

          return (
            <>
              <JsonLd code={jsonLd} />
              <AnimatedBlogContent posts={posts} />
            </>
          );
        }}
      </Feed>
    </Suspense>
  );
};

export default BlogIndex;