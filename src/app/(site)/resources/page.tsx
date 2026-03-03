import type { Metadata } from "next";
import { ResourcesPage } from "./resources-page";
import { getResources } from "@/lib/db";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Curated books, courses, and tools recommended by CBIT FinFoundry for mastering financial literacy.",
};

export default async function Page() {
  const resources = await getResources().catch(() => []);
  return <ResourcesPage resources={resources} />;
}
