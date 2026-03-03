import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
};

/* Animated crashing stock chart SVG path for the 404 page */
function CrashingChart() {
  return (
    <svg
      viewBox="0 0 400 160"
      className="w-full max-w-md mx-auto h-auto opacity-20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grid lines */}
      {[0, 40, 80, 120, 160].map((y) => (
        <line
          key={y}
          x1="0" y1={y} x2="400" y2={y}
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-white/10"
        />
      ))}
      {/* Chart line — goes up then crashes */}
      <path
        d="M0,130 L40,125 L80,110 L120,100 L160,80 L180,60 L200,50 L220,55 L240,40 L260,30 L280,25 L290,28 L300,60 L320,100 L340,130 L360,145 L380,148 L400,150"
        stroke="url(#chartGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="[stroke-dasharray:800] animate-[draw_2s_ease-out_0.5s_forwards] [stroke-dashoffset:800]"
      />
      {/* Gradient fill under the line */}
      <path
        d="M0,130 L40,125 L80,110 L120,100 L160,80 L180,60 L200,50 L220,55 L240,40 L260,30 L280,25 L290,28 L300,60 L320,100 L340,130 L360,145 L380,148 L400,150 L400,160 L0,160 Z"
        fill="url(#areaGradient)"
        className="opacity-30 animate-[fadeIn_1s_ease_1.5s_forwards] opacity-0"
      />
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="400" y2="0">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="60%" stopColor="#10B981" />
          <stop offset="75%" stopColor="#F5C542" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
        <linearGradient id="areaGradient" x1="200" y1="0" x2="200" y2="160">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <style>{`
        @keyframes draw { to { stroke-dashoffset: 0; } }
        @keyframes fadeIn { to { opacity: 0.3; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes countCrash { 0% { transform: translateY(-10px); opacity: 0; } 40% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(0); opacity: 1; } }
      `}</style>
      <div className="text-center max-w-lg">
        {/* Crashing chart background */}
        <div className="mb-6">
          <CrashingChart />
        </div>

        {/* Large 404 with crash animation */}
        <div className="relative mb-6">
          <span
            className="text-[7rem] sm:text-[9rem] font-heading font-black leading-none text-gradient-gold select-none block animate-[countCrash_0.8s_ease-out]"
          >
            404
          </span>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold tracking-widest uppercase animate-pulse">
              ▼ Page Not Found
            </div>
          </div>
        </div>

        <div className="animate-[slideUp_0.6s_ease-out_0.3s_both]">
          <h1 className="text-xl sm:text-2xl font-heading font-bold mb-2">
            This asset doesn&apos;t exist
          </h1>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed max-w-sm mx-auto">
            Looks like this page has been delisted. The URL may have changed or the content was moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal hover:bg-teal-light text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Back to Portfolio
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Report Issue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
