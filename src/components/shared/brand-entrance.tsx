"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEntrance } from "@/lib/entrance-context";

/* ═══════════════════════════════════════════════════════════════════
 * BrandEntrance v3.0 — Precision Cinematic Startup Sequence
 *
 * Architecture: Six-phase choreographed timeline
 *
 *   Phase 0 — VOID       (0.00–0.30 s)
 *     Deep navy (#050816). Ambient vignette. Visual silence.
 *     No logo. No motion. Brand tension builds.
 *
 *   Phase 1 — SWEEP      (0.30–1.10 s)
 *     Wide, feathered emerald light beam drifts L → R.
 *     ~10–15% saturation, soft edges, no hard streak.
 *     Logo is revealed via CSS mask-image — uncovered
 *     by light, NOT faded in.
 *
 *   Phase 2 — STABILIZE  (1.10–1.60 s)
 *     Logo subtle scale: 0.985 → 1.000.
 *     Drop-shadow depth increases.
 *     Material presence emerges.
 *     No overshoot. No bounce.
 *
 *   Phase 3 — PULSE      (1.60–1.90 s)
 *     Single soft emerald glow behind logo.
 *     Expands slightly, fades smoothly.
 *     No flash. No color shift.
 *
 *   Phase 4 — MORPH      (1.90–2.40 s)
 *     Logo scales down toward navbar anchor.
 *     Background spotlight expands outward to ambient.
 *     Overlay dissolves.
 *
 *   Phase 5 — REVEAL     (2.40–2.80 s)
 *     Hero content: opacity 0→1, Y 20→0.
 *     Staggered children (0.06s delay).
 *     Page becomes interactive.
 *
 * Total: 2.8 s. Plays once/session. Homepage only.
 *
 * Governance: SOP §4, §5, §7, §9, §11
 *   – No particles. No infinite loops. No canvas/WebGL.
 *   – No spinning, rotation, bounce, glitch, or neon.
 *   – Only cubic-bezier(0.4, 0, 0.2, 1). No spring physics.
 *   – transform + opacity only (GPU-composited, 60fps).
 *   – prefers-reduced-motion: skip sweep, gentle fade, morph.
 *
 * Why this feels premium:
 *   The animation uses negative space and restraint as its
 *   primary tools. The void (Phase 0) creates anticipation
 *   without a single pixel moving. The sweep reveals rather
 *   than constructs — the logo was always there, we simply
 *   let you see it. The scale micro-shift (1.5%) creates
 *   physical weight without theatrics. The single glow pulse
 *   is biological — one heartbeat — then silence. The morph
 *   establishes the logo as the structural origin of the page.
 *   Nothing is decorative. Everything is load-bearing.
 * ═══════════════════════════════════════════════════════════════════ */

type Phase =
  | "void"       // 0.00–0.30s
  | "sweep"      // 0.30–1.10s
  | "stabilize"  // 1.10–1.60s
  | "pulse"      // 1.60–1.90s
  | "morph"      // 1.90–2.40s
  | "reveal";    // 2.40–2.80s (overlay dissolving)

/* ── Brand palette ──────────────────────────────────────────────── */
const BG = "#050816";
const TEAL_RGB = "16,185,129";

/* ── Easing — singular, non-negotiable ──────────────────────────── */
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];


/* ── The Official FinFoundry SVG Logo ───────────────────────────── *
 * CRITICAL: EXACT original paths from logo.svg — unmodified.
 * ───────────────────────────────────────────────────────────────── */
