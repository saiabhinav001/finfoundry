import type { Metadata } from "next";
import { AboutPage } from "./about-page";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about CBIT FinFoundry — the premier financial literacy club at Chaitanya Bharathi Institute of Technology, Hyderabad.",
};

export default function Page() {
  return <AboutPage />;
}
