import type { Metadata } from "next";
import { EventsPage } from "./events-page";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Explore upcoming competitions, workshops, guest lectures, and conferences at CBIT FinFoundry.",
};

export default function Page() {
  return <EventsPage />;
}
