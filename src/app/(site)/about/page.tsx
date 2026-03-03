import type { Metadata } from "next";
import { AboutPage } from "./about-page";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { getAboutData } from "@/lib/db";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about CBIT FinFoundry — the premier financial literacy club at Chaitanya Bharathi Institute of Technology, Hyderabad.",
};

const jsonLd = breadcrumbJsonLd([{ name: "About", path: "/about" }]);

export default async function Page() {
  const data = await getAboutData().catch(() => null);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AboutPage data={data} />
    </>
  );
}
