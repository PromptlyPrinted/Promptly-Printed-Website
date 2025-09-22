'use client';

import { ChunkErrorHandler } from './chunk-error-handler';
import { ErrorBoundary } from './error-boundary';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Global error boundary caught:', error, errorInfo);
        // You can add error reporting here (e.g., Sentry, LogRocket, etc.)
      }}
    >
      <ChunkErrorHandler>
        {children}
      </ChunkErrorHandler>
    </ErrorBoundary>
  );
}