"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/* ─────────────────────────────────────────────────────────────
 * EntranceContext — Orchestrates the brand reveal sequence.
 *
 * Timeline v3.0 (homepage only, first visit per session):
 *  0.00s – Phase 0 VOID: Deep navy void, vignette, silence
 *  0.30s – Phase 1 SWEEP: Emerald light beam L→R, CSS mask reveal
 *  1.10s – Phase 2 STABILIZE: Logo micro-scale 0.985→1, depth
 *  1.60s – Phase 3 PULSE: Single glow expand + fade
 *  1.90s – Phase 4 MORPH: Scale down toward navbar origin
 *  2.20s – navReady: Navbar renders at final position
 *  2.40s – Phase 5 REVEAL: heroReady fires, overlay dissolves
 *  2.90s – Overlay removed from DOM
 *
 * Respects prefers-reduced-motion: skips to instant reveal.
 * Only plays once per session (sessionStorage flag).
 * Only plays on the homepage ("/").
 * ─────────────────────────────────────────────────────────── */

interface EntranceState {
  heroReady: boolean;
  navReady: boolean;
  isPlaying: boolean;
  markHeroReady: () => void;
  markNavReady: () => void;
  shouldPlay: boolean;
}

const EntranceContext = createContext<EntranceState>({
  heroReady: true,
  navReady: true,
  isPlaying: false,
  markHeroReady: () => {},
  markNavReady: () => {},
  shouldPlay: false,
});

export function useEntrance() {
  return useContext(EntranceContext);
}

const SESSION_KEY = "ff_entrance_played";

export function EntranceProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [heroReady, setHeroReady] = useState(false);
  const [navReady, setNavReady] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const isHome = pathname === "/";
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadyPlayed = sessionStorage.getItem(SESSION_KEY) === "1";

    if (isHome && !prefersReduced && !alreadyPlayed) {
      setShouldPlay(true);
      setIsPlaying(true);
      sessionStorage.setItem(SESSION_KEY, "1");
    } else {
      // Skip entrance — everything ready immediately
      setHeroReady(true);
      setNavReady(true);
      setShouldPlay(false);
    }
    setChecked(true);
  }, [pathname]);

  const markHeroReady = useCallback(() => {
    setHeroReady(true);
    setIsPlaying(false);
  }, []);

  const markNavReady = useCallback(() => {
    setNavReady(true);
  }, []);

  // Don't render children until we've determined whether to play
  // This prevents a flash of hero content before entrance starts
  if (!checked) {
    return (
      <EntranceContext.Provider value={{ heroReady: false, navReady: false, isPlaying: true, markHeroReady, markNavReady, shouldPlay: false }}>
        <div style={{ visibility: "hidden" }}>{children}</div>
      </EntranceContext.Provider>
    );
  }

  return (
    <EntranceContext.Provider value={{ heroReady, navReady, isPlaying, markHeroReady, markNavReady, shouldPlay }}>
      {children}
    </EntranceContext.Provider>
  );
}
