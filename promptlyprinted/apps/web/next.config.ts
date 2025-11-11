import { withCMS } from '@repo/cms/next-config';
import { env } from '@repo/env';
import { config, withAnalyzer, withSentry } from '@repo/next-config';
import type { NextConfig } from 'next';

let nextConfig: NextConfig = {
  ...config,
  output: 'standalone',
  outputFileTracingRoot: process.env.DOCKER_BUILD === 'true' ? '/workspace' : undefined,
  images: {
    ...config.images,
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  experimental: {
    ...(config.experimental || {}),
    // Optimize memory usage during builds
    webpackBuildWorker: true,
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
    {
      source: '/design',
      destination: 'http://localhost:3000/halloween-2025',
    },
    {
      source: '/halloween-2025/:path*',
      destination: 'http://localhost:3000/halloween-2025/:path*',
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
