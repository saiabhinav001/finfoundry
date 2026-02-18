"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { SectionHeading } from "@/components/shared/section-heading";
import { programs as staticPrograms } from "@/data/site-data";
import { JoinCTA } from "@/components/sections/join-cta";
import { fadeUp, stagger, viewport } from "@/lib/motion";
import { PageHero } from "@/components/shared/page-hero";
import {
  TrendingUp,
  BarChart3,
  Wallet,
  Bitcoin,
  LineChart,
  Building2,
  CheckCircle2,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  TrendingUp,
  BarChart3,
  Wallet,
  Bitcoin,
  LineChart,
  Building2,
};

const learningOutcomes = [
  "Read and interpret financial statements",
  "Perform fundamental and technical analysis",
  "Build financial models in Excel",
  "Understand derivatives and options pricing",
  "Manage personal investment portfolios",
  "Evaluate companies using DCF and comparable methods",
  "Navigate cryptocurrency and DeFi responsibly",
  "Prepare for roles in finance and consulting",
];

interface ProgramItem {
  id?: string;
  title: string;
  description: string;
  icon: string;
}

export function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramItem[]>(staticPrograms);

  useEffect(() => {
    fetch("/api/programs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPrograms(data);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <PageHero
        badge="Programs"
        title={<>Structured Paths to<br /><span className="text-gradient">Financial Mastery</span></>}
        description="Each program is carefully designed to build upon the last, taking you from fundamental concepts to advanced financial strategies."
      />

      {/* Programs Grid */}
      <SectionWrapper>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="grid md:grid-cols-2 gap-5"
        >
          {programs.map((program) => {
            const Icon = iconMap[program.icon] || TrendingUp;
            return (
              <motion.div
                key={program.title}
                variants={fadeUp}
                className="group glass-card rounded-2xl p-8 transition-all duration-[250ms] ease-out hover:-translate-y-1"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-teal/[0.06] flex items-center justify-center shrink-0 group-hover:bg-teal/[0.1] transition-colors duration-250">
                    <Icon className="w-5 h-5 text-teal-light/80" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-xl text-foreground mb-3 tracking-[-0.01em]">
                      {program.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {program.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </SectionWrapper>

      {/* Learning Outcomes */}
      <SectionWrapper className="bg-surface">
        <SectionHeading
          badge="Outcomes"
          title="What You'll Learn"
          description="By the end of our programs, members are equipped with practical skills for real-world finance."
        />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto"
        >
          {learningOutcomes.map((outcome) => (
            <motion.div
              key={outcome}
              variants={fadeUp}
              className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.03]"
            >
              <CheckCircle2 className="w-4.5 h-4.5 text-teal-light/70 shrink-0 mt-0.5" />
              <span className="text-sm text-foreground/90">{outcome}</span>
            </motion.div>
          ))}
        </motion.div>
      </SectionWrapper>

      <JoinCTA />
    </>
  );
}
