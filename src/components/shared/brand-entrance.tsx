"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEntrance } from "@/lib/entrance-context";

/* ═══════════════════════════════════════════════════════════════════
 * BrandEntrance — Ultra-Premium Cinematic Reveal
 *
 * Five-act choreographed sequence using the EXACT official SVG logo:
 *   1. AMBIENT    — Multi-layered breathing gradient mesh + floating
 *                   particles for cinematic depth
 *   2. LOGO       — Blur-to-focus reveal with pulsating dual-color
 *                   glow halo, followed by a sheen light-sweep
 *   3. TYPOGRAPHY — Staggered mask-reveal from bottom, per-character,
 *                   with glowing text shadows
 *   4. HOLD       — Brief luxurious pause for the full composition
 *   5. EXIT       — Scale-toward-camera with radial blur + background
 *                   slide-up curtain reveal
 *
 * Total duration: ~4.0 s.  Plays once per session, homepage only.
 * Fully responsive across all devices.  Respects prefers-reduced-motion.
 * ═══════════════════════════════════════════════════════════════════ */

type Phase = "void" | "ambient" | "logo" | "sheen" | "text" | "exit";

/* ── Brand palette ──────────────────────────────────────────────── */
const BG = "#050816";
const TEAL = "16,185,129";
const GOLD = "245,197,66";

/* ── Easing curves ──────────────────────────────────────────────── */
const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;
const EASE_PREMIUM = [0.76, 0, 0.24, 1] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/* ── Staggered text config ──────────────────────────────────────── */
const BRAND_TEXT = "FinFoundry";
const FIN_END = 3;

/* ── Floating particles for ambient depth ───────────────────────── */
interface Particle {
  id: number;
  x: string;
  y: string;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      x: `${10 + Math.random() * 80}%`,
      y: `${10 + Math.random() * 80}%`,
      size: 1 + Math.random() * 2.5,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 4,
      color:
        i % 3 === 0
          ? `rgba(${TEAL}, ${0.3 + Math.random() * 0.4})`
          : i % 3 === 1
            ? `rgba(${GOLD}, ${0.2 + Math.random() * 0.3})`
            : `rgba(255,255,255, ${0.15 + Math.random() * 0.25})`,
    });
  }
  return particles;
}

/* ── The Official FinFoundry SVG Logo ───────────────────────────── *
 * CRITICAL: These are the EXACT original paths from logo.svg.
 * All d attributes, transforms, clip-paths — 100% unmodified.
 * ───────────────────────────────────────────────────────────────── */
