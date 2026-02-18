"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEntrance } from "@/lib/entrance-context";

/* ═══════════════════════════════════════════════════════════════
 * BrandEntrance — "The Forge Protocol"
 *
 * Cinematic brand reveal for FinFoundry.
 *
 * Five-act sequence:
 *   1. SPARK    — Central pulse ignites, particle field appears
 *   2. CONVERGE — Particles collapse inward along spiral paths
 *   3. FORGE    — Convergence flash, logo materialises + sheen
 *   4. BRAND    — Text cipher resolves "FinFoundry" + underline
 *   5. EXIT     — Everything ascends and dissolves into the page
 *
 * All effects use absolute centering via flexbox — no manual
 * margin offsets. Responsive via vmin-based particle radii.
 * Total duration: ~3.4s. Plays once per session, homepage only.
 * ═══════════════════════════════════════════════════════════════ */

type Phase = "void" | "spark" | "converge" | "forge" | "brand" | "exit";

const CIPHER_CHARS = "ΔΣΩΠΦ₿¥€$£∑∂ψ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE = [0.4, 0, 0.2, 1] as const;

/* ── Particle system ─────────────────────────────────────────── */

interface Particle {
  id: number;
  /** Unit-circle x: multiply by a vmin-based radius at render */
  ux: number;
  /** Unit-circle y */
  uy: number;
  size: number;
  delay: number;
  hue: "emerald" | "gold" | "white";
}

/**
 * Fibonacci sunflower — golden-angle distribution.
 * Returns normalised positions (multiply by radius at render).
 */
function seedParticles(n: number): Particle[] {
  const φ = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const θ = i * φ;
    // r from 0.25 → 1.0 of the outer radius
    const r = 0.25 + Math.sqrt(i / n) * 0.75;
    return {
      id: i,
      ux: Math.cos(θ) * r,
      uy: Math.sin(θ) * r,
      size: 1.5 + (i % 3) * 0.8,
      delay: (i / n) * 0.25,
      hue: (i % 7 === 0 ? "gold" : i % 4 === 0 ? "white" : "emerald") as Particle["hue"],
    };
  });
}

const HUE_COLOR: Record<Particle["hue"], string> = {
  emerald: "rgba(16, 185, 129, 0.9)",
  gold: "rgba(245, 197, 66, 0.85)",
  white: "rgba(255, 255, 255, 0.85)",
};

const HUE_GLOW: Record<Particle["hue"], string> = {
  emerald: "0 0 6px 2px rgba(16,185,129,0.35)",
  gold: "0 0 6px 2px rgba(245,197,66,0.3)",
  white: "0 0 5px 1px rgba(255,255,255,0.4)",
};

/* ── Responsive particle radius ──────────────────────────────── */

function useParticleRadius() {
  const [radius, setRadius] = useState(160);
  const update = useCallback(() => {
    const vmin = Math.min(window.innerWidth, window.innerHeight);
    // 28vmin on desktop, clamp 100–240px
    setRadius(Math.max(100, Math.min(240, vmin * 0.28)));
  }, []);
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);
  return radius;
}

/* ── Text cipher (scramble → resolve) ────────────────────────── */

function useCipher(text: string, active: boolean) {
  const [display, setDisplay] = useState("");
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      if (!resolvedRef.current) setDisplay("");
      return;
    }

    resolvedRef.current = false;
    let revealed = 0;
    const len = text.length;
    const iters = new Array(len).fill(0);

    const tick = setInterval(() => {
      const buf = text.split("").map((char, i) => {
        if (i < revealed) return char;
        iters[i]++;
        // Lock each char after 3 random cycles
        if (i === revealed && iters[i] > 3) {
          revealed++;
          return char;
        }
        return CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
      });
      setDisplay(buf.join(""));
      if (revealed >= len) {
        resolvedRef.current = true;
        clearInterval(tick);
      }
    }, 35);

    return () => clearInterval(tick);
  }, [text, active]);

  return display;
}

/* ── Centered ring helper ────────────────────────────────────── */
/**
 * All rings / flashes use this wrapper — a zero-size anchor at
 * the exact center of the viewport, so children can scale from
 * center without margin hacks.
 */
