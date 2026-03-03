export default function AdminLoading() {
  return (
    <div className="flex-1 p-6 lg:p-8 relative overflow-hidden">
      {/* Branded watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <span className="text-[5rem] font-heading font-black text-white/[0.012] select-none tracking-tight">
          FF
        </span>
      </div>

      {/* Spinner */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-5 h-5 rounded-full border-2 border-teal/20 border-t-teal/60 animate-spin" />
        <div className="h-4 w-32 bg-white/[0.04] rounded-lg animate-pulse" />
      </div>

      {/* Header skeleton */}
      <div className="mb-8 space-y-3">
        <div className="h-8 w-48 bg-white/[0.04] rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-white/[0.03] rounded-full animate-pulse" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 bg-white/[0.015] border border-white/[0.04] rounded-2xl animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white/[0.015] border border-white/[0.04] rounded-2xl p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="h-4 w-8 bg-white/[0.04] rounded animate-pulse" />
              <div className="h-4 flex-1 bg-white/[0.04] rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/[0.03] rounded animate-pulse" />
              <div className="h-8 w-16 bg-white/[0.03] rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
