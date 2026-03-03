export default function SiteLoading() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Branded watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <span className="text-[6rem] sm:text-[8rem] font-heading font-black text-white/[0.015] select-none tracking-tight">
          FF
        </span>
      </div>

      {/* Hero skeleton */}
      <div className="relative min-h-[60vh] flex items-center justify-center z-10">
        <div className="text-center space-y-6 px-4">
          <div className="h-5 w-28 bg-teal/[0.06] border border-teal/[0.08] rounded-full mx-auto animate-pulse" />
          <div className="space-y-3">
            <div className="h-10 w-72 bg-white/[0.04] rounded-lg mx-auto animate-pulse" />
            <div className="h-10 w-56 bg-white/[0.03] rounded-lg mx-auto animate-pulse" />
          </div>
          <div className="h-4 w-80 max-w-full bg-white/[0.03] rounded-full mx-auto animate-pulse" />
          <div className="flex gap-4 justify-center mt-8">
            <div className="h-12 w-36 bg-teal/[0.06] rounded-xl animate-pulse" />
            <div className="h-12 w-36 bg-white/[0.03] border border-white/[0.06] rounded-xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="py-16 border-y border-white/[0.03] z-10 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center space-y-3">
                <div className="h-8 w-16 bg-teal/[0.04] rounded-lg mx-auto animate-pulse" />
                <div className="h-3 w-24 bg-white/[0.04] rounded-full mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="py-20 z-10 relative">
        <div className="container mx-auto px-4">
          <div className="h-5 w-20 bg-gold/[0.06] border border-gold/[0.08] rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-7 w-48 bg-white/[0.04] rounded-lg mx-auto mb-12 animate-pulse" />
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-56 bg-white/[0.015] border border-white/[0.04] rounded-2xl animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
