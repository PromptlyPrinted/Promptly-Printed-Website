'use client';

import { useEffect, useState } from 'react';

interface ChunkErrorHandlerProps {
  children: React.ReactNode;
}

export function ChunkErrorHandler({ children }: ChunkErrorHandlerProps) {
  const [hasChunkError, setHasChunkError] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      const message = error.message || error.error?.message || '';

      // Check for chunk load errors
      const isChunkError =
        /Loading chunk \d+ failed/.test(message) ||
        /Loading CSS chunk \d+ failed/.test(message) ||
        /Failed to import/.test(message) ||
        /Failed to load chunk/.test(message) ||
        message.includes('ChunkLoadError');

      if (isChunkError) {
        console.warn('Chunk load error detected:', message);
        setHasChunkError(true);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason?.message || String(reason);

      // Check for chunk load errors in promises
      const isChunkError =
        /Loading chunk \d+ failed/.test(message) ||
        /Loading CSS chunk \d+ failed/.test(message) ||
        /Failed to import/.test(message) ||
        /Failed to load chunk/.test(message) ||
        message.includes('ChunkLoadError');

      if (isChunkError) {
        console.warn('Chunk load error in promise:', message);
        event.preventDefault(); // Prevent default error handling
        setHasChunkError(true);
      }
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleReload = () => {
    setIsReloading(true);
    // Clear browser cache and reload
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      }).finally(() => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  const handleRetry = () => {
    setHasChunkError(false);
    // Try to reload just the current page without full refresh
    window.location.href = window.location.href;
  };

  if (hasChunkError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.083 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Update Required
          </h2>

          <p className="text-gray-600 mb-6">
            A new version of the application is available. Please refresh to get the latest updates.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleReload}
              disabled={isReloading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              {isReloading ? 'Refreshing...' : 'Refresh Page'}
            </button>

            <button
              onClick={handleRetry}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Try Again
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}