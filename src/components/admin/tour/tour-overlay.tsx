"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/lib/onboarding-context";
import { ChevronLeft, ChevronRight, X, Sparkles, Rocket } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
 * TourOverlay — $10M-grade spotlight walkthrough.
 *
 * Zero blur. Sharp spotlight. Gradient-border tooltip.
 * Feels like Linear / Vercel / Stripe onboarding.
 * ═══════════════════════════════════════════════════════════════ */

const SPRING = { type: "spring", stiffness: 260, damping: 28, mass: 0.7 } as const;
const SPOTLIGHT_PAD = 10;
const TOOLTIP_GAP = 20;

interface Rect { top: number; left: number; width: number; height: number; }

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const c = () => setM(window.innerWidth < 1024);
    c();
    window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, []);
  return m;
}

/* ── Confetti for the final step ─────────────────────────── */
function Confetti() {
  const ps = useMemo(
    () => Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      dur: 1.8 + Math.random() * 1.2,
      size: 3 + Math.random() * 5,
      color: ["#10B981", "#F5C542", "#3B82F6", "#EC4899", "#8B5CF6", "#F97316"][i % 6],
      rot: Math.random() * 720 - 360,
      drift: (Math.random() - 0.5) * 80,
    })),
    []
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
      {ps.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size, backgroundColor: p.color, left: `${p.x}%`, top: "-4px" }}
          initial={{ y: -10, opacity: 0, rotate: 0 }}
          animate={{ y: [0, 250], opacity: [0, 1, 1, 0], rotate: [0, p.rot], x: [0, p.drift] }}
          transition={{ duration: p.dur, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function TourOverlay() {
  const { tourActive, tourSteps, currentStepIndex, nextStep, prevStep, skipTour } = useOnboarding();
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [centered, setCentered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const step = tourSteps[currentStepIndex];

  /* ── Measure target ────────────────────────────────────── */
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const measureTarget = useCallback(() => {
    if (!step) return;
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.targetId}"]`);
    if (!el) { setTargetRect(null); setCentered(true); return; }

    // Check if element is clipped by a scrollable ancestor (e.g. sidebar overflow-y-auto)
    const isClippedByParent = (element: HTMLElement): boolean => {
      let parent = element.parentElement;
      while (parent) {
        const style = getComputedStyle(parent);
        const overflow = style.overflowY;
        if (overflow === "auto" || overflow === "scroll" || overflow === "hidden") {
          const pr = parent.getBoundingClientRect();
          const er = element.getBoundingClientRect();
          if (er.top < pr.top || er.bottom > pr.bottom) return true;
        }
        parent = parent.parentElement;
      }
      return false;
    };

    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || r.right < 0 || r.bottom < 0 || r.left > window.innerWidth || r.top > window.innerHeight) {
      setTargetRect(null); setCentered(true); return;
    }

    // Scroll into view if: off-screen, near edge (within 120px), or clipped by scrollable parent
    const EDGE_BUFFER = 120;
    const needsScroll =
      r.top < EDGE_BUFFER ||
      r.bottom > window.innerHeight - EDGE_BUFFER ||
      isClippedByParent(el);

    if (needsScroll) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Wait for smooth scroll to finish (~400ms), then re-measure
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        const f = el.getBoundingClientRect();
        setTargetRect({ top: f.top, left: f.left, width: f.width, height: f.height });
      }, 400);
    } else {
      setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }
    setCentered(false);
  }, [step]);

  useEffect(() => {
    if (!tourActive) return;
    measureTarget();
    const h = () => measureTarget();
    window.addEventListener("resize", h);
    window.addEventListener("scroll", h, true);
    return () => {
      window.removeEventListener("resize", h);
      window.removeEventListener("scroll", h, true);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, [tourActive, currentStepIndex, measureTarget]);

  /* ── Position tooltip ──────────────────────────────────── */
  useEffect(() => {
    if (!step || !tooltipRef.current) return;
    const tt = tooltipRef.current;
    const tw = tt.offsetWidth, th = tt.offsetHeight;
    const vw = window.innerWidth, vh = window.innerHeight;

    if (centered || !targetRect) {
      setTooltipPos({ top: Math.max(16, (vh - th) / 2), left: Math.max(16, (vw - tw) / 2) });
      return;
    }

    const sR = targetRect.left + targetRect.width + SPOTLIGHT_PAD * 2;
    const sB = targetRect.top + targetRect.height + SPOTLIGHT_PAD * 2;
    let top = 0, left = 0;
    const pl = isMobile ? "bottom" : step.placement;

    switch (pl) {
      case "right":
        left = sR + TOOLTIP_GAP; top = targetRect.top + targetRect.height / 2 - th / 2;
        if (left + tw > vw - 16) { left = Math.max(16, targetRect.left - SPOTLIGHT_PAD); top = sB + TOOLTIP_GAP; }
        break;
      case "left":
        left = targetRect.left - SPOTLIGHT_PAD - tw - TOOLTIP_GAP; top = targetRect.top + targetRect.height / 2 - th / 2;
        if (left < 16) left = sR + TOOLTIP_GAP;
        break;
      case "bottom":
        top = sB + TOOLTIP_GAP; left = targetRect.left + targetRect.width / 2 - tw / 2;
        break;
      case "top":
        top = targetRect.top - SPOTLIGHT_PAD - th - TOOLTIP_GAP; left = targetRect.left + targetRect.width / 2 - tw / 2;
        break;
    }
    setTooltipPos({ top: Math.max(16, Math.min(top, vh - th - 16)), left: Math.max(16, Math.min(left, vw - tw - 16)) });
  }, [targetRect, step, currentStepIndex, centered, isMobile]);

  /* ── Keyboard ──────────────────────────────────────────── */
  useEffect(() => {
    if (!tourActive) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") skipTour();
      if (e.key === "ArrowRight" || e.key === "Enter") nextStep();
      if (e.key === "ArrowLeft") prevStep();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [tourActive, skipTour, nextStep, prevStep]);

  if (!tourActive || !step) return null;

  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === tourSteps.length - 1;
  const showSpot = targetRect && !centered;
  const progress = ((currentStepIndex + 1) / tourSteps.length) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990]" aria-modal="true" role="dialog">

        {/* ── Overlay — NO blur, just dark ────────────────── */}
        <motion.div
          className="absolute inset-0 bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={nextStep}
        />

        {/* ── Spotlight ──────────────────────────────────── */}
        {showSpot && (
          <>
            <motion.div
              className="absolute rounded-xl pointer-events-none z-[1]"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                top: targetRect.top - SPOTLIGHT_PAD,
                left: targetRect.left - SPOTLIGHT_PAD,
                width: targetRect.width + SPOTLIGHT_PAD * 2,
                height: targetRect.height + SPOTLIGHT_PAD * 2,
              }}
              transition={SPRING}
              style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.70)" }}
            >
              {/* Sharp teal ring */}
              <div className="absolute inset-0 rounded-xl" style={{ boxShadow: "inset 0 0 0 2px rgba(16,185,129,0.35), 0 0 30px 6px rgba(16,185,129,0.12), 0 0 60px 12px rgba(16,185,129,0.04)" }} />
            </motion.div>

            {/* Breathing ring */}
            <motion.div
              className="absolute rounded-xl pointer-events-none z-[1]"
              animate={{
                top: targetRect.top - SPOTLIGHT_PAD - 5,
                left: targetRect.left - SPOTLIGHT_PAD - 5,
                width: targetRect.width + SPOTLIGHT_PAD * 2 + 10,
                height: targetRect.height + SPOTLIGHT_PAD * 2 + 10,
                opacity: [0, 0.5, 0],
              }}
              transition={{
                opacity: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                top: SPRING, left: SPRING, width: SPRING, height: SPRING,
              }}
              style={{ border: "1.5px solid rgba(16,185,129,0.3)" }}
            />
          </>
        )}

        {/* ── Tooltip card ───────────────────────────────── */}
        <motion.div
          ref={tooltipRef}
          className={centered ? "absolute z-[2] w-[min(400px,calc(100vw-32px))]" : "absolute z-[2] w-[min(360px,calc(100vw-32px))]"}
          initial={{ opacity: 0, y: 20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1, top: tooltipPos.top, left: tooltipPos.left }}
          transition={SPRING}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient border wrapper */}
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-teal/40 via-white/[0.08] to-white/[0.03]">
            {/* Outer glow */}
            <div className="absolute -inset-1 rounded-[18px] bg-teal/[0.06] blur-xl pointer-events-none" />

            {/* Card body — solid dark, NO blur */}
            <div className="relative rounded-2xl bg-[#0a0e1f] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.7)] overflow-hidden">
              {/* Top accent line */}
              <div className="h-[2px] bg-gradient-to-r from-transparent via-teal/60 to-transparent" />

              {/* Progress bar */}
              <div className="mx-4 mt-3 sm:mx-5 sm:mt-4 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-teal via-teal-light to-emerald-400"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>

              <div className="px-4 pt-3.5 pb-4 sm:px-6 sm:pt-5 sm:pb-6">
                {/* Header — step counter + close */}
                <motion.div
                  key={`h-${currentStepIndex}`}
                  className="flex items-center justify-between mb-3 sm:mb-4"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Step number badge */}
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-teal/[0.12] border border-teal/[0.15]">
                      <span className="text-xs font-bold text-teal-light tabular-nums">{currentStepIndex + 1}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white/50 tabular-nums">of {tourSteps.length}</span>
                      <span className="text-[10px] text-white/20">•</span>
                      <span className="text-[10px] font-medium text-teal-light/60 uppercase tracking-widest">Tour</span>
                    </div>
                  </div>
                  <button
                    onClick={skipTour}
                    className="flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:w-7 sm:h-7 -mr-1.5 sm:mr-0 rounded-lg text-white/25 hover:text-white/70 hover:bg-white/[0.06] transition-all duration-200"
                    aria-label="Close tour"
                  >
                    <X className="w-5 h-5 sm:w-4 sm:h-4" />
                  </button>
                </motion.div>

                {/* Title + description — staggered entrance */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`c-${currentStepIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-heading font-bold text-base sm:text-lg text-white leading-tight mb-2">
                      {isLast && <Rocket className="inline w-[18px] h-[18px] text-gold -mt-0.5 mr-1.5" />}
                      {!isLast && currentStepIndex === 0 && <Sparkles className="inline w-4 h-4 text-teal-light -mt-0.5 mr-1.5" />}
                      {step.title}
                    </h3>
                    <p className="text-[13px] sm:text-sm text-white/45 leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-5 sm:mt-6">
                  <button
                    onClick={prevStep}
                    disabled={isFirst}
                    className={`inline-flex items-center gap-1 px-3 py-2.5 sm:py-2 text-xs font-medium rounded-lg min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 transition-all duration-200 ${
                      isFirst
                        ? "text-white/10 cursor-not-allowed"
                        : "text-white/40 hover:text-white/80 hover:bg-white/[0.05]"
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back
                  </button>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {!isLast && (
                      <button
                        onClick={skipTour}
                        className="text-xs text-white/25 hover:text-white/50 transition-colors duration-200 px-2 py-3 sm:py-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                      >
                        Skip
                      </button>
                    )}
                    <button
                      onClick={nextStep}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg min-h-[44px] sm:min-h-0 transition-all duration-200 ${
                        isLast
                          ? "px-6 py-2.5 bg-gradient-to-r from-teal to-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.45)] hover:scale-[1.03] active:scale-[0.98]"
                          : "px-5 py-2.5 bg-teal text-white shadow-[0_2px_10px_rgba(16,185,129,0.2)] hover:bg-teal-light hover:shadow-[0_4px_16px_rgba(16,185,129,0.3)] active:scale-[0.97]"
                      }`}
                    >
                      {isLast ? "Let's Go!" : "Next"}
                      {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Keyboard hints — desktop */}
              <div className="hidden sm:flex items-center justify-center gap-4 px-5 py-2.5 border-t border-white/[0.04]">
                <span className="text-[10px] text-white/15">
                  <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono text-white/30 bg-white/[0.04] border border-white/[0.06]">←</kbd>
                  {" "}
                  <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono text-white/30 bg-white/[0.04] border border-white/[0.06]">→</kbd>
                  {" "}navigate
                </span>
                <span className="text-[10px] text-white/15">
                  <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono text-white/30 bg-white/[0.04] border border-white/[0.06]">Esc</kbd>
                  {" "}skip
                </span>
              </div>

              {isLast && <Confetti />}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
