import { AnalyticsProvider } from '@repo/analytics';
import { AuthProvider } from '@repo/auth/provider';
import type { ThemeProviderProps } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './providers/theme';
import { ClientProviders } from './src/components/client-providers';

type DesignSystemProviderProperties = ThemeProviderProps;

export const DesignSystemProvider = ({
  children,
  ...properties
}: DesignSystemProviderProperties) => (
  <ThemeProvider {...properties}>
    <AuthProvider>
      <AnalyticsProvider>
        <ClientProviders>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ClientProviders>
      </AnalyticsProvider>
    </AuthProvider>
  </ThemeProvider>
);

// Export error handling components for individual use
export { ErrorBoundary, withErrorBoundary, useErrorHandler } from './src/components/error-boundary';
export { ChunkErrorHandler } from './src/components/chunk-error-handler';
