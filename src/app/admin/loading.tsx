export default function AdminLoading() {
  return (
    <div className="flex-1 p-6 lg:p-8">
      {/* Header skeleton */}
      <div className="mb-8 space-y-3">
        <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-white/5 rounded-full animate-pulse" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 bg-white/[0.02] border border-white/[0.06] rounded-xl animate-pulse"
          />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-8 bg-white/5 rounded animate-pulse" />
              <div className="h-4 flex-1 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
