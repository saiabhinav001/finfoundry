"use client";

import { motion, useReducedMotion } from "framer-motion";
import { depthLift, fadeUp, fadeUpSmall, viewport, viewportHeading } from "@/lib/motion";

/* ═══════════════════════════════════════════════════════════════════
 * SectionHeading v2.0 — Depth Lift Reveal System
 *
 * Major headings:
 *   "Depth Lift Reveal" — text rises from masked position with
 *   opacity build + subtle filter blur clearing. No character
 *   animation. No stretching. No cartoon scaling.
 *
 * Badge:
 *   Gentle fade + micro translateY, faster than heading.
 *
 * Description:
 *   Staggered after heading, slight delay, softer motion.
 *
 * SOP compliance: §4.1, §4.2, §7, §9
 * ═══════════════════════════════════════════════════════════════════ */

interface SectionHeadingProps {
  badge?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  badge,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  const prefersReduced = useReducedMotion();

  // Reduced motion: instant reveal, no blur, no translateY
  const reducedVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0 },
    },
  };

  return (
    <div className={`mb-12 md:mb-16 lg:mb-20 ${align === "center" ? "text-center" : "text-left"}`}>
      {badge && (
        <motion.span
          variants={prefersReduced ? reducedVariant : fadeUpSmall}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-gold/90 glass-badge-gold rounded-full mb-6"
        >
          {badge}
        </motion.span>
      )}

      {/* ── Depth Lift Reveal — heading rises with blur clearing ── */}
      <div className="overflow-hidden">
        <motion.h2
          variants={prefersReduced ? reducedVariant : depthLift}
          initial="hidden"
          whileInView="visible"
          viewport={viewportHeading}
          className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.025em] leading-[1.1] text-foreground"
        >
          {title}
        </motion.h2>
      </div>

      {description && (
        <motion.p
          variants={prefersReduced ? reducedVariant : fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className={`mt-5 text-muted-foreground text-lg leading-relaxed ${
            align === "center" ? "max-w-[60ch] mx-auto" : "max-w-[60ch]"
          }`}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
