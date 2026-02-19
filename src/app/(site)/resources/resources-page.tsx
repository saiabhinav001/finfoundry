"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { resources as staticResources } from "@/data/site-data";
import { JoinCTA } from "@/components/sections/join-cta";
import { BookOpen, GraduationCap, Wrench } from "lucide-react";
import { fadeUp, stagger, viewport } from "@/lib/motion";
import { PageHero } from "@/components/shared/page-hero";

const categoryIcons: Record<string, React.ElementType> = {
  Books: BookOpen,
  "Online Courses": GraduationCap,
  "Tools & Platforms": Wrench,
};

interface ResourceItem {
  title: string;
  author: string;
  description: string;
}

interface ResourceCategory {
  id?: string;
  category: string;
  items: ResourceItem[];
}

export function ResourcesPage() {
  const [resources, setResources] = useState<ResourceCategory[]>(staticResources);

  useEffect(() => {
    fetch("/api/resources")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setResources(data);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <PageHero
        badge="Resources"
        title={<>Curated Learning<br /><span className="text-gradient">Resources</span></>}
        description="Handpicked books, courses, and tools vetted by our team to accelerate your financial education."
      />

      {resources.map((category, ci) => {
        const Icon = categoryIcons[category.category] || BookOpen;
        return (
          <SectionWrapper
            key={category.category}
            className={ci % 2 === 1 ? "bg-surface" : ""}
          >
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              className="flex items-center gap-3 mb-10"
            >
              <div className="w-10 h-10 rounded-xl neo-icon flex items-center justify-center">
                <Icon className="w-5 h-5 text-teal-light/80" />
              </div>
              <h2 className="font-heading font-bold text-2xl tracking-[-0.02em] text-foreground">
                {category.category}
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              className="grid sm:grid-cols-2 md:grid-cols-3 gap-5"
            >
              {category.items.map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className="group glass-card rounded-2xl p-7 transition-all duration-[250ms] ease-out hover:-translate-y-1"
                >
                  <h3 className="font-heading font-semibold text-[17px] text-foreground mb-1 tracking-[-0.01em]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-teal-light/70 font-medium mb-3">
                    {item.author}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </SectionWrapper>
        );
      })}

      <JoinCTA />
    </>
  );
}
