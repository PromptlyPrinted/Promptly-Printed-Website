import { AnalyticsProvider } from '@repo/analytics';
import { AuthProvider } from '@repo/auth/provider';
import { env } from '@repo/env';
import { VercelToolbar } from '@vercel/toolbar/next';
import type { ThemeProviderProps } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './providers/theme';
import { ClientProviders } from './src/components/client-providers';

type DesignSystemProviderProperties = ThemeProviderProps & {
  showVercelToolbar?: boolean;
};

export const DesignSystemProvider = ({
  children,
  showVercelToolbar = env.NODE_ENV === 'development' && !!env.FLAGS_SECRET,
  ...properties
}: DesignSystemProviderProperties) => (
  <ThemeProvider {...properties}>
    <AuthProvider>
      <AnalyticsProvider>
        <ClientProviders>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
          {showVercelToolbar && <VercelToolbar />}
        </ClientProviders>
      </AnalyticsProvider>
    </AuthProvider>
  </ThemeProvider>
);

// Export error handling components for individual use
export { ErrorBoundary, withErrorBoundary, useErrorHandler } from './src/components/error-boundary';
export { ChunkErrorHandler } from './src/components/chunk-error-handler';
