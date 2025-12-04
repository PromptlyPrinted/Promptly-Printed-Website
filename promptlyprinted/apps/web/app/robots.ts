import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/checkout/',
          '/settings/',
          '/profile/',
          '/my-images/',
          '/my-designs/',
          '/orders/',
          '/_next/',
          '/admin/',
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: ['/blog/', '/products/', '/about/', '/faq/', '/llms.txt'],
        disallow: ['/api/', '/checkout/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/blog/', '/products/', '/about/', '/faq/', '/llms.txt'],
        disallow: ['/api/', '/checkout/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
      {
        userAgent: 'Anthropic-AI',
        allow: ['/blog/', '/products/', '/about/', '/faq/', '/llms.txt'],
        disallow: ['/api/', '/checkout/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
    ],
    sitemap: 'https://promptlyprinted.com/sitemap.xml',
    host: 'https://promptlyprinted.com',
  };
}
