import { HeroSection } from "@/components/sections/hero";
import { StatsSection } from "@/components/sections/stats";
import { AboutPreview } from "@/components/sections/about-preview";
import { ProgramsPreview } from "@/components/sections/programs-preview";
import { EventsPreview } from "@/components/sections/events-preview";
import { JoinCTA } from "@/components/sections/join-cta";

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

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HeroSection />
      <StatsSection />
      <AboutPreview />
      <ProgramsPreview />
      <EventsPreview />
      <JoinCTA />
    </>
  );
}
