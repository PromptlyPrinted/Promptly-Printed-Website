import type { MetadataRoute } from 'next';
import { tshirtDetails } from '@/data/products';
import { blog, legal } from '@repo/cms';

// Utility to create clean slugs for URLs (matches the logic in product pages)
const createSlug = (str: string) =>
  str.toLowerCase().replace(/[''"]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://promptlyprinted.com';
  const now = new Date();

  // Static routes - EXPANDED with more SEO-valuable pages
  const staticRoutes = [
    { route: '', priority: 1.0, changeFreq: 'daily' as const },
    { route: '/about', priority: 0.8, changeFreq: 'monthly' as const },
    { route: '/contact', priority: 0.7, changeFreq: 'monthly' as const },
    { route: '/products', priority: 0.95, changeFreq: 'daily' as const },
    { route: '/pricing', priority: 0.8, changeFreq: 'weekly' as const },
    { route: '/faq', priority: 0.8, changeFreq: 'weekly' as const },
    { route: '/blog', priority: 0.9, changeFreq: 'daily' as const },
    { route: '/blog/all-articles', priority: 0.8, changeFreq: 'daily' as const },
    { route: '/search', priority: 0.6, changeFreq: 'daily' as const },
    { route: '/showcase', priority: 0.85, changeFreq: 'daily' as const },
    { route: '/designs', priority: 0.85, changeFreq: 'daily' as const },
    { route: '/prompt-library', priority: 0.8, changeFreq: 'weekly' as const },
    { route: '/quiz', priority: 0.7, changeFreq: 'monthly' as const },
    { route: '/affiliate', priority: 0.6, changeFreq: 'monthly' as const },
    { route: '/refer-friend', priority: 0.6, changeFreq: 'monthly' as const },
    { route: '/track-order', priority: 0.5, changeFreq: 'monthly' as const },
    { route: '/design', priority: 0.9, changeFreq: 'daily' as const }, // Main design page
  ].map(({ route, priority, changeFreq }) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: changeFreq,
    priority,
  }));

  // Product category pages with higher priority
  const categoryRoutes = [
    { route: '/products/all', name: 'All Products' },
    { route: '/products/men', name: 'Men\'s Apparel' },
    { route: '/products/women', name: 'Women\'s Apparel' },
    { route: '/products/kids-baby', name: 'Kids & Baby' },
    { route: '/products/accessories', name: 'Accessories' },
    { route: '/products/home-living', name: 'Home & Living' },
    { route: '/products/others', name: 'Other Products' },
  ].map(({ route }) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  // Dynamic product routes with images for rich results
  const productRoutes = Object.values(tshirtDetails).map((product) => {
    const categorySlug = createSlug(product.category);
    const productSlug = createSlug(product.name);
    return {
      url: `${baseUrl}/products/${categorySlug}/${productSlug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
      // Images help with Google Image search
      images: product.imageUrls?.cover ? [product.imageUrls.cover] : undefined,
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
      priority: 0.7,
      images: post.image?.url ? [post.image.url] : undefined,
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
      priority: 0.4,
    }));
  } catch (error) {
    console.error('Failed to fetch legal pages for sitemap:', error);
  }

  // Combine all routes - sorted by priority
  const allRoutes = [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...blogRoutes,
    ...legalRoutes,
  ].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  return allRoutes;
}
