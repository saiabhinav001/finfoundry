"use client";

import dynamic from "next/dynamic";

/* ═══════════════════════════════════════════════════════════════════
 * ClientShell — Lazy-loads heavy UX-enhancement components
 *
 * Each component is dynamically imported with ssr:false to keep them
 * out of the critical SSR path. This reduces initial JS bundle size
 * and improves FCP/LCP/TTI scores.
 * ═══════════════════════════════════════════════════════════════════ */

const BrandEntrance = dynamic(
  () =>
    import("@/components/shared/brand-entrance").then(
      (m) => m.BrandEntrance
    ),
  { ssr: false }
);

const CustomCursor = dynamic(
  () =>
    import("@/components/shared/custom-cursor").then((m) => m.CustomCursor),
  { ssr: false }
);

const ScrollProgress = dynamic(
  () =>
    import("@/components/shared/scroll-progress").then(
      (m) => m.ScrollProgress
    ),
  { ssr: false }
);

const EasterEgg = dynamic(
  () => import("@/components/shared/easter-egg").then((m) => m.EasterEgg),
  { ssr: false }
);

const StockTicker = dynamic(
  () =>
    import("@/components/sections/stock-ticker").then((m) => m.StockTicker),
  { ssr: false }
);

const PageTransition = dynamic(
  () =>
    import("@/components/shared/page-transition").then(
      (m) => m.PageTransition
    ),
  { ssr: false }
);

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BrandEntrance />
      <CustomCursor />
      <ScrollProgress />
      <EasterEgg />
      <StockTicker />
      {children}
    </>
  );
}

export function ClientPageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
