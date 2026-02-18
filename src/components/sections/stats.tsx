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
    <section className="relative py-16 md:py-20 lg:py-28 border-y border-white/[0.03] bg-surface">
      <div className="content-glow" />
      <div className="relative z-10 container-max">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="text-center"
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
