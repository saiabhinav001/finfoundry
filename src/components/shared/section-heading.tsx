"use client";

import { motion } from "framer-motion";
import { fadeUp, fadeUpSmall, viewport } from "@/lib/motion";

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
  return (
    <div className={`mb-12 md:mb-16 lg:mb-20 ${align === "center" ? "text-center" : "text-left"}`}>
      {badge && (
        <motion.span
          variants={fadeUpSmall}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-gold/90 glass-badge-gold rounded-full mb-6"
        >
          {badge}
        </motion.span>
      )}
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.025em] leading-[1.1] text-foreground"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          variants={fadeUp}
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
