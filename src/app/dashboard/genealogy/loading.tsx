// =============================================
// Loading State for Genealogy Page
// Shows while server component is rendering
// =============================================

export default function GenealogyLoading() {
  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      {/* Header Skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-8 bg-slate-200 rounded w-64 animate-pulse mb-2" />
        <div className="h-4 bg-slate-200 rounded w-96 animate-pulse" />
      </div>

      {/* User Info Card Skeleton */}
      <div className="bg-slate-200 rounded-lg shadow-lg p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-8 bg-slate-300 rounded w-48" />
            <div className="h-4 bg-slate-300 rounded w-32" />
            <div className="h-6 bg-slate-300 rounded w-40" />
          </div>
          <div className="text-right space-y-2">
            <div className="h-4 bg-slate-300 rounded w-32" />
            <div className="h-12 bg-slate-300 rounded w-24" />
            <div className="h-4 bg-slate-300 rounded w-24" />
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
            <div className="h-8 bg-slate-200 rounded w-20 mb-1" />
            <div className="h-3 bg-slate-200 rounded w-16" />
          </div>
        ))}
      </div>

      {/* Tree Skeleton */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4 animate-pulse">
        <div className="h-12 bg-slate-200 rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
