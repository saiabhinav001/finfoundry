import type { Metadata } from "next";
import { EventsPage } from "./events-page";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { getEvents } from "@/lib/db";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Explore upcoming competitions, workshops, guest lectures, and conferences at CBIT FinFoundry.",
};

const jsonLd = breadcrumbJsonLd([{ name: "Events", path: "/events" }]);

export default async function Page() {
  const events = await getEvents().catch(() => []);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <EventsPage events={events} />
    </>
  );
}
