"use client";

import { useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";

/* ═══════════════════════════════════════════════════════════════════
 * EasterEgg v2.1 — Konami Code hidden interaction
 *
 * Listens for the classic Konami Code sequence:
 *   ↑ ↑ ↓ ↓ ← → ← → B A
 *
 * On successful input, fires a gold + emerald confetti burst
 * using canvas-confetti with a DEDICATED canvas element (not the
 * auto-created one — that gets trapped behind Next.js/Framer Motion
 * stacking contexts). Also shows a brief on-screen toast.
 *
 * v2.1: Dedicated canvas to fix z-index stacking issue.
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

/** Lazily create & cache a top-level confetti canvas */
let _confettiCannon: confetti.CreateTypes | null = null;
function getConfettiCannon(): confetti.CreateTypes {
  if (_confettiCannon) return _confettiCannon;

  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "2147483647", // max 32-bit int — above everything
  });
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  // Resize with viewport
  const onResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", onResize);

  _confettiCannon = confetti.create(canvas, { resize: false });
  return _confettiCannon;
}

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
    zIndex: "2147483647",
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
  const fire = getConfettiCannon();

  fire({
    particleCount: 100,
    spread: 80,
    startVelocity: 50,
    colors: ["#10B981", "#34D399", "#059669"],
    angle: 60,
    origin: { x: 0.2, y: 0.8 },
  });

  setTimeout(() => {
    fire({
      particleCount: 100,
      spread: 80,
      startVelocity: 50,
      colors: ["#F5C542", "#F7D56E", "#D4A82A"],
      angle: 120,
      origin: { x: 0.8, y: 0.8 },
    });
  }, 150);

  setTimeout(() => {
    fire({
      particleCount: 60,
      spread: 120,
      startVelocity: 35,
      colors: ["#10B981", "#F5C542", "#ffffff", "#34D399", "#F7D56E"],
      origin: { x: 0.5, y: 0.6 },
    });
  }, 350);

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
