import type { MetadataRoute } from 'next';
import { prisma } from '@repo/database';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://promptlyprinted.com';

  // Static routes
  const routes = [
    '',
    '/about',
    '/contact',
    '/products',
    '/pricing',
    '/faq',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes: Products
  // Assuming products have a slug or we construct URL from category/name
  // Adjust based on your actual schema. Using ID for now if slug missing, or category/name.
  // Based on file structure: /products/[category]/[productName]
  // We need to know how to construct these.
  // Let's assume we can get them from the database.
  // If schema doesn't have slug, we might skip or use ID.
  // For now, let's just fetch products and try to construct URLs if possible.
  // If no slug, we'll skip to avoid errors.
  
  // Real implementation:
  // const products = await prisma.product.findMany();
  // const productRoutes = products.map(...)
  
  // Since I don't know the exact product schema for URL construction (category/name),
  // I will check the schema first or just add a placeholder comment and basic implementation.
  // Wait, I saw /products/[category]/[productName] in the build output.
  // I should check prisma schema to see if category and name are available.
  
  return [...routes];
}
