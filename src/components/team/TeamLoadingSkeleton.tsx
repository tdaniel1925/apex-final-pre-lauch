// =============================================
// Team Page Loading Skeleton
// =============================================

export default function TeamLoadingSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto animate-pulse">
      {/* Page Header Skeleton */}
      <div className="mb-6">
        <div className="h-8 w-48 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-64 bg-slate-200 rounded" />
      </div>

      {/* Stats Header Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="h-3 w-32 bg-slate-200 rounded mb-3" />
            <div className="h-8 w-20 bg-slate-200 rounded mb-2" />
            <div className="h-3 w-24 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      {/* Team Members Section Skeleton */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="mb-6">
          <div className="h-6 w-32 bg-slate-200 rounded mb-2" />
          <div className="h-4 w-40 bg-slate-200 rounded" />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="mb-6 space-y-4">
          <div className="h-10 w-full bg-slate-200 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-200 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Member Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-5 w-32 bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="border-t border-slate-200 mb-4" />
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="h-3 w-20 bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-12 bg-slate-200 rounded" />
                </div>
                <div>
                  <div className="h-3 w-20 bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-12 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="h-8 w-full bg-slate-200 rounded mb-2" />
              <div className="flex gap-2">
                <div className="flex-1 h-9 bg-slate-200 rounded" />
                <div className="flex-1 h-9 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
