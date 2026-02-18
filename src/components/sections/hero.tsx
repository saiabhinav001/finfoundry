"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi";
import { useEntrance } from "@/lib/entrance-context";

/* ═══════════════════════════════════════════════════════════════ */
/*  HERO — Content-first. Clean background, no glow artifacts.  */
/*  Entrance-aware: waits for brand reveal before animating.     */
/* ═══════════════════════════════════════════════════════════════ */
export function HeroSection() {
  const prefersReduced = useReducedMotion();
  const { heroReady } = useEntrance();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.14, delayChildren: 0.1 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Fine dot grid for depth */}
      <div className="absolute inset-0 grid-pattern opacity-60" />

      {/* Soft top-center radial — barely visible, just enough depth */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(1200px,100vw)] h-[600px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.05) 0%, transparent 70%)",
          transform: "translateX(-50%) translateZ(0)",
        }}
      />

      {/* ════════ CONTENT ════════════════════════════════════ */}
      <motion.div
        className="relative z-10 container-max text-center"
        variants={container}
        initial="hidden"
        animate={heroReady ? "show" : "hidden"}
      >
        {/* Badge */}
        <motion.div variants={fadeUp}>
          <span className="inline-flex items-center px-5 py-2 text-xs font-semibold tracking-[0.2em] uppercase text-teal-light/80 bg-teal/[0.06] rounded-full mb-6 sm:mb-8 border border-teal/[0.1]">
            CBIT Hyderabad
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={fadeUp}
          className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold tracking-[-0.03em] leading-[1.08] max-w-4xl mx-auto"
        >
          Build Your
          <br />
          <span className="text-gradient">Financial Edge</span>
        </motion.h1>

        {/* Decorative rule */}
        <motion.div
          className="mx-auto mt-5 sm:mt-6 h-px bg-gradient-to-r from-transparent via-teal/25 to-transparent"
          initial={{ width: 0, opacity: 0 }}
          animate={heroReady ? { width: 160, opacity: 1 } : { width: 0, opacity: 0 }}
          transition={{
            duration: 1,
            delay: heroReady ? 0.65 : 0,
            ease: [0.22, 1, 0.36, 1],
          }}
        />

        {/* Description */}
        <motion.p
          variants={fadeUp}
          className="mt-6 sm:mt-8 text-lg sm:text-xl text-muted-foreground max-w-[52ch] mx-auto leading-relaxed"
        >
          The premier financial literacy club at CBIT. Master stock markets,
          financial modeling, and wealth management — engineered for the next
          generation of leaders.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={fadeUp}
          className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl bg-gold text-background hover:bg-gold-light transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.3),0_8px_24px_rgba(245,197,66,0.18)] hover:-translate-y-0.5"
          >
            Join FinFoundry
            <HiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl border border-white/[0.08] text-foreground hover:bg-white/[0.03] hover:border-teal/15 hover:-translate-y-0.5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.06)]"
          >
            Explore Programs
          </Link>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050816] to-transparent z-[3]" />
    </section>
  );
}
