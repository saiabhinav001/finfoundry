import type { Metadata } from "next";
import { ProgramsPage } from "./programs-page";
import { breadcrumbJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Explore FinFoundry's structured learning programs — from stock market fundamentals to advanced financial modeling and derivatives trading.",
};

const jsonLd = breadcrumbJsonLd([{ name: "Programs", path: "/programs" }]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProgramsPage />
    </>
  );
}
