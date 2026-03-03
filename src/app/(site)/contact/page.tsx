import type { Metadata } from "next";
import { ContactPage } from "./contact-page";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { getSettings } from "@/lib/db";
import { siteConfig } from "@/data/site-data";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with CBIT FinFoundry. Join the club, collaborate, or invite us to events.",
};

const jsonLd = breadcrumbJsonLd([{ name: "Contact", path: "/contact" }]);

export default async function Page() {
  const settings = await getSettings().catch(() => null);
  const links = {
    instagram: settings?.instagram || siteConfig.links.instagram,
    linkedin: settings?.linkedin || siteConfig.links.linkedin,
    email: settings?.email || siteConfig.links.email,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ContactPage links={links} />
    </>
  );
}
