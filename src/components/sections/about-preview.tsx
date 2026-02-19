"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { SectionHeading } from "@/components/shared/section-heading";
import { HiArrowRight } from "react-icons/hi";
import { fadeUp, viewport } from "@/lib/motion";

export function AboutPreview() {
  return (
    <SectionWrapper>
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        <div>
          <SectionHeading
            badge="About Us"
            title="Where Finance Meets Engineering"
            align="left"
          />
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="space-y-4 text-muted-foreground leading-relaxed -mt-8 prose-narrow"
          >
            <p>
              CBIT FinFoundry is the flagship financial literacy club at
              Chaitanya Bharathi Institute of Technology, one of Hyderabad&apos;s
              top engineering institutions. We bridge the gap between technical
              education and financial acumen.
            </p>
            <p>
              Our mission is to create a community of financially aware engineers
              who understand markets, can build financial models, and make
              informed investment decisions — skills that traditional engineering
              curricula don&apos;t cover.
            </p>
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            <Link
              href="/about"
              className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-teal-light hover:text-teal transition-colors duration-200 group"
            >
              Learn More About Us
              <HiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </motion.div>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="relative"
        >
          <div className="glass-card rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl neo-icon flex items-center justify-center">
                <span className="text-teal-light/80 text-lg font-heading font-bold">01</span>
              </div>
              <div>
                <h4 className="font-heading font-semibold text-foreground">Learn</h4>
                <p className="text-sm text-muted-foreground">Expert-led workshops and courses</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl neo-icon flex items-center justify-center">
                <span className="text-teal-light/80 text-lg font-heading font-bold">02</span>
              </div>
              <div>
                <h4 className="font-heading font-semibold text-foreground">Practice</h4>
                <p className="text-sm text-muted-foreground">Simulated trading & real case studies</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl neo-icon-gold flex items-center justify-center">
                <span className="text-gold/80 text-lg font-heading font-bold">03</span>
              </div>
              <div>
                <h4 className="font-heading font-semibold text-foreground">Excel</h4>
                <p className="text-sm text-muted-foreground">Compete, network, and grow your career</p>
              </div>
            </div>
          </div>
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-gradient-to-br from-teal/[0.04] to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-gradient-to-br from-gold/[0.03] to-transparent rounded-full blur-3xl" />
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
