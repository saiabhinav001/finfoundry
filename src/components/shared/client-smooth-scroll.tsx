"use client";

import dynamic from "next/dynamic";

/* Lenis smooth-scroll: heavy third-party lib, lazy-loaded with ssr:false */
const SmoothScroll = dynamic(
  () =>
    import("@/components/shared/smooth-scroll").then((m) => m.SmoothScroll),
  { ssr: false }
);

export function ClientSmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SmoothScroll>{children}</SmoothScroll>;
}