function OfficialLogo({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 810 1012.49997"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={style}
    >
      <defs>
        <g />
        <clipPath id="ba340bbc0b">
          <path
            d="M 0.199219 0 L 809.800781 0 L 809.800781 1012 L 0.199219 1012 Z M 0.199219 0 "
            clipRule="nonzero"
          />
        </clipPath>
        <clipPath id="clip-31070d41e4">
          <rect x="0" width="203" y="0" height="480" />
        </clipPath>
        <clipPath id="clip-904296da6c">
          <rect x="0" width="284" y="0" height="287" />
        </clipPath>
        <clipPath id="clip-694fdac144">
          <path
            d="M 241 18 L 272.980469 18 L 272.980469 54 L 241 54 Z M 241 18 "
            clipRule="nonzero"
          />
        </clipPath>
        <clipPath id="clip-1aa3a3d478">
          <rect x="0" width="273" y="0" height="69" />
        </clipPath>
        <clipPath id="clip-ec4284b1b4">
          <path
            d="M 116.648438 144.011719 L 693.117188 144.011719 L 693.117188 867.984375 L 116.648438 867.984375 Z M 116.648438 144.011719 "
            clipRule="nonzero"
          />
        </clipPath>
      </defs>

      {/* Teal background */}
      <g clipPath="url(#ba340bbc0b)">
        <path
          fill="#008080"
          d="M 0.199219 0 L 809.800781 0 L 809.800781 1012 L 0.199219 1012 Z M 0.199219 0 "
          fillOpacity="1"
          fillRule="nonzero"
        />
      </g>

      {/* F letter */}
      <g transform="matrix(1, 0, 0, 1, 182, 278)">
        <g clipPath="url(#clip-31070d41e4)">
          <g fill="#ffde59" fillOpacity="1">
            <g transform="translate(0.962138, 375.544211)">
              <g>
                <path d="M 31.609375 0 L 31.609375 -44.96875 L 5.96875 -44.96875 L 5.96875 -75.515625 L 31.609375 -75.515625 L 31.609375 -250.796875 L 182.3125 -250.796875 L 182.3125 -207.25 L 83.953125 -207.25 L 83.953125 -149.640625 L 175.984375 -149.640625 L 175.984375 -106.078125 L 83.953125 -106.078125 L 83.953125 -75.515625 L 138.046875 -75.515625 L 138.046875 -44.96875 L 83.953125 -44.96875 L 83.953125 0 Z M 31.609375 0 " />
              </g>
            </g>
          </g>
        </g>
      </g>

      {/* IN letters */}
      <g transform="matrix(1, 0, 0, 1, 374, 328)">
        <g clipPath="url(#clip-904296da6c)">
          <g fill="#ffde59" fillOpacity="1">
            <g transform="translate(0.560652, 224.693211)">
              <g>
                <path d="M 49.109375 0 L 19.484375 0 L 19.484375 -149.90625 L 49.109375 -149.90625 Z M 49.109375 0 " />
              </g>
            </g>
            <g transform="translate(69.259262, 224.693211)">
              <g>
                <path d="M 48.1875 0 L 19.484375 0 L 19.484375 -149.90625 L 53.421875 -149.90625 L 113.609375 -53.3125 L 116.265625 -53.71875 L 116.265625 -149.90625 L 144.78125 -149.90625 L 144.78125 0 L 114.421875 0 L 50.75 -103.140625 L 48.1875 -102.734375 Z M 48.1875 0 " />
              </g>
            </g>
          </g>
          <g fill="#ffde59" fillOpacity="1">
            <g transform="translate(233.624016, 224.693211)">
              <g />
            </g>
          </g>
        </g>
      </g>

      {/* FOUNDRY text */}
      <g transform="matrix(1, 0, 0, 1, 331, 563)">
        <g clipPath="url(#clip-1aa3a3d478)">
          <g fill="#ffde59" fillOpacity="1">
            <g transform="translate(0.550236, 53.544364)">
              <g>
                <path d="M 19.359375 0.515625 C 16.109375 0.515625 13.238281 -0.144531 10.75 -1.46875 C 8.257812 -2.800781 6.3125 -4.832031 4.90625 -7.5625 C 3.5 -10.289062 2.796875 -13.6875 2.796875 -17.75 C 2.796875 -21.820312 3.5 -25.222656 4.90625 -27.953125 C 6.3125 -30.679688 8.257812 -32.707031 10.75 -34.03125 C 13.238281 -35.363281 16.109375 -36.03125 19.359375 -36.03125 C 22.617188 -36.03125 25.484375 -35.367188 27.953125 -34.046875 C 30.429688 -32.722656 32.367188 -30.691406 33.765625 -27.953125 C 35.171875 -25.222656 35.875 -21.820312 35.875 -17.75 C 35.875 -13.6875 35.171875 -10.285156 33.765625 -7.546875 C 32.367188 -4.816406 30.429688 -2.789062 27.953125 -1.46875 C 25.484375 -0.144531 22.617188 0.515625 19.359375 0.515625 Z M 19.359375 -5.59375 C 22.367188 -5.59375 24.664062 -6.554688 26.25 -8.484375 C 27.84375 -10.421875 28.640625 -13.507812 28.640625 -17.75 C 28.640625 -22 27.84375 -25.09375 26.25 -27.03125 C 24.664062 -28.976562 22.367188 -29.953125 19.359375 -29.953125 C 16.328125 -29.953125 14.015625 -28.976562 12.421875 -27.03125 C 10.828125 -25.09375 10.03125 -22 10.03125 -17.75 C 10.03125 -13.507812 10.828125 -10.421875 12.421875 -8.484375 C 14.015625 -6.554688 16.328125 -5.59375 19.359375 -5.59375 Z M 19.359375 -5.59375 " />
              </g>
            </g>
            <g transform="translate(39.245605, 53.544364)">
              <g />
            </g>
            <g transform="translate(50.978099, 53.544364)">
              <g>
                <path d="M 18.828125 0.515625 C 13.929688 0.515625 10.300781 -0.644531 7.9375 -2.96875 C 5.570312 -5.300781 4.390625 -8.75 4.390625 -13.3125 L 4.390625 -35.515625 L 11.265625 -35.515625 L 11.265625 -13.359375 C 11.265625 -10.765625 11.890625 -8.820312 13.140625 -7.53125 C 14.390625 -6.238281 16.285156 -5.59375 18.828125 -5.59375 C 23.859375 -5.59375 26.375 -8.179688 26.375 -13.359375 L 26.375 -35.515625 L 33.25 -35.515625 L 33.25 -13.3125 C 33.25 -8.75 32.066406 -5.300781 29.703125 -2.96875 C 27.335938 -0.644531 23.710938 0.515625 18.828125 0.515625 Z M 18.828125 0.515625 " />
              </g>
            </g>
            <g transform="translate(88.628961, 53.544364)">
              <g />
            </g>
            <g transform="translate(100.361455, 53.544364)">
              <g>
                <path d="M 11.421875 0 L 4.609375 0 L 4.609375 -35.515625 L 12.65625 -35.515625 L 26.921875 -12.625 L 27.546875 -12.734375 L 27.546875 -35.515625 L 34.296875 -35.515625 L 34.296875 0 L 27.109375 0 L 12.03125 -24.4375 L 11.421875 -24.34375 Z M 11.421875 0 " />
              </g>
            </g>
            <g transform="translate(139.299733, 53.544364)">
              <g />
            </g>
            <g transform="translate(151.032227, 53.544364)">
              <g>
                <path d="M 17.390625 -35.515625 C 23.160156 -35.515625 27.5625 -34.023438 30.59375 -31.046875 C 33.632812 -28.066406 35.15625 -23.632812 35.15625 -17.75 C 35.15625 -11.894531 33.632812 -7.472656 30.59375 -4.484375 C 27.5625 -1.492188 23.160156 0 17.390625 0 L 4.609375 0 L 4.609375 -35.515625 Z M 16.984375 -5.90625 C 20.640625 -5.90625 23.375 -6.835938 25.1875 -8.703125 C 27 -10.578125 27.90625 -13.59375 27.90625 -17.75 C 27.90625 -21.914062 27 -24.929688 25.1875 -26.796875 C 23.375 -28.671875 20.640625 -29.609375 16.984375 -29.609375 L 11.640625 -29.609375 L 11.640625 -5.90625 Z M 16.984375 -5.90625 " />
              </g>
            </g>
            <g transform="translate(188.99887, 53.544364)">
              <g />
            </g>
          </g>
          <g fill="#ffde59" fillOpacity="1">
            <g transform="translate(200.731359, 53.544364)">
              <g>
                <path d="M 12.1875 0 L 3.234375 -15.625 L 3.234375 -19.296875 L 6.21875 -19.296875 C 7.976562 -19.296875 9.453125 -19.6875 10.640625 -20.46875 C 11.835938 -21.25 12.601562 -22.335938 12.9375 -23.734375 L 3.234375 -23.734375 L 3.234375 -27.40625 L 12.890625 -27.40625 C 12.585938 -28.664062 11.972656 -29.71875 11.046875 -30.5625 C 10.117188 -31.414062 8.820312 -31.84375 7.15625 -31.84375 L 3.234375 -31.84375 L 3.234375 -35.515625 L 25.671875 -35.515625 L 25.671875 -31.84375 L 17.859375 -31.84375 C 19.015625 -30.582031 19.742188 -29.101562 20.046875 -27.40625 L 25.671875 -27.40625 L 25.671875 -23.734375 L 20.15625 -23.734375 C 19.820312 -21.273438 18.863281 -19.359375 17.28125 -17.984375 C 15.707031 -16.609375 13.710938 -15.671875 11.296875 -15.171875 L 21.046875 0 Z M 12.1875 0 " />
              </g>
            </g>
          </g>
          <g fill="#ffde59" fillOpacity="1">
            <g transform="translate(229.187007, 53.544364)">
              <g />
            </g>
          </g>
          <g clipPath="url(#clip-694fdac144)">
            <g fill="#ffde59" fillOpacity="1">
              <g transform="translate(240.919512, 53.544364)">
                <g>
                  <path d="M 19.453125 0 L 12.4375 0 L 12.4375 -13.9375 L 0.171875 -35.515625 L 7.703125 -35.515625 L 15.8125 -21.546875 L 16.421875 -21.546875 L 24.359375 -35.515625 L 31.71875 -35.515625 L 19.453125 -13.9375 Z M 19.453125 0 " />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>

      {/* Gold border rectangle (stroke) */}
      <g clipPath="url(#clip-ec4284b1b4)">
        <path
          strokeLinecap="butt"
          transform="matrix(0, -0.74963, 0.74963, 0, 116.649984, 867.985167)"
          fill="none"
          strokeLinejoin="miter"
          d="M 0.0010571 -0.00206244 L 965.774753 -0.00206244 L 965.774753 769.310053 L 0.0010571 769.310053 Z M 0.0010571 -0.00206244 "
          stroke="#ffde59"
          strokeWidth="76"
          strokeOpacity="1"
          strokeMiterlimit="4"
        />
      </g>
    </svg>
  );
}


