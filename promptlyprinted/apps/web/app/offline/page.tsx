'use client';

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        {/* Offline icon with gradient background */}
        <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#16C1A8] to-[#FF8A26] opacity-20" />
          <svg
            className="h-14 w-14 text-[#FF8A26]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        </div>

        {/* Message */}
        <h1 className="mb-4 text-3xl font-bold text-[#0D2C45] sm:text-4xl">
          You&apos;re Offline
        </h1>
        <p className="mb-6 max-w-md text-lg text-gray-600">
          It looks like you&apos;ve lost your internet connection.
          Please check your network and try again.
        </p>

        {/* Tips */}
        <div className="mb-8 max-w-sm mx-auto rounded-lg bg-gray-50 p-4 text-left">
          <h3 className="mb-2 font-semibold text-[#0D2C45]">Try these steps:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#16C1A8]" />
              Check your Wi-Fi or mobile data connection
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#16C1A8]" />
              Try moving closer to your router
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#16C1A8]" />
              Restart your device or browser
            </li>
          </ul>
        </div>

        {/* Action button */}
        <button
          onClick={() => window.location.reload()}
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Retry Connection
        </button>

        {/* Decorative elements */}
        <div className="mt-12 flex justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#16C1A8] opacity-50" />
          <span className="h-2 w-2 rounded-full bg-[#FF8A26] opacity-50" />
          <span className="h-2 w-2 rounded-full bg-[#0D2C45] opacity-50" />
        </div>
      </div>
    </div>
  );
}