function OfficialLogo({ className, style }: { className?: string; style?: React.CSSProperties }) {
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

/* ── Main component ─────────────────────────────────────────────── */

export function BrandEntrance() {
  const { shouldPlay, markHeroReady, markNavReady } = useEntrance();
  const prefersReduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("void");
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [mounted, setMounted] = useState(true);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Memoize particles so they don't re-generate
  const particles = useMemo(() => generateParticles(18), []);

  /* ── Timeline ──────────────────────────────────────── */
  useEffect(() => {
    if (!shouldPlay) return;

    if (prefersReduced) {
      markNavReady();
      markHeroReady();
      setMounted(false);
      return;
    }

    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(fn, ms);
      timeoutsRef.current.push(t);
      return t;
    };

    //  0ms   → void (blank)
    // 100ms  → ambient (background breathes, particles appear)
    // 400ms  → logo (blur-to-focus, 1.5s transition)
    // 1900ms → sheen (light sweep across logo)
    // 2300ms → text (staggered character reveal)
    // 3400ms → nav ready
    // 3500ms → hero ready + exit begins
    // 4200ms → overlay removed
    schedule(() => setPhase("ambient"), 100);
    schedule(() => setPhase("logo"), 400);
    schedule(() => setPhase("sheen"), 1900);
    schedule(() => setPhase("text"), 2300);
    schedule(() => markNavReady(), 3400);
    schedule(() => markHeroReady(), 3500);
    schedule(() => setPhase("exit"), 3500);
    schedule(() => setOverlayVisible(false), 4200);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [shouldPlay, prefersReduced, markHeroReady, markNavReady]);

  if (!shouldPlay || !mounted) return null;

  const isAmbient = phase !== "void";
  const isLogoPhase = phase === "logo" || phase === "sheen" || phase === "text" || phase === "exit";
  const isSheenDone = phase === "sheen" || phase === "text" || phase === "exit";
  const isTextVisible = phase === "text" || phase === "exit";
  const isExiting = phase === "exit";

  return (
    <AnimatePresence onExitComplete={() => setMounted(false)}>
      {overlayVisible && (
        <motion.div
          key="brand-overlay"
          className="fixed inset-0 z-[9999] overflow-hidden"
          style={{ pointerEvents: isExiting ? "none" : "auto" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE_SMOOTH }}
        >
          {/* ═══════════════════════════════════════════════════════
           *  LAYER 1 — Multi-Layered Ambient Background
           * ═══════════════════════════════════════════════════════ */}

          {/* Base dark gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 120% 80% at 50% 40%, #0B1023 0%, ${BG} 70%),
                linear-gradient(180deg, ${BG} 0%, #070A1A 100%)
              `,
            }}
          />

          {/* Primary breathing orb — teal, centered */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: "70vmax",
              height: "70vmax",
              top: "50%",
              left: "50%",
              marginTop: "-35vmax",
              marginLeft: "-35vmax",
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${TEAL},0.07) 0%, rgba(${TEAL},0.025) 35%, transparent 65%)`,
              filter: "blur(60px)",
              animation: isAmbient ? "entrance-glow-pulse 5s ease-in-out infinite" : "none",
            }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              opacity: isAmbient && !isExiting ? 1 : 0,
              scale: isAmbient ? 1 : 0.7,
            }}
            transition={{ duration: 2, ease: EASE_SMOOTH }}
          />

          {/* Secondary orb — gold, offset top-right */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: "45vmax",
              height: "45vmax",
              top: "15%",
              right: "-5%",
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${GOLD},0.05) 0%, transparent 65%)`,
              filter: "blur(50px)",
              animation: isAmbient ? "entrance-glow-pulse 6s ease-in-out infinite reverse" : "none",
            }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              opacity: isAmbient && !isExiting ? 0.7 : 0,
              scale: isAmbient ? 1 : 0.7,
            }}
            transition={{ duration: 2, delay: 0.3, ease: EASE_SMOOTH }}
          />

          {/* Tertiary orb — teal, bottom-left  */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: "35vmax",
              height: "35vmax",
              bottom: "10%",
              left: "5%",
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${TEAL},0.04) 0%, transparent 60%)`,
              filter: "blur(45px)",
              animation: isAmbient ? "entrance-glow-pulse 7s ease-in-out infinite" : "none",
            }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              opacity: isAmbient && !isExiting ? 0.6 : 0,
              scale: isAmbient ? 1 : 0.7,
            }}
            transition={{ duration: 2, delay: 0.5, ease: EASE_SMOOTH }}
          />

          {/* Cinematic vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 25%, rgba(0,0,0,0.6) 100%)",
            }}
          />

          {/* ═══════════════════════════════════════════════════════
           *  Floating light particles — cinematic depth
           * ═══════════════════════════════════════════════════════ */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: p.size,
                height: p.size,
                left: p.x,
                top: p.y,
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                willChange: "transform, opacity",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isAmbient && !isExiting ? [0, 0.8, 0] : 0,
                y: isAmbient ? [20, -30, 20] : 20,
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Horizontal datum line */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: "80vw",
              maxWidth: 600,
              height: 1,
              top: "50%",
              left: "50%",
              marginLeft: "-40vw",
              background: `linear-gradient(90deg, transparent, rgba(${TEAL},0.15) 20%, rgba(${GOLD},0.08) 50%, rgba(${TEAL},0.15) 80%, transparent)`,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: isSheenDone && !isExiting ? 1 : 0,
              opacity: isSheenDone && !isExiting ? 0.5 : 0,
            }}
            transition={{ duration: 1, ease: EASE_OUT }}
          />

          {/* ═══════════════════════════════════════════════════════
           *  LAYER 2 — Logo + Sheen + Glow Halo
           * ═══════════════════════════════════════════════════════ */}
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <motion.div
              className="relative flex flex-col items-center"
              /* Exit: scale toward camera + fade */
              animate={{
                scale: isExiting ? 1.5 : 1,
                opacity: isExiting ? 0 : 1,
              }}
              transition={{
                duration: 0.6,
                ease: EASE_PREMIUM,
              }}
            >
              {/* Dual-layer glow halo behind logo */}
              {/* Outer glow — teal, large & soft */}
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  width: "clamp(200px, 35vmin, 380px)",
                  height: "clamp(240px, 42vmin, 460px)",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -55%)",
                  borderRadius: "24%",
                  background: `radial-gradient(ellipse, rgba(${TEAL},0.12) 0%, rgba(${TEAL},0.03) 50%, transparent 70%)`,
                  filter: "blur(40px)",
                  animation:
                    isLogoPhase && !isExiting
                      ? "entrance-glow-pulse 3s ease-in-out infinite"
                      : "none",
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: isLogoPhase && !isExiting ? 0.9 : 0,
                  scale: isLogoPhase ? 1.15 : 0.5,
                }}
                transition={{ duration: 1.2, ease: EASE_OUT }}
              />
              {/* Inner glow — gold, tight & warm */}
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  width: "clamp(120px, 22vmin, 220px)",
                  height: "clamp(150px, 28vmin, 280px)",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -52%)",
                  borderRadius: "18%",
                  background: `radial-gradient(ellipse, rgba(${GOLD},0.1) 0%, rgba(${GOLD},0.02) 50%, transparent 70%)`,
                  filter: "blur(25px)",
                  animation:
                    isLogoPhase && !isExiting
                      ? "entrance-glow-pulse 2.5s ease-in-out infinite reverse"
                      : "none",
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: isLogoPhase && !isExiting ? 0.8 : 0,
                  scale: isLogoPhase ? 1.05 : 0.5,
                }}
                transition={{ duration: 1, delay: 0.2, ease: EASE_OUT }}
              />

              {/* Logo wrapper — blur→focus + sheen sweep */}
              <motion.div
                className="relative z-10 overflow-hidden rounded-lg"
                style={{
                  width: "clamp(85px, 18vmin, 140px)",
                }}
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  filter: "blur(10px)",
                }}
                animate={{
                  opacity: isLogoPhase ? 1 : 0,
                  scale: isLogoPhase ? 1 : 0.95,
                  filter: isLogoPhase ? "blur(0px)" : "blur(10px)",
                }}
                transition={{
                  duration: 1.5,
                  ease: EASE_SMOOTH,
                }}
              >
                <OfficialLogo
                  className="w-full h-auto"
                  style={{
                    filter: `
                      drop-shadow(0 0 16px rgba(${TEAL},0.2))
                      drop-shadow(0 0 40px rgba(${TEAL},0.08))
                      drop-shadow(0 4px 24px rgba(0,0,0,0.4))
                    `,
                  }}
                />

                {/* ── Light sheen sweep (moves once after logo focuses) ── */}
                <motion.div
                  className="absolute inset-0 pointer-events-none z-20"
                  initial={{ x: "-120%" }}
                  animate={{ x: isSheenDone ? "120%" : "-120%" }}
                  transition={{
                    duration: 0.7,
                    ease: EASE_OUT,
                  }}
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 42%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.08) 58%, transparent 70%)",
                  }}
                />
              </motion.div>

              {/* ═══════════════════════════════════════════════════
               *  LAYER 3 — Staggered Typography
               * ═══════════════════════════════════════════════════ */}
              <div className="mt-5 sm:mt-7 overflow-hidden h-[48px] sm:h-[56px] md:h-[64px]">
                <div className="flex items-center justify-center">
                  {BRAND_TEXT.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      className="font-heading font-bold text-[28px] sm:text-[36px] md:text-[42px] tracking-[-0.02em] inline-block"
                      style={{
                        color: i < FIN_END ? "#34D399" : "#F5C542",
                        textShadow:
                          i < FIN_END
                            ? `0 0 24px rgba(${TEAL},0.4), 0 0 60px rgba(${TEAL},0.15)`
                            : `0 0 24px rgba(${GOLD},0.35), 0 0 60px rgba(${GOLD},0.1)`,
                      }}
                      initial={{ y: "120%", opacity: 0 }}
                      animate={{
                        y: isTextVisible ? "0%" : "120%",
                        opacity: isTextVisible ? 1 : 0,
                      }}
                      transition={{
                        duration: 0.6,
                        delay: i * 0.045,
                        ease: EASE_PREMIUM,
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Signature gradient underline */}
              <motion.div
                className="h-px origin-center"
                style={{
                  width: "clamp(140px, 30vmin, 200px)",
                  background: `linear-gradient(90deg, transparent, rgba(${TEAL},0.5) 20%, rgba(${GOLD},0.35) 50%, rgba(${TEAL},0.5) 80%, transparent)`,
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{
                  scaleX: isTextVisible ? 1 : 0,
                  opacity: isTextVisible ? 1 : 0,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.4,
                  ease: EASE_OUT,
                }}
              />

              {/* Tagline */}
              <motion.p
                className="mt-3 text-[10px] sm:text-xs tracking-[0.3em] uppercase"
                style={{ color: "rgba(255,255,255,0.3)" }}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{
                  opacity: isTextVisible ? 1 : 0,
                  y: isTextVisible ? 0 : 10,
                  filter: isTextVisible ? "blur(0px)" : "blur(4px)",
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.55,
                  ease: EASE_OUT,
                }}
              >
                Financial Literacy Club
              </motion.p>
            </motion.div>
          </div>

          {/* ═══════════════════════════════════════════════════════
           *  LAYER 4 — Background slide-up curtain exit
           * ═══════════════════════════════════════════════════════ */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, ${BG} 0%, #070A1A 50%, ${BG} 100%)`,
            }}
            initial={{ y: "0%" }}
            animate={{
              y: isExiting ? "-100%" : "0%",
            }}
            transition={{
              duration: 0.7,
              delay: 0.15,
              ease: EASE_PREMIUM,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
