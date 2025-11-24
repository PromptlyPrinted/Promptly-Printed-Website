import { createMetadata } from '@repo/seo/metadata';
import Link from 'next/link';

export const metadata = createMetadata({
  title: 'Maintenance',
  description: 'We are currently performing scheduled maintenance. Please check back soon.',
});

export default function MaintenancePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        {/* Maintenance icon with gradient background */}
        <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#16C1A8] to-[#FF8A26] opacity-20" />
          <svg
            className="h-14 w-14 text-[#16C1A8]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        {/* Message */}
        <h1 className="mb-4 text-3xl font-bold text-[#0D2C45] sm:text-4xl">
          Under Maintenance
        </h1>
        <p className="mb-6 max-w-md text-lg text-gray-600">
          We&apos;re making some improvements to give you a better experience.
          We&apos;ll be back shortly!
        </p>

        {/* Estimated time */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-[#16C1A8]/10 px-4 py-2 text-[#0D2C45]">
          <svg
            className="h-5 w-5 text-[#16C1A8]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium">
            Expected to be back soon
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[#16C1A8] px-8 py-3 font-semibold text-white transition-all hover:bg-[#14a896] hover:shadow-lg"
          >
            Try Again
          </Link>
          <a
            href="mailto:support@promptlyprinted.com"
            className="inline-flex items-center justify-center rounded-full border-2 border-[#0D2C45] px-8 py-3 font-semibold text-[#0D2C45] transition-all hover:bg-[#0D2C45] hover:text-white"
          >
            Contact Support
          </a>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 flex justify-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#16C1A8]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#FF8A26]" style={{ animationDelay: '0.2s' }} />
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#0D2C45]" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}
