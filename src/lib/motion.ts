import type { Variants } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════
 * FinFoundry — Motion Architecture Tokens v3.0
 *
 * Single source of truth for all animation values.
 * SOP §10.1 — No hardcoded durations or easings in components.
 *
 * Easing governance (2 curves only):
 *   structural — cubic-bezier(0.16, 1, 0.3, 1) — content entries, reveals
 *   micro      — cubic-bezier(0.4, 0, 0.2, 1)  — hover, navbar, dropdowns
 *
 * Duration scale:
 *   XS (120ms) · S (200ms) · M (400ms) · L (600ms) · XL (800ms)
 *
 * Nothing else. No spring. No bounce. No elastic. No back.
 * ═══════════════════════════════════════════════════════════════════ */

// ── Governed easing curves ───────────────────────────────────────────
// Two curves. No exceptions. Every animation must use one of these.
export const ease = {
  structural: [0.16, 1, 0.3, 1] as const,  // content entries, scroll reveals, headings, startup
  micro: [0.4, 0, 0.2, 1] as const,        // hover, navbar morph, dropdowns, focus
} as const;

// ── Duration scale ──────────────────────────────────────────────────
export const duration = {
  xs: 0.12,   // focus rings, color shifts, icon states
  s: 0.2,     // hover scale, dropdown toggle, active press
  m: 0.4,     // scroll reveals, section entries, fade-ups
  l: 0.6,     // heading reveals, depth lifts, deliberate motion
  xl: 0.8,    // hero entry, startup sequence stages
} as const;

// ── Stagger tokens ───────────────────────────────────────────────────
export const staggerGap = {
  tight: 0.04,     // nav links, small inline groups
  normal: 0.06,    // card grids, section children
  relaxed: 0.08,   // hero elements, high-ceremony sequences
} as const;


/* ═══════════════════════════════════════════════════════════════════
 * REVEAL VARIANTS — Scroll-triggered content entries
 *
 * "Depth Lift" — primary heading system
 * Text rises from overflow-hidden mask with opacity build.
 * No blur filter on reveals. No character animation.
 * Pure transform + opacity (GPU-composited, 60fps).
 * ═══════════════════════════════════════════════════════════════════ */

// Major headings — Depth Lift (rise from overflow mask)
export const depthLift: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.l,
      ease: ease.structural,
    },
  },
};

// Body text, descriptions — standard fade + rise
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.m, ease: ease.structural },
  },
};

// Badges, small elements — micro fade + rise
export const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.m, ease: ease.structural },
  },
};

// Pure opacity fade (no translate)
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.m, ease: ease.micro },
  },
};

// Scale reveal — reserved for CTA panel only
export const scaleReveal: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: duration.l, ease: ease.structural },
  },
};

// Scale up — general purpose subtle scale entry
export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.m, ease: ease.structural },
  },
};

// Perspective rise — reserved for stats cards only
export const perspectiveRise: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    rotateX: 3,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: duration.m,
      ease: ease.structural,
    },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.l, ease: ease.structural },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.l, ease: ease.structural },
  },
};

// ── Stagger orchestrators ────────────────────────────────────────────
export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerGap.normal,
      delayChildren: 0.06,
    },
  },
};

export const staggerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerGap.relaxed,
      delayChildren: 0.1,
    },
  },
};

export const staggerTight: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerGap.tight,
      delayChildren: 0.04,
    },
  },
};

// Stats perspective stagger
export const staggerPerspective: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerGap.normal,
      delayChildren: 0.08,
    },
  },
};

// ── Dropdown / overlay ───────────────────────────────────────────────
// Material elevation: scale + translateY. No blur filter.
export const dropdownReveal: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.97,
    y: 6,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: duration.s,
      ease: ease.micro,
    },
  },
  exit: {
    opacity: 0,
    y: 4,
    transition: {
      duration: duration.xs,
      ease: ease.micro,
    },
  },
};

// ── Viewport configs ─────────────────────────────────────────────────
// Never define viewport inline. Use these tokens.
export const viewport = { once: true, amount: 0.2 } as const;
export const viewportHeading = { once: true, amount: 0.3 } as const;
export const viewportCard = { once: true, amount: 0.15 } as const;
export const viewportFull = { once: true, amount: 0.25 } as const;
