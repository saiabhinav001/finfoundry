import { HeroSection } from "@/components/sections/hero";
import { StatsSection } from "@/components/sections/stats";
import { AboutPreview } from "@/components/sections/about-preview";
import { ProgramsPreview } from "@/components/sections/programs-preview";
import { EventsPreview } from "@/components/sections/events-preview";
import { JoinCTA } from "@/components/sections/join-cta";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <AboutPreview />
      <ProgramsPreview />
      <EventsPreview />
      <JoinCTA />
    </>
  );
}
