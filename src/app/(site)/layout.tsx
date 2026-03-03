import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { EntranceProvider } from "@/lib/entrance-context";
import {
  ClientShell,
  ClientPageTransition,
} from "@/components/shared/client-shell";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EntranceProvider>
      <ClientShell>
        {/* Skip navigation link — WCAG 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-emerald-600 focus:text-white focus:text-sm focus:font-medium focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="min-h-screen">
          <ClientPageTransition>{children}</ClientPageTransition>
        </main>
        <Footer />
      </ClientShell>
    </EntranceProvider>
  );
}
