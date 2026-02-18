import type { Metadata } from "next";
import { ContactPage } from "./contact-page";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with CBIT FinFoundry. Join the club, collaborate, or invite us to events.",
};

export default function Page() {
  return <ContactPage />;
}
