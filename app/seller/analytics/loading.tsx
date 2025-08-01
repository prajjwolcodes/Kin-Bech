export default function SellerAnalyticsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="w-px h-6 bg-gray-300" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="w-64 h-8 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="w-96 h-6 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="w-48 h-4 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="w-full h-64 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Top Products Skeleton */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="w-48 h-4 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                  <div>
                    <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Skeleton */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="w-64 h-4 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mt-0.5" />
                <div className="flex-1">
                  <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="w-full h-3 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
