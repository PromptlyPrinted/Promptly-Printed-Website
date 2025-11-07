import withBundleAnalyzer from '@next/bundle-analyzer';

// @ts-expect-error No declaration file
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';
import { env } from '@repo/env';
import { withSentryConfig } from '@sentry/nextjs';
import withVercelToolbar from '@vercel/toolbar/plugins/next';
import type { NextConfig } from 'next';

const otelRegex = /@opentelemetry\/instrumentation/;

const baseConfig: NextConfig = {
  // Disable source maps in production to reduce memory usage during build
  productionBrowserSourceMaps: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Add allowed image domains here
      // Example: Google, Gravatar, etc.
    ],
  },

  // Add cache headers to prevent chunk load errors
  async headers() {
    return [
      {
        // Cache static assets aggressively
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Don't cache HTML files to ensure latest code is served
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },

  // biome-ignore lint/suspicious/useAwait: rewrites is async
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
      {
        source: '/ingest/decide',
        destination: 'https://us.i.posthog.com/decide',
      },
    ];
  },

  webpack(config, { isServer, dev }) {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    config.ignoreWarnings = [{ module: otelRegex }];

    // Optimize chunk naming for better caching and to prevent chunk load errors
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          cacheGroups: {
            ...config.optimization?.splitChunks?.cacheGroups,
            // Create stable vendor chunk
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 20,
            },
            // Create common chunk for shared components
            common: {
              minChunks: 2,
              name: 'common',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
    }

    return config;
  },

  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export const config: NextConfig = env.FLAGS_SECRET
  ? withVercelToolbar()(baseConfig)
  : baseConfig;

export const sentryConfig: Parameters<typeof withSentryConfig>[1] = {
  org: env.SENTRY_ORG,
  project: env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  /*
   * For all available options, see:
   * https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
   */

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  /*
   * Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
   * This can increase your server load as well as your hosting bill.
   * Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
   * side errors will fail.
   */
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  /*
   * Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
   * See the following for more information:
   * https://docs.sentry.io/product/crons/
   * https://vercel.com/docs/cron-jobs
   */
  automaticVercelMonitors: true,
};

export const withSentry = (sourceConfig: NextConfig): NextConfig =>
  withSentryConfig(sourceConfig, sentryConfig);

export const withAnalyzer = (sourceConfig: NextConfig): NextConfig =>
  withBundleAnalyzer()(sourceConfig);

export { withLogtail } from '@logtail/next';
