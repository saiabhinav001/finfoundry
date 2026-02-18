"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { SectionHeading } from "@/components/shared/section-heading";
import { programs as staticPrograms } from "@/data/site-data";
import { HiArrowRight } from "react-icons/hi";
import { fadeUp, stagger, viewport } from "@/lib/motion";
import {
  TrendingUp,
  BarChart3,
  Wallet,
  Bitcoin,
  LineChart,
  Building2,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  TrendingUp,
  BarChart3,
  Wallet,
  Bitcoin,
  LineChart,
  Building2,
};

export function ProgramsPreview() {
  const [programs, setPrograms] = useState(staticPrograms);

  useEffect(() => {
    fetch("/api/programs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPrograms(data);
      })
      .catch(() => {});
  }, []);

  return (
    <SectionWrapper className="bg-surface">
      <SectionHeading
        badge="Programs"
        title="Structured Learning Paths"
        description="From market basics to advanced derivatives — our programs are designed to build real-world financial literacy."
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {programs.map((program) => {
          const Icon = iconMap[program.icon] || TrendingUp;
          return (
            <motion.div
              key={program.title}
              variants={fadeUp}
              className="group glass-card rounded-2xl p-7 transition-all duration-[250ms] ease-out hover:-translate-y-1"
            >
              <div className="w-11 h-11 rounded-xl bg-teal/[0.06] flex items-center justify-center mb-5 group-hover:bg-teal/[0.1] transition-colors duration-250">
                <Icon className="w-5 h-5 text-teal-light/80" />
              </div>
              <h3 className="font-heading font-semibold text-[17px] text-foreground mb-2 tracking-[-0.01em]">
                {program.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {program.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        className="mt-16 text-center"
      >
        <Link
          href="/programs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-light hover:text-teal transition-colors duration-200 group"
        >
          View All Programs
          <HiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
        </Link>
      </motion.div>
    </SectionWrapper>
  );
}
