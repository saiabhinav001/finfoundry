import type { Metadata } from "next";
import { ActivityPage } from "./activity-page";

export const metadata: Metadata = {
  title: "Activity Log — Admin",
};

export default function Page() {
  return <ActivityPage />;
}
