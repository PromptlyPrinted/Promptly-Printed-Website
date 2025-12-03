import type { MetadataRoute } from 'next';
import { tshirtDetails } from '@/data/products';
import { blog, legal } from '@repo/cms';

// Utility to create clean slugs for URLs (matches the logic in product pages)
const createSlug = (str: string) =>
  str.toLowerCase().replace(/[''"]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://promptlyprinted.com';
  const now = new Date();

  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/products',
    '/pricing',
    '/faq',
    '/blog',
    '/blog/all-articles',
    '/search',
    '/showcase',
    '/designs',
    '/prompt-library',
    '/quiz',
    '/affiliate',
    '/refer-friend',
    '/track-order',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: (route === '' || route === '/products') ? ('daily' as const) : ('weekly' as const),
    priority: route === '' ? 1 : route === '/products' ? 0.9 : 0.8,
  }));

  // Product category pages
  const categoryRoutes = [
    '/products/all',
    '/products/men',
    '/products/women',
    '/products/kids-baby',
    '/products/accessories',
    '/products/home-living',
    '/products/others',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Dynamic product routes
  const productRoutes = Object.values(tshirtDetails).map((product) => {
    const categorySlug = createSlug(product.category);
    const productSlug = createSlug(product.name);
    return {
      url: `${baseUrl}/products/${categorySlug}/${productSlug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    };
  });

  // Blog posts
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await blog.getPosts();
    blogRoutes = posts.map((post) => ({
      url: `${baseUrl}/blog/${post._slug}`,
      lastModified: post.date ? new Date(post.date) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Failed to fetch blog posts for sitemap:', error);
  }

  // Legal pages
  let legalRoutes: MetadataRoute.Sitemap = [];
  try {
    const legalPages = await legal.getPosts();
    legalRoutes = legalPages.map((page) => ({
      url: `${baseUrl}/legal/${page._slug}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    }));
  } catch (error) {
    console.error('Failed to fetch legal pages for sitemap:', error);
  }

  // Combine all routes
  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...blogRoutes,
    ...legalRoutes,
  ];
}
