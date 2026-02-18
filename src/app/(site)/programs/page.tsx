import type { Metadata } from "next";
import { ProgramsPage } from "./programs-page";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Explore FinFoundry's structured learning programs — from stock market fundamentals to advanced financial modeling and derivatives trading.",
};

export default function Page() {
  return <ProgramsPage />;
}
