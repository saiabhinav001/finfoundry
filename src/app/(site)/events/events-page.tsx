"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { events as staticEvents } from "@/data/site-data";
import { JoinCTA } from "@/components/sections/join-cta";
import { Calendar, Tag, MapPin, Clock, ExternalLink } from "lucide-react";
import { fadeUp, stagger, viewport } from "@/lib/motion";
import { PageHero } from "@/components/shared/page-hero";

interface EventItem {
  id?: string;
  title: string;
  date: string;
  type: string;
  status: string;
  description: string;
  venue?: string;
  time?: string;
  registrationLink?: string;
  imageURL?: string;
}

const statusColors: Record<string, string> = {
  upcoming: "text-teal-light/90 bg-teal/[0.06] border-teal/[0.1]",
  ongoing: "text-gold/90 bg-gold/[0.06] border-gold/[0.1]",
  completed: "text-muted-foreground bg-white/[0.03] border-white/[0.06]",
};

const statusLabels: Record<string, string> = {
  upcoming: "upcoming",
  ongoing: "🔴 Happening Now",
  completed: "completed",
};

type FilterType = "all" | "upcoming" | "ongoing" | "completed";

interface EventsPageProps {
  events: EventItem[];
}

export function EventsPage({ events: serverEvents }: EventsPageProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const events: EventItem[] = serverEvents.length > 0 ? serverEvents : staticEvents;

  return (
    <>
      <PageHero
        badge="Events"
        title={<>Conferences, Competitions<br /><span className="text-gradient">&amp; Workshops</span></>}
        description="Stay updated with our latest events — from inter-college competitions to expert-led workshops and industry conferences."
      />

      <SectionWrapper>
        {/* Filters */}
        <div className="flex items-center justify-center gap-2 mb-10 sm:mb-14 flex-wrap">
          {(["all", "upcoming", "ongoing", "completed"] as FilterType[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 sm:py-2 rounded-full text-sm font-medium transition-all duration-200 filter-pill capitalize min-h-[44px] sm:min-h-0 ${
                  filter === f ? "filter-pill-active" : ""
                }`}
              >
                {f}
              </button>
            )
          )}
        </div>

        {/* Events Grid — always render ALL events, toggle visibility via CSS.
            This prevents unmount/remount when filter changes, so entrance
            animations never replay after the initial stagger. */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {events.map((event) => {
            const isVisible = filter === "all" || event.status === filter;
            return (
              <motion.div
                key={event.title}
                variants={fadeUp}
                className={`group glass-card rounded-2xl p-5 sm:p-7 transition-all duration-[250ms] ease-out hover:-translate-y-1 ${
                  !isVisible ? "hidden" : ""
                }`}
              >
                {event.imageURL && (
                  <div className="mb-4 -mx-5 sm:-mx-7 -mt-5 sm:-mt-7 overflow-hidden rounded-t-2xl">
                    <img
                      src={event.imageURL}
                      alt={event.title}
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{event.date}</span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium rounded-full border ${
                      statusColors[event.status]
                    } ${event.status === "ongoing" ? "animate-pulse" : ""}`}
                  >
                    {statusLabels[event.status] || event.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-3.5 h-3.5 text-teal-light/70" />
                  <span className="text-xs font-medium text-teal-light/80">
                    {event.type}
                  </span>
                </div>

                <h3 className="font-heading font-semibold text-[17px] text-foreground mb-2 tracking-[-0.01em]">
                  {event.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {event.description}
                </p>

                {(event.venue || event.time) && (
                  <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-1.5">
                    {event.venue && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="text-xs">{event.venue}</span>
                      </div>
                    )}
                    {event.time && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span className="text-xs">{event.time}</span>
                      </div>
                    )}
                  </div>
                )}

                {event.status === "completed" ? (
                  <div className="mt-4 px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground/60 bg-white/[0.02] border border-white/[0.04] inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                    Event Completed
                  </div>
                ) : event.registrationLink ? (
                  <a
                    href={event.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg text-xs font-semibold btn-primary"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Register Now
                  </a>
                ) : event.status === "upcoming" || event.status === "ongoing" ? (
                  <div className="mt-4 px-4 py-2 rounded-lg text-xs font-medium text-gold/60 bg-gold/[0.04] border border-gold/[0.08] inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/40" />
                    Registration Link Coming Soon
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </motion.div>

        {events.filter((e) => filter === "all" || e.status === filter)
          .length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              No events found for this filter.
            </p>
          </div>
        )}
      </SectionWrapper>

      <JoinCTA />
    </>
  );
}
