import { withCMS } from '@repo/cms/next-config';
import { env } from '@repo/env';
import { config, withAnalyzer, withSentry } from '@repo/next-config';
import type { NextConfig } from 'next';

let nextConfig: NextConfig = {
  ...config,
  images: {
    ...config.images,
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

nextConfig.images?.remotePatterns?.push({
  protocol: 'https',
  hostname: 'assets.basehub.com',
});

// Development: Proxy admin routes to admin app
if (process.env.NODE_ENV === 'development') {
  const rewrites: NextConfig['rewrites'] = async () => [
    {
      source: '/admin/:path*',
      destination: 'http://localhost:3000/admin/:path*',
    },
    {
      source: '/sign-in/:path*',
      destination: 'http://localhost:3000/sign-in/:path*',
    },
    {
      source: '/sign-up/:path*',
      destination: 'http://localhost:3000/sign-up/:path*',
    },
    {
      source: '/api/auth/:path*',
      destination: 'http://localhost:3000/api/auth/:path*',
    },
  ];

  nextConfig.rewrites = rewrites;
}

if (process.env.NODE_ENV === 'production') {
  const redirects: NextConfig['redirects'] = async () => [
    {
      source: '/legal',
      destination: '/legal/privacy',
      statusCode: 301,
    },
  ];

  nextConfig.redirects = redirects;
}

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

// Explicitly type the config to avoid type inference issues
const finalConfig: NextConfig = withCMS(nextConfig);
export default finalConfig;
