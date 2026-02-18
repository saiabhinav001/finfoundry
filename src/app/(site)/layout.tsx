import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { EntranceProvider } from "@/lib/entrance-context";
import { BrandEntrance } from "@/components/shared/brand-entrance";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EntranceProvider>
      <BrandEntrance />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </EntranceProvider>
  );
}
