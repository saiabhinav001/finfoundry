import type { Metadata } from "next";
import { TeamPage } from "./team-page";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { getTeamMembers } from "@/lib/db";

export const metadata: Metadata = {
  title: "Team",
  description:
    "Meet the CBIT FinFoundry team for the 2025-2026 term. Student leaders driving financial literacy.",
};

const jsonLd = breadcrumbJsonLd([{ name: "Team", path: "/team" }]);

export default async function Page() {
  const members = await getTeamMembers().catch(() => []);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TeamPage members={members} />
    </>
  );
}
