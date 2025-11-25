export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Search and Controls Skeleton */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
          <div className="h-10 w-full max-w-md bg-gray-200 rounded animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-lg border p-6 space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Product Grid Skeleton */}
          <div className="flex-1">
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div key={i} className="bg-white rounded-lg border overflow-hidden">
                  {/* Image Skeleton */}
                  <div className="aspect-square bg-gray-200 animate-pulse" />

                  {/* Content Skeleton */}
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div key={star} className="h-3 w-3 bg-gray-200 rounded animate-pulse" />
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse mt-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
