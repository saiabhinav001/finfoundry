import type { Variants } from "framer-motion";

// ── Premium easing curves ────────────────────────────────────────────
// Custom cubic-bezier curves for a Fortune 500-grade soothing feel.
const ease = [0.25, 0.1, 0.25, 1.0] as const;        // smooth deceleration
const easeOut = [0.16, 1, 0.3, 1] as const;           // Apple-style ease-out

// ── Reveal variants ──────────────────────────────────────────────────
// Every animated element must use these — no inline initial/whileInView/transition.

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

export const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: ease },
  },
};

export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

// ── Stagger orchestrators ────────────────────────────────────────────
export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

// Single viewport config used everywhere. Never define viewport inline.
export const viewport = { once: true, amount: 0.2 } as const;