/* ═══════════════════════════════════════════════════════════════════
 * Sweep Beam — Wide, feathered emerald gradient
 *
 * Spec: ~80px wide, feathered edges, 10–15% saturation.
 * Must NOT look like a loading bar, neon laser, or sci-fi beam.
 * Must feel like: light scanning a premium metallic surface.
 * ═══════════════════════════════════════════════════════════════════ */
function SweepBeam({ active }: { active: boolean }) {
  return (
    <motion.div
      className="absolute top-0 bottom-0 pointer-events-none"
      style={{
        width: "clamp(60px, 8vw, 120px)",
        background: `linear-gradient(
          90deg,
          transparent 0%,
          rgba(${TEAL_RGB}, 0.03) 15%,
          rgba(${TEAL_RGB}, 0.08) 35%,
          rgba(${TEAL_RGB}, 0.12) 50%,
          rgba(${TEAL_RGB}, 0.08) 65%,
          rgba(${TEAL_RGB}, 0.03) 85%,
          transparent 100%
        )`,
      }}
      initial={{ left: "-10%" }}
      animate={{ left: active ? "110%" : "-10%" }}
      transition={{ duration: 0.8, ease: EASE }}
    />
  );
}


/* ═══════════════════════════════════════════════════════════════════
 * Main Component — BrandEntrance
 *
 * Timeline mapping to setTimeout schedule:
 *    0 ms  →  void        Deep navy void, vignette
 *  300 ms  →  sweep       Light beam + mask-image reveal begins
 * 1100 ms  →  stabilize   Logo micro-scale 0.985→1, shadow depth
 * 1600 ms  →  pulse       Single glow expand + fade
 * 1900 ms  →  morph       Scale down, translate toward navbar
 * 2200 ms  →  navReady    Navbar renders at final position
 * 2400 ms  →  reveal      heroReady fires, overlay dissolves
 * 2900 ms  →  unmount     Overlay removed from DOM
 * ═══════════════════════════════════════════════════════════════════ */
