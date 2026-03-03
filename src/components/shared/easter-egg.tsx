"use client";

import { useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";

/* ═══════════════════════════════════════════════════════════════════
 * EasterEgg v2.0 — Konami Code hidden interaction
 *
 * Listens for the classic Konami Code sequence:
 *   ↑ ↑ ↓ ↓ ← → ← → B A
 *
 * On successful input, fires a gold + emerald confetti burst
 * using canvas-confetti (lightweight, tree-shaken), plus shows
 * a brief on-screen toast so the user knows it worked.
 *
 * v2.0: Uses refs for keystroke tracking + shows visual toast.
 * Prevents default arrow-key scrolling mid-sequence.
 * ═══════════════════════════════════════════════════════════════════ */

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const KONAMI_STR = KONAMI_SEQUENCE.join(",");

/** Set of keys that are part of the Konami code to prevent default scroll */
const KONAMI_KEYS = new Set(KONAMI_SEQUENCE);

function showToast() {
  const el = document.createElement("div");
  el.textContent = "🎉 Konami Code Activated!";
  Object.assign(el.style, {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "linear-gradient(135deg, #10B981, #059669)",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "14px",
    zIndex: "100000",
    boxShadow: "0 8px 32px rgba(16,185,129,0.4)",
    transition: "opacity 0.5s, transform 0.5s",
    opacity: "0",
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = "1";
    el.style.transform = "translateX(-50%) translateY(-8px)";
  });
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateX(-50%) translateY(8px)";
    setTimeout(() => el.remove(), 500);
  }, 2500);
}

function fireConfetti() {
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 99999,
    disableForReducedMotion: true,
  };

  confetti({
    ...defaults,
    particleCount: 80,
    spread: 70,
    startVelocity: 45,
    colors: ["#10B981", "#34D399", "#059669"],
    angle: 60,
    origin: { x: 0.3, y: 0.7 },
  });

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 80,
      spread: 70,
      startVelocity: 45,
      colors: ["#F5C542", "#F7D56E", "#D4A82A"],
      angle: 120,
      origin: { x: 0.7, y: 0.7 },
    });
  }, 150);

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 50,
      spread: 100,
      startVelocity: 30,
      colors: ["#10B981", "#F5C542", "#ffffff"],
      origin: { x: 0.5, y: 0.6 },
    });
  }, 300);

  showToast();
}

export function EasterEgg() {
  const keysRef = useRef<string[]>([]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

    // Prevent arrow key scrolling when user is mid-sequence
    if (keysRef.current.length > 0 && KONAMI_KEYS.has(e.key)) {
      e.preventDefault();
    }

    const next = [...keysRef.current, key].slice(-10);
    keysRef.current = next;

    if (next.length === 10 && next.join(",") === KONAMI_STR) {
      keysRef.current = [];
      fireConfetti();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return null;
}
