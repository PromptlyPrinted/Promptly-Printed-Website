import { createMetadata } from '@repo/seo/metadata';
import Link from 'next/link';

export const metadata = createMetadata({
  title: 'Access Denied',
  description: 'You do not have permission to access this page.',
});

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        {/* Large 403 with gradient */}
        <h1 className="mb-4 bg-gradient-to-r from-[#16C1A8] to-[#FF8A26] bg-clip-text text-[100px] font-bold leading-none text-transparent sm:text-[140px]">
          403
        </h1>

        {/* Lock icon */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#16C1A8] to-[#FF8A26] opacity-20" />
          <svg
            className="h-10 w-10 text-[#0D2C45]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        {/* Message */}
        <h2 className="mb-4 text-2xl font-semibold text-[#0D2C45] sm:text-3xl">
          Access Denied
        </h2>
        <p className="mb-8 max-w-md text-gray-600">
          You don&apos;t have permission to access this page.
          If you believe this is a mistake, please sign in or contact support.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-full bg-[#16C1A8] px-8 py-3 font-semibold text-white transition-all hover:bg-[#14a896] hover:shadow-lg"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            Sign In
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border-2 border-[#0D2C45] px-8 py-3 font-semibold text-[#0D2C45] transition-all hover:bg-[#0D2C45] hover:text-white"
          >
            Go Home
          </Link>
        </div>

        {/* Help text */}
        <p className="mt-8 text-sm text-gray-500">
          Need help?{' '}
          <a
            href="mailto:support@promptlyprinted.com"
            className="font-medium text-[#16C1A8] hover:underline"
          >
            Contact Support
          </a>
        </p>

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
