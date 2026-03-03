import { HeroSection } from "@/components/sections/hero";
import { StatsSection } from "@/components/sections/stats";
import { AboutPreview } from "@/components/sections/about-preview";
import { ProgramsPreview } from "@/components/sections/programs-preview";
import { EventsPreview } from "@/components/sections/events-preview";
import { JoinCTA } from "@/components/sections/join-cta";
import { getAboutData, getEvents, getPrograms } from "@/lib/db";
import { stats as fallbackStats } from "@/data/site-data";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CBIT FinFoundry",
  url: "https://cbitfinfoundry.vercel.app",
  description:
    "CBIT FinFoundry is the premier financial literacy club at Chaitanya Bharathi Institute of Technology, Hyderabad.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://cbitfinfoundry.vercel.app/?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default async function HomePage() {
  const [aboutData, events, programs] = await Promise.all([
    getAboutData().catch(() => null),
    getEvents().catch(() => []),
    getPrograms().catch(() => []),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HeroSection />
      <StatsSection stats={aboutData?.stats ?? fallbackStats} />
      <AboutPreview />
      <ProgramsPreview programs={programs.length > 0 ? programs : undefined} />
      <EventsPreview events={events.length > 0 ? events : undefined} />
      <JoinCTA />
    </>
  );
}
