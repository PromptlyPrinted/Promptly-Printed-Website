import { createMetadata } from '@repo/seo/metadata';
import Link from 'next/link';

export const metadata = createMetadata({
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found.',
});

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        {/* Large 404 with gradient */}
        <h1 className="mb-4 bg-gradient-to-r from-[#16C1A8] to-[#FF8A26] bg-clip-text text-[120px] font-bold leading-none text-transparent sm:text-[180px]">
          404
        </h1>

        {/* Message */}
        <h2 className="mb-4 text-2xl font-semibold text-[#0D2C45] sm:text-3xl">
          Oops! Page not found
        </h2>
        <p className="mb-8 max-w-md text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[#16C1A8] px-8 py-3 font-semibold text-white transition-all hover:bg-[#14a896] hover:shadow-lg"
          >
            Go Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-full border-2 border-[#0D2C45] px-8 py-3 font-semibold text-[#0D2C45] transition-all hover:bg-[#0D2C45] hover:text-white"
          >
            Browse Products
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 flex justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#16C1A8]" />
          <span className="h-2 w-2 rounded-full bg-[#FF8A26]" />
          <span className="h-2 w-2 rounded-full bg-[#0D2C45]" />
        </div>
      </div>
    </div>
  );
}
