'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { captureException } from '@sentry/nextjs';
import { useEffect } from 'react';

type ErrorProperties = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

export default function Error({ error, reset }: ErrorProperties) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        {/* Error icon with gradient */}
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#16C1A8] to-[#FF8A26] opacity-20" />
          <svg
            className="h-12 w-12 text-[#FF8A26]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Message */}
        <h1 className="mb-4 text-3xl font-bold text-[#0D2C45]">
          Something went wrong
        </h1>
        <p className="mb-8 max-w-md text-gray-600">
          We encountered an unexpected error. Don&apos;t worry, our team has been
          notified and we&apos;re working on it.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button
            onClick={reset}
            className="rounded-full bg-[#16C1A8] px-8 py-3 font-semibold text-white transition-all hover:bg-[#14a896]"
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
            className="rounded-full border-2 border-[#0D2C45] px-8 py-3 font-semibold text-[#0D2C45] transition-all hover:bg-[#0D2C45] hover:text-white"
          >
            Go Home
          </Button>
        </div>

        {/* Error digest for debugging */}
        {error.digest && (
          <p className="mt-8 text-sm text-gray-400">
            Error ID: {error.digest}
          </p>
        )}

        {/* Decorative elements */}
        <div className="mt-8 flex justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#16C1A8]" />
          <span className="h-2 w-2 rounded-full bg-[#FF8A26]" />
          <span className="h-2 w-2 rounded-full bg-[#0D2C45]" />
        </div>
      </div>
    </div>
  );
}
