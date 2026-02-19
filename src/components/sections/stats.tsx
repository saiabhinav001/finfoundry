"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { stats as staticStats } from "@/data/site-data";
import { fadeUp, stagger, viewport } from "@/lib/motion";

export function StatsSection() {
  const [stats, setStats] = useState(staticStats);

  useEffect(() => {
    fetch("/api/about")
      .then((r) => r.json())
      .then((data) => {
        if (data.stats && Array.isArray(data.stats) && data.stats.length > 0)
          setStats(data.stats);
      })
      .catch(() => {});
  }, []);
  return (
    <section className="relative py-16 md:py-20 lg:py-28 border-y border-white/[0.03] bg-surface overflow-hidden">
      <div className="content-glow" />
      {/* Subtle floating orb */}
      <div
        className="floating-orb-sm"
        style={{
          width: 300,
          height: 300,
          top: "-20%",
          right: "10%",
          background: "radial-gradient(circle, rgba(245,197,66,0.03) 0%, transparent 70%)",
          animationDelay: "3s",
        }}
      />
      <div className="relative z-10 container-max">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="glass-stat rounded-2xl p-6 sm:p-8 text-center group cursor-default"
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-gradient-gold tracking-[-0.03em]">
                {stat.value}
              </div>
              <div className="mt-3 text-sm text-muted-foreground font-medium tracking-wide">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
