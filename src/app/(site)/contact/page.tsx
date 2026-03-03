import type { Metadata } from "next";
import { ContactPage } from "./contact-page";
import { breadcrumbJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with CBIT FinFoundry. Join the club, collaborate, or invite us to events.",
};

const jsonLd = breadcrumbJsonLd([{ name: "Contact", path: "/contact" }]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ContactPage />
    </>
  );
}
