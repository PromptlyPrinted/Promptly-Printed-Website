import { env } from '@repo/env';
import { config, withAnalyzer, withSentry } from '@repo/next-config';
import type { NextConfig } from 'next';

let nextConfig: NextConfig = {
  ...config,
  output: 'standalone',
  typescript: {
    // Temporarily ignore build errors due to React 19 type compatibility issues
    ignoreBuildErrors: true,
  },
};

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
