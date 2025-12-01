import { withCMS } from '@repo/cms/next-config';
import { env } from '@repo/env';
import { config, withAnalyzer, withSentry } from '@repo/next-config';
import type { NextConfig } from 'next';

let nextConfig: NextConfig = {
  ...config,
  output: 'standalone',
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  typescript: {
    // Skip type checking during build - run separately
    ignoreBuildErrors: true,
  },
  images: {
    ...config.images,
    remotePatterns: [
      ...(config.images?.remotePatterns || []),
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    // Enable image optimization in production, keep unoptimized in dev for speed
    unoptimized: process.env.NODE_ENV === 'development',
    // Use modern image formats for better compression
    formats: ['image/webp', 'image/avif'],
    // Optimize for different device sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable LQIP (Low Quality Image Placeholders)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    ...(config.experimental || {}),
    // Optimize memory usage during builds
    webpackBuildWorker: true,
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react', '@heroicons/react', '@radix-ui/react-icons'],
  },
  // Production optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Modularize imports for better tree-shaking (heroicons only)
  modularizeImports: {
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}',
    },
    '@heroicons/react/24/solid': {
      transform: '@heroicons/react/24/solid/{{member}}',
    },
  },
};

nextConfig.images?.remotePatterns?.push(
  {
    protocol: 'https',
    hostname: 'assets.basehub.com',
  },
  {
    protocol: 'https',
    hostname: 'pub-39f280c9d2f446668f96b18e8ef5109d.r2.dev',
  }
);

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
