import type { Metadata } from "next";
import { ResourcesPage } from "./resources-page";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Curated books, courses, and tools recommended by CBIT FinFoundry for mastering financial literacy.",
};

export default function Page() {
  return <ResourcesPage />;
}