export function BrandEntrance() {
  const { shouldPlay, markHeroReady, markNavReady } = useEntrance();
  const prefersReduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("void");
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [mounted, setMounted] = useState(true);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* ── Sweep progress for CSS mask-image ──────────────── */
  const [sweepProgress, setSweepProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const sweepStartRef = useRef(0);

  const SWEEP_DURATION = 800; // ms — matches beam transition

  const startSweepMask = useCallback(() => {
    sweepStartRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - sweepStartRef.current;
      const t = Math.min(elapsed / SWEEP_DURATION, 1);
      // Smooth easing: cubic-bezier(0.4, 0, 0.2, 1) approximated
      const eased = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setSweepProgress(eased);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  /* ── Choreography ───────────────────────────────────── */
  useEffect(() => {
    if (!shouldPlay) return;

    /* Reduced motion: skip sweep, gentle fade, morph immediately */
    if (prefersReduced) {
      setSweepProgress(1);
      setPhase("stabilize");
      const t1 = setTimeout(() => {
        markNavReady();
        markHeroReady();
        setPhase("reveal");
      }, 400);
      const t2 = setTimeout(() => setOverlayVisible(false), 900);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    const t = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timeoutsRef.current.push(id);
    };

    // Phase 0: void (0–300ms) — already in "void" state
    // Phase 1: sweep (300–1100ms)
    t(() => {
      setPhase("sweep");
      startSweepMask();
    }, 300);
    // Phase 2: stabilize (1100–1600ms)
    t(() => setPhase("stabilize"), 1100);
    // Phase 3: pulse (1600–1900ms)
    t(() => setPhase("pulse"), 1600);
    // Phase 4: morph (1900–2400ms)
    t(() => setPhase("morph"), 1900);
    // Navbar appears
    t(() => markNavReady(), 2200);
    // Phase 5: reveal (2400–2800ms)
    t(() => {
      markHeroReady();
      setPhase("reveal");
    }, 2400);
    // Unmount overlay
    t(() => setOverlayVisible(false), 2900);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      cancelAnimationFrame(rafRef.current);
    };
  }, [shouldPlay, prefersReduced, markHeroReady, markNavReady, startSweepMask]);

  if (!shouldPlay || !mounted) return null;

  /* ── Phase booleans (computed once per render) ──────── */
  const phaseIndex = (
    { void: 0, sweep: 1, stabilize: 2, pulse: 3, morph: 4, reveal: 5 } as const
  )[phase];

  const isBeamActive = phaseIndex >= 1; // sweep onwards
  const isLogoVisible = phaseIndex >= 1; // mask reveals during sweep
  const isStabilized = phaseIndex >= 2;
  const isPulsing = phaseIndex === 3;
  const isMorphing = phaseIndex >= 4;
  const isRevealing = phaseIndex >= 5;

  /* ── CSS mask-image for logo reveal ─────────────────── *
   * Gradient mask slides from left to right based on      *
   * sweepProgress (0→1). The logo is fully hidden at 0    *
   * and fully visible at 1. No JS animation on the mask   *
   * — only the gradient stops shift via inline style.     *
   * ────────────────────────────────────────────────────── */
  const maskPosition = sweepProgress * 120; // overshoot to 120% to clear fully
  const logoMaskStyle: React.CSSProperties = isStabilized
    ? {} // fully visible — no mask needed
    : {
        WebkitMaskImage: `linear-gradient(
          90deg,
          black ${maskPosition - 8}%,
          rgba(0,0,0,0.6) ${maskPosition - 2}%,
          transparent ${maskPosition + 5}%
        )`,
        maskImage: `linear-gradient(
          90deg,
          black ${maskPosition - 8}%,
          rgba(0,0,0,0.6) ${maskPosition - 2}%,
          transparent ${maskPosition + 5}%
        )`,
      };

  /* ── Shadow depth ramp ──────────────────────────────── */
  const logoFilter = isMorphing
    ? "none"
    : isStabilized
      ? `drop-shadow(0 6px 24px rgba(0,0,0,0.6)) drop-shadow(0 0 10px rgba(${TEAL_RGB},0.12))`
      : isLogoVisible
        ? `drop-shadow(0 2px 8px rgba(0,0,0,0.3))`
        : "none";

  return (
    <AnimatePresence onExitComplete={() => setMounted(false)}>
      {overlayVisible && (
        <motion.div
          key="brand-overlay"
          className="fixed inset-0 z-[9999] overflow-hidden"
          style={{
            background: BG,
            pointerEvents: isMorphing ? "none" : "auto",
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {/* ═══════════════════════════════════════════════════
           *  Layer 0 — Ambient vignette
           *  Always present. Radiates from center outward.
           *  Creates natural focus toward center of screen.
           * ═══════════════════════════════════════════════════ */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(
                ellipse 70% 60% at 50% 48%,
                transparent 0%,
                rgba(0,0,0,0.35) 100%
              )`,
            }}
          />

          {/* ═══════════════════════════════════════════════════
           *  Layer 1 — Spotlight → Ambient expansion
           *  Starts as tight spotlight behind logo, expands
           *  outward during morph to transition into full-page
           *  ambient mode.
           * ═══════════════════════════════════════════════════ */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              top: "50%",
              left: "50%",
              borderRadius: "50%",
              background: `radial-gradient(
                circle,
                rgba(${TEAL_RGB},0.04) 0%,
                rgba(${TEAL_RGB},0.015) 40%,
                transparent 70%
              )`,
            }}
            initial={{
              width: "40vmax",
              height: "40vmax",
              x: "-50%",
              y: "-50%",
            }}
            animate={
              isMorphing
                ? {
                    width: "120vmax",
                    height: "120vmax",
                    x: "-50%",
                    y: "-50%",
                    opacity: 0.6,
                  }
                : {
                    width: "40vmax",
                    height: "40vmax",
                    x: "-50%",
                    y: "-50%",
                    opacity: isLogoVisible ? 1 : 0,
                  }
            }
            transition={{ duration: isMorphing ? 0.5 : 0.8, ease: EASE }}
          />

          {/* ═══════════════════════════════════════════════════
           *  Layer 2 — Emerald light sweep beam
           *  Wide, feathered, low-saturation gradient bar.
           *  Drifts L→R during sweep phase.
           * ═══════════════════════════════════════════════════ */}
          <SweepBeam active={isBeamActive} />

          {/* ═══════════════════════════════════════════════════
           *  Layer 3 — Logo composition (centered)
           * ═══════════════════════════════════════════════════ */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="relative flex flex-col items-center"
              /* ── Morph: scale down + drift to navbar origin ── */
              animate={
                isMorphing
                  ? {
                      scale: 0.22,
                      y: "-40vh",
                      x: "-20vw",
                      opacity: 0,
                    }
                  : {
                      /* Stabilize phase: 0.985 → 1.000 micro-scale */
                      scale: isStabilized ? 1 : 0.985,
                      y: 0,
                      x: 0,
                      opacity: 1,
                    }
              }
              transition={{
                duration: isMorphing ? 0.5 : 0.5,
                ease: EASE,
              }}
            >
              {/* ── Glow pulse — single fire during pulse phase ── */}
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  width: "clamp(160px, 28vmin, 300px)",
                  height: "clamp(200px, 35vmin, 380px)",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -52%)",
                  borderRadius: "30%",
                  background: `radial-gradient(
                    ellipse,
                    rgba(${TEAL_RGB}, 0.08) 0%,
                    rgba(${TEAL_RGB}, 0.02) 50%,
                    transparent 70%
                  )`,
                  filter: "blur(24px)",
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={
                  isPulsing
                    ? { opacity: [0, 0.6, 0], scale: [0.9, 1.06, 1.06] }
                    : { opacity: 0, scale: 0.9 }
                }
                transition={{
                  duration: 0.3,
                  ease: EASE,
                }}
              />

              {/* ── Logo with CSS mask-image gradient reveal ── */}
              <div
                className="relative"
                style={{
                  width: "clamp(85px, 18vmin, 140px)",
                  ...logoMaskStyle,
                }}
              >
                <OfficialLogo
                  className="w-full h-auto"
                  style={{
                    filter: logoFilter,
                    transition: "filter 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </div>

              {/* ── Brand name — appears after stabilize ── */}
              <motion.p
                className="mt-4 sm:mt-5 font-heading font-bold text-[24px] sm:text-[30px] md:text-[34px] tracking-[-0.02em]"
                initial={{ opacity: 0, y: 10 }}
                animate={
                  isStabilized && !isMorphing
                    ? { opacity: 1, y: 0 }
                    : isMorphing
                      ? { opacity: 0, y: -6 }
                      : { opacity: 0, y: 10 }
                }
                transition={{
                  duration: 0.4,
                  delay: isStabilized && !isMorphing ? 0.08 : 0,
                  ease: EASE,
                }}
              >
                <span style={{ color: "#34D399" }}>Fin</span>
                <span style={{ color: "#F5C542" }}>Foundry</span>
              </motion.p>

              {/* ── Gradient divider ── */}
              <motion.div
                className="h-px origin-center mt-2"
                style={{
                  width: "clamp(80px, 18vmin, 140px)",
                  background: `linear-gradient(
                    90deg,
                    transparent,
                    rgba(${TEAL_RGB}, 0.25) 30%,
                    rgba(${TEAL_RGB}, 0.25) 70%,
                    transparent
                  )`,
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={
                  isStabilized && !isMorphing
                    ? { scaleX: 1, opacity: 1 }
                    : { scaleX: 0, opacity: 0 }
                }
                transition={{
                  duration: 0.4,
                  delay: isStabilized && !isMorphing ? 0.14 : 0,
                  ease: EASE,
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
