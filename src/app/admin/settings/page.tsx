import type { Metadata } from "next";
import { SettingsPage } from "./settings-page";

export const metadata: Metadata = {
  title: "Settings — Admin",
};

export default function Page() {
  return <SettingsPage />;
}
