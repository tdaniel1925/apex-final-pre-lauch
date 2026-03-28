// Genealogy Page Loading Skeleton
// Displays while genealogy tree is loading

export default function GenealogyPageSkeleton() {
  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-7 bg-slate-200 rounded w-56 mb-2" />
        <div className="h-4 bg-slate-200 rounded w-96" />
      </div>

      {/* User Info Card Skeleton */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-3 bg-slate-600 rounded w-24 mb-2" />
            <div className="h-7 bg-slate-600 rounded w-48 mb-2" />
            <div className="h-4 bg-slate-600 rounded w-32 mb-3" />
            <div className="flex items-center gap-3">
              <div className="h-6 bg-slate-600 rounded-full w-20" />
              <div className="h-4 bg-slate-600 rounded w-24" />
            </div>
          </div>
          <div className="text-right">
            <div className="h-3 bg-slate-600 rounded w-32 mb-2" />
            <div className="h-9 bg-slate-600 rounded w-16 mb-1" />
            <div className="h-3 bg-slate-600 rounded w-24" />
          </div>
        </div>
      </div>

      {/* Organization Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4">
            <div className="h-3 bg-slate-200 rounded w-32 mb-2" />
            <div className="h-7 bg-slate-200 rounded w-16 mb-1" />
            <div className="h-3 bg-slate-200 rounded w-20" />
          </div>
        ))}
      </div>

      {/* Tree Skeleton */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex flex-col items-center gap-8">
          {/* Root node */}
          <div className="border-2 border-slate-200 rounded-lg p-4 w-64">
            <div className="h-5 bg-slate-200 rounded w-40 mb-2" />
            <div className="h-4 bg-slate-200 rounded w-32" />
          </div>

          {/* Child nodes */}
          <div className="grid grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-2 border-slate-200 rounded-lg p-4 w-48">
                <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-24" />
              </div>
            ))}
          </div>

          {/* Grandchild nodes */}
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-slate-200 rounded p-3 w-32">
                <div className="h-3 bg-slate-200 rounded w-20 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Depth Controls Skeleton */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="h-4 bg-slate-200 rounded w-32 mb-3" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-slate-200 rounded-lg w-24" />
          ))}
        </div>
      </div>
    </div>
  );
}
