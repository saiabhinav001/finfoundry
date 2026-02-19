"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/lib/onboarding-context";
import { ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
 * TourOverlay — Responsive spotlight walkthrough engine.
 *
 * Desktop: spotlight cutout + positioned tooltip beside the target.
 * Mobile / target hidden: centered glassmorphic card (no spotlight).
 *
 * Adapts to every screen size:
 *  • Auto-detects hidden / off-screen targets (sidebar collapsed)
 *  • Scrolls target into view before measuring
 *  • Mobile-first typography sizes
 *  • Safe-area aware padding
 * ═══════════════════════════════════════════════════════════════ */

const EASE = [0.4, 0, 0.2, 1] as const;
const SPOTLIGHT_PADDING = 10;
const TOOLTIP_GAP = 16;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** True when viewport is below the lg breakpoint (sidebar hidden) */
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
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
  const [centered, setCentered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const step = tourSteps[currentStepIndex];

  // ─── Measure the target element whenever step changes ────
  const measureTarget = useCallback(() => {
    if (!step) return;

    const el = document.querySelector<HTMLElement>(
      `[data-tour="${step.targetId}"]`
    );

    // Target not in DOM → centered card mode
    if (!el) {
      setTargetRect(null);
      setCentered(true);
      return;
    }

    const rect = el.getBoundingClientRect();

    // Element hidden (display:none → zero size) or completely off-screen
    if (
      rect.width === 0 ||
      rect.height === 0 ||
      rect.right < 0 ||
      rect.bottom < 0 ||
      rect.left > window.innerWidth ||
      rect.top > window.innerHeight
    ) {
      setTargetRect(null);
      setCentered(true);
      return;
    }

    // Scroll into view if partially clipped
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Re-measure after scroll settles
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const fresh = el.getBoundingClientRect();
          setTargetRect({
            top: fresh.top,
            left: fresh.left,
            width: fresh.width,
            height: fresh.height,
          });
        });
      });
    } else {
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }

    setCentered(false);
  }, [step]);

  useEffect(() => {
    if (!tourActive) return;
    measureTarget();

    const onResize = () => measureTarget();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [tourActive, currentStepIndex, measureTarget]);

  // ─── Position tooltip ────────────────────────────────────
  useEffect(() => {
    if (!step || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Centered mode — no target visible
    if (centered || !targetRect) {
      setTooltipPos({
        top: Math.max(16, (vh - th) / 2),
        left: Math.max(16, (vw - tw) / 2),
      });
      return;
    }

    const spotlightRight =
      targetRect.left + targetRect.width + SPOTLIGHT_PADDING * 2;
    const spotlightBottom =
      targetRect.top + targetRect.height + SPOTLIGHT_PADDING * 2;

    let top = 0;
    let left = 0;

    // On mobile, always place below the target for readability
    const placement = isMobile ? "bottom" : step.placement;

    switch (placement) {
      case "right":
        left = spotlightRight + TOOLTIP_GAP;
        top = targetRect.top + targetRect.height / 2 - th / 2;
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

    // Clamp within viewport with safe margin
    top = Math.max(16, Math.min(top, vh - th - 16));
    left = Math.max(16, Math.min(left, vw - tw - 16));

    setTooltipPos({ top, left });
  }, [targetRect, step, currentStepIndex, centered, isMobile]);

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
  const showSpotlight = targetRect && !centered;

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

        {/* ── Spotlight cutout (only when target is visible) ── */}
        {showSpotlight && (
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
          className={`absolute z-[2] ${
            centered
              ? "w-[min(360px,calc(100vw-32px))]"
              : "w-[min(320px,calc(100vw-32px))]"
          }`}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
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

            <div className="p-4 sm:p-5">
              {/* Step counter */}
              <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-light" />
                  <span className="text-[10px] sm:text-xs font-semibold text-teal-light/80 tracking-wider uppercase">
                    Step {currentStepIndex + 1} of {tourSteps.length}
                  </span>
                </div>
                <button
                  onClick={skipTour}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all"
                  aria-label="Skip tour"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Step content */}
              <h3 className="font-heading font-bold text-sm sm:text-base text-foreground mb-1 sm:mb-1.5">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-5">
                {step.description}
              </p>

              {/* Step dots — visual progress indicator (mobile-friendly) */}
              <div className="flex items-center justify-center gap-1 mb-4 sm:hidden">
                {tourSteps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === currentStepIndex
                        ? "w-4 bg-teal-light"
                        : i < currentStepIndex
                          ? "w-1.5 bg-teal/40"
                          : "w-1.5 bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={prevStep}
                  disabled={isFirst}
                  className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg transition-all duration-200 ${
                    isFirst
                      ? "text-muted-foreground/30 cursor-not-allowed"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
                  }`}
                >
                  <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Back
                </button>

                <div className="flex items-center gap-2 sm:gap-3">
                  {!isLast && (
                    <button
                      onClick={skipTour}
                      className="text-[11px] sm:text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                    >
                      Skip
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className="inline-flex items-center gap-1 sm:gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-xl bg-teal text-white hover:bg-teal-light transition-all duration-200 shadow-[0_1px_4px_rgba(16,185,129,0.3)]"
                  >
                    {isLast ? "Finish" : "Next"}
                    {!isLast && <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Keyboard hint — desktop only */}
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
