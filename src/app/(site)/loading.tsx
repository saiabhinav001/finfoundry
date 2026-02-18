export default function SiteLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <div className="relative min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <div className="h-4 w-40 bg-white/5 rounded-full mx-auto animate-pulse" />
          <div className="h-12 w-80 bg-white/5 rounded-lg mx-auto animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-white/5 rounded-full mx-auto animate-pulse" />
          <div className="flex gap-4 justify-center mt-8">
            <div className="h-12 w-36 bg-teal/10 rounded-lg animate-pulse" />
            <div className="h-12 w-36 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="py-16 border-y border-white/[0.03]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center space-y-3">
                <div className="h-10 w-20 bg-white/5 rounded-lg mx-auto animate-pulse" />
                <div className="h-3 w-28 bg-white/5 rounded-full mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="h-6 w-48 bg-white/5 rounded-lg mx-auto mb-12 animate-pulse" />
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-48 bg-white/[0.02] border border-white/[0.06] rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
