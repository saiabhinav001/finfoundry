"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Premium smooth scroll — Lenis-powered momentum scrolling.
 *
 * - Silky inertia-based scroll with customisable lerp (smoothness)
 * - Scroll-to-top on route change
 * - Hash-based anchor navigation
 * - Only active on public (non-admin) routes so admin forms stay native
 * - Exposes the lenis instance on `window.__lenis` for debugging
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number>(0);
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/login");

  // ── Lenis lifecycle ────────────────────────────────────────────────
  useEffect(() => {
    if (isAdmin) return; // keep native scroll for admin pages

    const lenis = new Lenis({
      lerp: 0.12,            // responsive yet smooth (higher = snappier)
      duration: 1.0,         // base duration for scrollTo calls
      smoothWheel: true,     // smooth mouse-wheel scrolling
      wheelMultiplier: 1,    // normal wheel speed
      touchMultiplier: 1.5,  // natural feel on trackpad / touch
      infinite: false,
    });

    lenisRef.current = lenis;

    // expose for DevTools: `window.__lenis.scrollTo(0)`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__lenis = lenis;

    // RAF loop — store latest frame ID for proper cleanup
    function raf(time: number) {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    }
    rafIdRef.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      lenis.destroy();
      lenisRef.current = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__lenis;
    };
  }, [isAdmin]);

  // ── Scroll-to-top on route change ──────────────────────────────────
  useEffect(() => {
    // If there's a hash, scroll to that element
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) {
        setTimeout(() => {
          if (lenisRef.current) {
            lenisRef.current.scrollTo(el as HTMLElement, { offset: -80, duration: 1.2 });
          } else {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
        return;
      }
    }

    // Scroll to top
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 0 }); // instant on navigation
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname]);

  // ── Anchor link handler (#section) ─────────────────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const el = document.querySelector(href);
      if (el) {
        e.preventDefault();
        if (lenisRef.current) {
          lenisRef.current.scrollTo(el as HTMLElement, { offset: -80, duration: 1.2 });
        } else {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        window.history.pushState(null, "", href);
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return <>{children}</>;
}
