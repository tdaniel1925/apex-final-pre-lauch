// Team Page Loading Skeleton
// Displays while team data is loading

export default function TeamPageSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto animate-pulse">
      {/* Page Header Skeleton */}
      <div className="mb-6">
        <div className="h-8 bg-slate-200 rounded w-48 mb-2" />
        <div className="h-4 bg-slate-200 rounded w-96" />
      </div>

      {/* Stats Header Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
            <div className="h-8 bg-slate-200 rounded w-16 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-32" />
          </div>
        ))}
      </div>

      {/* Team Members Section Skeleton */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <div className="h-6 bg-slate-200 rounded w-32 mb-2" />
          <div className="h-4 bg-slate-200 rounded w-48" />
        </div>

        {/* Member Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-slate-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-5 bg-slate-200 rounded w-32 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
