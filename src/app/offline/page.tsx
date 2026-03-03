import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

/**
 * The real offline page is public/offline.html (self-contained, zero deps).
 * This Next.js route just redirects to home if someone navigates here while online.
 */
export default function Page() {
  redirect("/");
}
