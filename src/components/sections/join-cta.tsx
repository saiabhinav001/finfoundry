"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi";
import { fadeUp, viewport } from "@/lib/motion";

export function JoinCTA() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-36 bg-surface">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-teal/[0.018] blur-[220px]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-gold/[0.008] blur-[200px]" />
      </div>

      <div className="relative z-10 container-max text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-gold/90 bg-gold/[0.06] rounded-full mb-6 border border-gold/[0.1]">
            Ready to Start?
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.025em] leading-[1.1] max-w-3xl mx-auto">
            Your Financial Journey
            <br />
            <span className="text-gradient">Starts Here</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-[50ch] mx-auto leading-relaxed">
            Join 500+ students who are already building their financial literacy.
            No prior experience required — just the drive to learn.
          </p>
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl bg-gold text-background hover:bg-gold-light hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_3px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.3),0_8px_24px_rgba(245,197,66,0.15)] hover:brightness-105"
            >
              Join FinFoundry
              <HiArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl border border-white/[0.08] text-foreground hover:bg-white/[0.03] hover:border-emerald-500/20 hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.06)]"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
