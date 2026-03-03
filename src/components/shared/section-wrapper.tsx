"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════
 * SectionWrapper v2.0 — Layered Parallax Depth System
 *
 * Three-layer parallax architecture:
 *   Layer 1 (z-0): Background gradient — shifts 10px on scroll
 *   Layer 2 (z-1): Ambient glow — shifts 6px on scroll
 *   Layer 3 (z-10): Content — no shift (reference layer)
 *
 * Total parallax shift: 8–12px max (SOP §3 compliant).
 * Uses transform only — no layout thrashing.
 * Respects prefers-reduced-motion — layers are static.
 *
 * "showGlow" prop controls whether ambient emerald glow is visible.
 * Use sparingly — not every section needs glow (SOP §7 MII limits).
 *
 * SOP compliance: §3, §7, §8, §9
 * ═══════════════════════════════════════════════════════════════════ */

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** Show subtle ambient glow layer. Default false to maintain restraint. */
  showGlow?: boolean;
  /** Glow color variant. Default "emerald". */
  glowColor?: "emerald" | "gold";
}

export function SectionWrapper({
  children,
  className = "",
  id,
  showGlow = false,
  glowColor = "emerald",
}: SectionWrapperProps) {
  const ref = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax shifts — subtle, restrained
  // Layer 1 (bg gradient): moves 10px over section scroll
  const bgY = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [8, -8]);
  // Layer 2 (glow): moves 5px — less than bg for depth separation
  const glowY = useTransform(scrollYProgress, [0, 1], prefersReduced ? [0, 0] : [5, -5]);

  const glowGradient = glowColor === "gold"
    ? "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(245,197,66,0.025) 0%, transparent 70%)"
    : "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16,185,129,0.02) 0%, transparent 70%)";

  return (
    <section ref={ref} id={id} className={`section-padding relative overflow-hidden ${className}`}>
      {/* Layer 1 — Background depth gradient (parallax) */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          y: bgY,
          background: "linear-gradient(180deg, transparent 0%, rgba(5,8,22,0.3) 50%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Layer 2 — Ambient glow (parallax, optional) */}
      {showGlow && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            y: glowY,
            background: glowGradient,
          }}
          aria-hidden="true"
        />
      )}

      {/* Layer 3 — Content (no parallax shift — reference layer) */}
      <div className="relative z-10 container-max">{children}</div>
    </section>
  );
}
