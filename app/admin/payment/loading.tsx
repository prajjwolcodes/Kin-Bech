export default function AdminOrdersLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border">
              <div className="text-center">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto" />
              </div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white p-6 rounded-lg border mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
            <div className="w-full md:w-48 h-10 bg-gray-200 rounded animate-pulse" />
            <div className="w-full md:w-48 h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="p-6">
            {/* Table Header */}
            <div className="grid grid-cols-10 gap-4 mb-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
            {/* Table Rows */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-10 gap-4 py-4 border-t">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                  <div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="flex space-x-1">
                  <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
