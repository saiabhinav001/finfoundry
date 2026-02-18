import type { Metadata } from "next";
import { AboutAdminPage } from "./about-admin-page";

export const metadata: Metadata = {
  title: "About Page — Admin",
};

export default function Page() {
  return <AboutAdminPage />;
}