function CenterAnchor({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative w-0 h-0">{children}</div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export function BrandEntrance() {
  const { shouldPlay, markHeroReady, markNavReady } = useEntrance();
  const [phase, setPhase] = useState<Phase>("void");
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [mounted, setMounted] = useState(true);

  const particles = useMemo(() => seedParticles(28), []);
  const pRadius = useParticleRadius();

  // Cipher — split at 3 for dual-color ("Fin" + "Foundry")
  const branded = phase === "brand" || phase === "exit";
  const brandText = useCipher("FinFoundry", branded);
  const finDisplay = brandText.slice(0, 3);
  const foundryDisplay = brandText.slice(3);

  /* ── Timeline ──────────────────────────────────────── */
  useEffect(() => {
    if (!shouldPlay) return;
    const t = [
      setTimeout(() => setPhase("spark"), 150),
      setTimeout(() => setPhase("converge"), 650),
      setTimeout(() => setPhase("forge"), 1250),
      setTimeout(() => setPhase("brand"), 1700),
      setTimeout(() => markNavReady(), 2750),
      setTimeout(() => markHeroReady(), 2950),
      setTimeout(() => setPhase("exit"), 3000),
      setTimeout(() => setOverlayVisible(false), 3200),
    ];
    return () => t.forEach(clearTimeout);
  }, [shouldPlay, markHeroReady, markNavReady]);

  if (!shouldPlay || !mounted) return null;

  const sparked = phase !== "void";
  const converged = sparked && phase !== "spark";
  const forged = phase === "forge" || phase === "brand" || phase === "exit";
  const exiting = phase === "exit";

  return (
    <AnimatePresence onExitComplete={() => setMounted(false)}>
      {overlayVisible && (
        <motion.div
          key="forge-overlay"
          className="fixed inset-0 z-[9999] overflow-hidden"
          style={{ backgroundColor: "#050816", pointerEvents: exiting ? "none" : "auto" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {/* ── Cinematic vignette ────────────────── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, rgba(0,0,0,0.45) 100%)",
            }}
          />

          {/* ── Background grid ──────────────────── */}
          <motion.div
            className="absolute inset-0 grid-pattern pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: sparked && !exiting ? 0.12 : 0 }}
            transition={{ duration: 1, ease: EASE }}
          />

          {/* ── Horizontal datum line ────────────── */}
          <CenterAnchor>
            <motion.div
              className="absolute h-px pointer-events-none"
              style={{
                width: "90vw",
                left: "-45vw",
                top: 0,
                background:
                  "linear-gradient(90deg, transparent, rgba(16,185,129,0.18) 20%, rgba(245,197,66,0.1) 50%, rgba(16,185,129,0.18) 80%, transparent)",
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: sparked && !exiting ? 1 : 0,
                opacity: sparked && !exiting ? 0.6 : 0,
              }}
              transition={{
                scaleX: { duration: 1.1, ease: EASE_OUT },
                opacity: { duration: exiting ? 0.2 : 0.7 },
              }}
            />
          </CenterAnchor>

          {/* ── Pulse rings (all centered) ────────── */}
          <CenterAnchor>
            {/* Ring 1 — emerald, 500px */}
            <motion.div
              className="absolute rounded-full border pointer-events-none"
              style={{
                width: 500,
                height: 500,
                top: -250,
                left: -250,
                borderColor: "rgba(16,185,129,0.18)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={sparked ? { scale: [0, 1], opacity: [0, 0.45, 0] } : {}}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            {/* Ring 2 — gold, 800px */}
            <motion.div
              className="absolute rounded-full border pointer-events-none"
              style={{
                width: 800,
                height: 800,
                top: -400,
                left: -400,
                borderColor: "rgba(245,197,66,0.08)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={sparked ? { scale: [0, 1], opacity: [0, 0.25, 0] } : {}}
              transition={{ duration: 2, delay: 0.1, ease: "easeOut" }}
            />
            {/* Ring 3 — white, tight 300px */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 300,
                height: 300,
                top: -150,
                left: -150,
                border: "0.5px solid rgba(255,255,255,0.07)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={sparked ? { scale: [0, 1.2], opacity: [0, 0.5, 0] } : {}}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </CenterAnchor>

          {/* ── Particle field (centered via CenterAnchor) ── */}
          <CenterAnchor>
            {particles.map((p) => {
              const px = p.ux * pRadius;
              const py = p.uy * pRadius;
              return (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full"
                  style={{
                    width: p.size,
                    height: p.size,
                    marginTop: -(p.size / 2),
                    marginLeft: -(p.size / 2),
                    backgroundColor: HUE_COLOR[p.hue],
                    boxShadow: HUE_GLOW[p.hue],
                    willChange: "transform, opacity",
                  }}
                  initial={{ x: px, y: py, opacity: 0, scale: 0 }}
                  animate={{
                    x: converged ? 0 : px,
                    y: converged ? 0 : py,
                    opacity:
                      phase === "void" ? 0
                      : !converged ? 0.8
                      : forged ? 0
                      : 1,
                    scale:
                      phase === "void" ? 0
                      : !converged ? 1
                      : forged ? 0
                      : 1.4,
                  }}
                  transition={{
                    x: { duration: converged ? 0.5 : 0.4, delay: p.delay, ease: EASE_OUT },
                    y: { duration: converged ? 0.5 : 0.4, delay: p.delay, ease: EASE_OUT },
                    opacity: { duration: 0.3, delay: converged ? p.delay * 0.3 : p.delay },
                    scale: { duration: converged ? 0.4 : 0.3, delay: converged ? p.delay * 0.3 : p.delay, ease: EASE_OUT },
                  }}
                />
              );
            })}
          </CenterAnchor>

          {/* ── Convergence flash (centered) ──────── */}
          <CenterAnchor>
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 180,
                height: 180,
                top: -90,
                left: -90,
                background:
                  "radial-gradient(circle, rgba(16,185,129,0.55) 0%, rgba(16,185,129,0.12) 45%, transparent 70%)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={forged ? { scale: [0, 1.3, 0.5], opacity: [0, 1, 0] } : {}}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            {/* Impact ring */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 200,
                height: 200,
                top: -100,
                left: -100,
                border: "1.5px solid rgba(255,255,255,0.1)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={forged ? { scale: [0, 1], opacity: [0, 0.6, 0] } : {}}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </CenterAnchor>

          {/* ── Center content (logo + text + line) ── */}
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <motion.div
              className="relative z-10 flex flex-col items-center text-center"
              animate={{
                opacity: exiting ? 0 : 1,
                y: exiting ? -28 : 0,
                scale: exiting ? 1.04 : 1,
              }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
            >
              {/* Ambient halo */}
              <motion.div
                className="absolute pointer-events-none rounded-full"
                style={{
                  width: 260,
                  height: 260,
                  top: "50%",
                  left: "50%",
                  marginTop: -150,
                  marginLeft: -130,
                  background:
                    "radial-gradient(circle, rgba(16,185,129,0.05) 0%, rgba(16,185,129,0.015) 45%, transparent 70%)",
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: forged && !exiting ? 1 : 0,
                  scale: forged ? 1 : 0.5,
                }}
                transition={{ duration: 0.8, ease: EASE_OUT }}
              />

              {/* Logo — blur-to-sharp + sheen sweep */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{
                  opacity: forged ? 1 : 0,
                  scale: forged ? 1 : 0.82,
                }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
              >
                {/* Sheen sweep */}
                <motion.div
                  className="absolute inset-[-6px] z-20 pointer-events-none overflow-hidden rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: forged ? 1 : 0 }}
                >
                  <motion.div
                    className="absolute inset-0"
                    initial={{ x: "-150%" }}
                    animate={{ x: forged ? "150%" : "-150%" }}
                    transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT }}
                    style={{
                      background:
                        "linear-gradient(105deg, transparent 28%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.06) 60%, transparent 72%)",
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ filter: "blur(10px)" }}
                  animate={{ filter: forged ? "blur(0px)" : "blur(10px)" }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                >
                  <Image
                    src="/logo.png"
                    alt="FinFoundry"
                    width={120}
                    height={150}
                    className="w-16 h-auto sm:w-[76px] drop-shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    priority
                    unoptimized
                  />
                </motion.div>
              </motion.div>

              {/* Cipher text */}
              <motion.div
                className="mt-4 sm:mt-5 h-[44px] sm:h-[52px] flex items-center justify-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{
                  opacity: branded ? 1 : 0,
                  y: branded ? 0 : 8,
                }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
              >
                <span className="font-heading font-bold text-[30px] sm:text-[38px] tracking-[-0.02em] whitespace-nowrap">
                  <span className="text-teal-light">{finDisplay}</span>
                  <span className="text-gold">{foundryDisplay}</span>
                </span>
              </motion.div>

              {/* Signature underline */}
              <motion.div
                className="h-px origin-center"
                style={{
                  width: 160,
                  background:
                    "linear-gradient(90deg, transparent, rgba(16,185,129,0.5) 20%, rgba(245,197,66,0.35) 50%, rgba(16,185,129,0.5) 80%, transparent)",
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{
                  scaleX: branded ? 1 : 0,
                  opacity: branded ? 1 : 0,
                }}
                transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
