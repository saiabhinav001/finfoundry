"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/lib/onboarding-context";
import { ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
 * TourOverlay — Interactive spotlight walkthrough engine.
 *
 * Renders a full-screen overlay with a "cutout" spotlight around
 * the current target element (matched via data-tour="<id>").
 * A floating tooltip shows step info + navigation.
 *
 * Uses the CSS box-shadow technique for the spotlight hole:
 * a positioned div at the target's bounds with transparent bg
 * and a massive box-shadow that covers everything else.
 *
 * Smooth transitions between steps via Framer Motion.
 * Keyboard accessible: Escape to skip, Arrow keys to navigate.
 * ═══════════════════════════════════════════════════════════════ */

const EASE = [0.4, 0, 0.2, 1] as const;
const SPOTLIGHT_PADDING = 10; // px around the target element
const TOOLTIP_GAP = 16; // px between spotlight and tooltip

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TourOverlay() {
  const {
    tourActive,
    tourSteps,
    currentStepIndex,
    nextStep,
    prevStep,
    skipTour,
  } = useOnboarding();

  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const step = tourSteps[currentStepIndex];

  // ─── Measure the target element whenever step changes ────
  const measureTarget = useCallback(() => {
    if (!step) return;

    const el = document.querySelector<HTMLElement>(
      `[data-tour="${step.targetId}"]`
    );
    if (!el) {
      // Target not found — maybe on different page. Skip to next.
      setTargetRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, [step]);

  useEffect(() => {
    if (!tourActive) return;
    measureTarget();

    // Re-measure on resize and scroll
    const onResize = () => measureTarget();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [tourActive, currentStepIndex, measureTarget]);

  // ─── Position the tooltip after measuring target ─────────
  useEffect(() => {
    if (!targetRect || !step || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spotlightRight =
      targetRect.left + targetRect.width + SPOTLIGHT_PADDING * 2;
    const spotlightBottom =
      targetRect.top + targetRect.height + SPOTLIGHT_PADDING * 2;

    let top = 0;
    let left = 0;

    switch (step.placement) {
      case "right":
        left = spotlightRight + TOOLTIP_GAP;
        top = targetRect.top + targetRect.height / 2 - th / 2;
        // Fallback: if tooltip goes off-right, place below
        if (left + tw > vw - 16) {
          left = Math.max(16, targetRect.left - SPOTLIGHT_PADDING);
          top = spotlightBottom + TOOLTIP_GAP;
        }
        break;
      case "left":
        left = targetRect.left - SPOTLIGHT_PADDING - tw - TOOLTIP_GAP;
        top = targetRect.top + targetRect.height / 2 - th / 2;
        if (left < 16) {
          left = spotlightRight + TOOLTIP_GAP;
          top = targetRect.top + targetRect.height / 2 - th / 2;
        }
        break;
      case "bottom":
        top = spotlightBottom + TOOLTIP_GAP;
        left = targetRect.left + targetRect.width / 2 - tw / 2;
        break;
      case "top":
        top = targetRect.top - SPOTLIGHT_PADDING - th - TOOLTIP_GAP;
        left = targetRect.left + targetRect.width / 2 - tw / 2;
        break;
    }

    // Clamp within viewport
    top = Math.max(16, Math.min(top, vh - th - 16));
    left = Math.max(16, Math.min(left, vw - tw - 16));

    setTooltipPos({ top, left });
  }, [targetRect, step, currentStepIndex]);

  // ─── Keyboard navigation ─────────────────────────────────
  useEffect(() => {
    if (!tourActive) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") skipTour();
      if (e.key === "ArrowRight" || e.key === "Enter") nextStep();
      if (e.key === "ArrowLeft") prevStep();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tourActive, skipTour, nextStep, prevStep]);

  if (!tourActive || !step) return null;

  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === tourSteps.length - 1;
  const progress = ((currentStepIndex + 1) / tourSteps.length) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990]" aria-modal="true" role="dialog">
        {/* ── Dark overlay — click to advance ────────────── */}
        <motion.div
          className="absolute inset-0 bg-[#050816]/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={nextStep}
        />

        {/* ── Spotlight cutout ───────────────────────────── */}
        {targetRect && (
          <motion.div
            className="absolute rounded-xl pointer-events-none z-[1]"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              top: targetRect.top - SPOTLIGHT_PADDING,
              left: targetRect.left - SPOTLIGHT_PADDING,
              width: targetRect.width + SPOTLIGHT_PADDING * 2,
              height: targetRect.height + SPOTLIGHT_PADDING * 2,
            }}
            transition={{ duration: 0.4, ease: EASE }}
            style={{
              boxShadow: "0 0 0 9999px rgba(5, 8, 22, 0.80)",
            }}
          >
            {/* Subtle glow ring around spotlight */}
            <div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                boxShadow:
                  "0 0 0 2px rgba(16,185,129,0.25), 0 0 20px 4px rgba(16,185,129,0.08)",
              }}
            />
          </motion.div>
        )}

        {/* ── Tooltip ────────────────────────────────────── */}
        <motion.div
          ref={tooltipRef}
          className="absolute z-[2] w-[320px] max-w-[calc(100vw-32px)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: 1,
            y: 0,
            top: tooltipPos.top,
            left: tooltipPos.left,
          }}
          transition={{ duration: 0.35, ease: EASE }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-[#0e1225] border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
            {/* Progress bar */}
            <div className="h-1 bg-white/[0.04]">
              <motion.div
                className="h-full bg-gradient-to-r from-teal to-teal-light"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: EASE }}
              />
            </div>

            <div className="p-5">
              {/* Step counter */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-light" />
                  <span className="text-xs font-semibold text-teal-light/80 tracking-wider uppercase">
                    Step {currentStepIndex + 1} of {tourSteps.length}
                  </span>
                </div>
                <button
                  onClick={skipTour}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all"
                  aria-label="Skip tour"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step content */}
              <h3 className="font-heading font-bold text-base text-foreground mb-1.5">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {step.description}
              </p>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={prevStep}
                  disabled={isFirst}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                    isFirst
                      ? "text-muted-foreground/30 cursor-not-allowed"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>

                <div className="flex items-center gap-3">
                  {!isLast && (
                    <button
                      onClick={skipTour}
                      className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                    >
                      Skip tour
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-teal text-white hover:bg-teal-light transition-all duration-200 shadow-[0_1px_4px_rgba(16,185,129,0.3)]"
                  >
                    {isLast ? "Finish" : "Next"}
                    {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Keyboard hint */}
            <div className="hidden sm:flex items-center justify-center gap-3 px-5 py-2.5 border-t border-white/[0.04] bg-white/[0.02]">
              <span className="text-[10px] text-muted-foreground/40">
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-muted-foreground/60 font-mono text-[10px]">←</kbd>
                {" "}
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-muted-foreground/60 font-mono text-[10px]">→</kbd>
                {" "}to navigate
              </span>
              <span className="text-[10px] text-muted-foreground/40">
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-muted-foreground/60 font-mono text-[10px]">Esc</kbd>
                {" "}to skip
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
