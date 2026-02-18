"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { JoinCTA } from "@/components/sections/join-cta";
import { FaLinkedinIn } from "react-icons/fa";
import { fadeUp, stagger, viewport } from "@/lib/motion";
import { PageHero } from "@/components/shared/page-hero";
import { Users } from "lucide-react";

interface TeamMember {
  id?: string;
  name: string;
  role: string;
  image?: string;
  linkedin?: string;
  batch?: string;
  category?: "core_committee" | "team_head" | "member";
}

export function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBatch, setActiveBatch] = useState<string>("");

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMembers(data);
          // Default to the latest batch
          const batches = [...new Set(data.map((m: TeamMember) => m.batch).filter(Boolean))] as string[];
          if (batches.length > 0) {
            batches.sort((a, b) => b.localeCompare(a));
            setActiveBatch(batches[0]);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Extract unique batches sorted descending (latest first)
  const batches = useMemo(() => {
    const set = new Set(members.map((m) => m.batch).filter(Boolean) as string[]);
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [members]);

  // Filter members by active batch
  const filteredMembers = useMemo(() => {
    if (!activeBatch) return members;
    return members.filter((m) => m.batch === activeBatch);
  }, [members, activeBatch]);

  // Group by category: core committee first, then team heads, then members
  const grouped = useMemo(() => {
    const groups: { key: string; label: string; members: TeamMember[] }[] = [];
    const core = filteredMembers.filter((m) => m.category === "core_committee");
    const heads = filteredMembers.filter((m) => m.category === "team_head");
    const rest = filteredMembers.filter((m) => !m.category || m.category === "member");
    if (core.length) groups.push({ key: "core", label: "Core Committee", members: core });
    if (heads.length) groups.push({ key: "heads", label: "Team Heads", members: heads });
    if (rest.length) groups.push({ key: "members", label: "Members", members: rest });
    return groups;
  }, [filteredMembers]);

  return (
    <>
      <PageHero
        badge="Our Team"
        title={<>The People Behind<br /><span className="text-gradient">FinFoundry</span></>}
        description="Meet the student leaders driving financial literacy at CBIT."
      />

      <SectionWrapper>
        {/* Batch filter tabs — only shown when multiple batches exist */}
        {batches.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-2 mb-12"
          >
            {batches.map((batch) => (
              <button
                key={batch}
                onClick={() => setActiveBatch(batch)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeBatch === batch
                    ? "bg-teal text-white shadow-lg shadow-teal/20"
                    : "bg-white/[0.04] text-muted-foreground hover:text-foreground hover:bg-white/[0.08] border border-white/[0.06]"
                }`}
              >
                Batch {batch}
              </button>
            ))}
          </motion.div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
                <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/[0.04] mb-4" />
                <div className="h-4 bg-white/[0.04] rounded-lg w-3/4 mx-auto mb-2" />
                <div className="h-3 bg-white/[0.04] rounded-lg w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && members.length === 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="glass-card rounded-2xl p-12 text-center max-w-lg mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-teal/[0.06] flex items-center justify-center mx-auto mb-5">
              <Users className="w-7 h-7 text-teal-light/50" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              Team details coming soon
            </h3>
            <p className="text-sm text-muted-foreground">
              The team is being finalized. Member profiles, photos, and
              LinkedIn connections will be updated here shortly.
            </p>
          </motion.div>
        )}

        {/* Team grid */}
        {!loading && filteredMembers.length > 0 && (
          <>
            {/* Batch heading + member count */}
            <div className="flex items-center justify-between mb-8">
              <div>
                {activeBatch && (
                  <h2 className="font-heading font-bold text-xl text-foreground">
                    Batch {activeBatch}
                  </h2>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {grouped.map((group) => (
              <div key={group.key} className="mb-12 last:mb-0">
                <motion.h3
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5 }}
                  className="font-heading font-semibold text-lg text-teal-light/80 mb-6"
                >
                  {group.label}
                </motion.h3>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeBatch}-${group.key}`}
                    variants={stagger}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    viewport={viewport}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
                  >
                    {group.members.map((member) => (
                      <motion.div
                        key={member.id || member.name}
                        variants={fadeUp}
                        className="group glass-card rounded-2xl p-5 text-center hover:border-teal/[0.15] transition-colors duration-250"
                      >
                        {/* Avatar */}
                        <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-4 border border-white/[0.08] group-hover:border-teal/[0.2] transition-colors duration-250">
                          {member.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-teal/[0.08] to-surface flex items-center justify-center">
                              <span className="text-xl font-heading font-bold text-teal-light/40">
                                {member.name?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>
                          )}

                          {/* LinkedIn overlay */}
                          {member.linkedin && (
                            <a
                              href={member.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-250"
                            >
                              <FaLinkedinIn className="w-4 h-4 text-white" />
                            </a>
                          )}
                        </div>

                        {/* Info */}
                        <h3 className="font-heading font-semibold text-sm text-foreground leading-tight">
                          {member.name}
                        </h3>
                        <p className="text-xs text-teal-light/70 mt-1 font-medium">
                          {member.role}
                        </p>

                        {/* LinkedIn link (mobile-friendly) */}
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-[11px] text-muted-foreground hover:text-teal-light bg-white/[0.03] hover:bg-teal/[0.06] border border-white/[0.06] hover:border-teal/[0.15] transition-all sm:hidden"
                          >
                            <FaLinkedinIn className="w-3 h-3" />
                            LinkedIn
                          </a>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            ))}
          </>
        )}
      </SectionWrapper>

      <JoinCTA />
    </>
  );
}
