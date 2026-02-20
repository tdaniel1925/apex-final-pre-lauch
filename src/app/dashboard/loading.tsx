// =============================================
// Dashboard Loading State
// Shows skeleton while data loads
// =============================================

export default function DashboardLoading() {
  return (
    <div className="p-4 animate-pulse">
      {/* Welcome Header Skeleton */}
      <div className="mb-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-3">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded w-16 mt-2"></div>
              </div>
            ))}
          </div>

          {/* Matrix Info Card Skeleton */}
          <div className="bg-white rounded-lg shadow p-3">
            <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div>
                <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>

          {/* Referral Link Card Skeleton */}
          <div className="bg-white rounded-lg shadow p-3">
            <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
