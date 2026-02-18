import type { Metadata } from "next";
import { TeamPage } from "./team-page";

export const metadata: Metadata = {
  title: "Team",
  description:
    "Meet the CBIT FinFoundry team for the 2025-2026 term. Student leaders driving financial literacy.",
};

export default function Page() {
  return <TeamPage />;
}
