"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useOnboarding } from "@/lib/onboarding-context";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Rocket,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
 * GettingStarted — Interactive checklist widget for the
 * admin dashboard. Shows role-aware tasks with progress.
 *
 * Canva-inspired: collapsible, satisfying check animations,
 * progress ring, and a celebration state on completion.
 * ═══════════════════════════════════════════════════════════════ */

const EASE = [0.22, 1, 0.36, 1] as const;

export function GettingStarted() {
  const {
    checklistTasks,
    checklistProgress,
    checklistDismissed,
    markTaskDone,
    dismissChecklist,
    checklistLoaded,
  } = useOnboarding();

  const [expanded, setExpanded] = useState(true);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  if (!checklistLoaded || checklistDismissed) return null;

  const completed = checklistTasks.filter(
    (t) => checklistProgress[t.id]
  ).length;
  const total = checklistTasks.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const allDone = completed === total;

  // SVG progress ring values
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleMarkDone = (taskId: string) => {
    if (checklistProgress[taskId]) return;
    markTaskDone(taskId);
    setJustCompleted(taskId);
    setTimeout(() => setJustCompleted(null), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
      className="glass-card rounded-2xl border border-white/[0.06] overflow-hidden"
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer select-none hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Progress ring */}
        <div className="relative shrink-0">
          <svg width={44} height={44} className="-rotate-90">
            {/* Background circle */}
            <circle
              cx={22}
              cy={22}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={3}
            />
            {/* Progress circle */}
            <motion.circle
              cx={22}
              cy={22}
              r={radius}
              fill="none"
              stroke={allDone ? "#10B981" : "#14b8a6"}
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: EASE }}
              strokeDasharray={circumference}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {allDone ? (
              <Sparkles className="w-4 h-4 text-teal-light" />
            ) : (
              <span className="text-xs font-bold text-foreground">
                {completed}/{total}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-foreground text-sm flex items-center gap-2">
            <Rocket className="w-4 h-4 text-gold/80" />
            {allDone ? "All Set! 🎉" : "Getting Started"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {allDone
              ? "You've completed all setup tasks. Great job!"
              : `Complete ${total - completed} more task${total - completed !== 1 ? "s" : ""} to set up your site.`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {allDone && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissChecklist();
              }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all"
              aria-label="Dismiss checklist"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* ── Task list ──────────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-1">
              {checklistTasks.map((task, i) => {
                const done = checklistProgress[task.id];
                const isJustDone = justCompleted === task.id;

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, ease: EASE }}
                    className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${
                      done
                        ? "bg-teal/[0.04]"
                        : "hover:bg-white/[0.03] cursor-pointer"
                    }`}
                    onClick={() => !done && handleMarkDone(task.id)}
                  >
                    {/* Check icon */}
                    <div className="shrink-0 mt-0.5">
                      {done ? (
                        <motion.div
                          initial={isJustDone ? { scale: 0 } : undefined}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 15,
                          }}
                        >
                          <CheckCircle2 className="w-5 h-5 text-teal-light" />
                        </motion.div>
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium transition-all ${
                          done
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {task.label}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {task.description}
                      </p>
                    </div>

                    {/* Action */}
                    {!done && (
                      <Link
                        href={task.href}
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg text-teal-light/80 hover:text-teal-light bg-teal/[0.06] hover:bg-teal/[0.12] transition-all opacity-0 group-hover:opacity-100"
                      >
                        Go <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* dismiss when not all done */}
            {!allDone && (
              <div className="px-5 pb-4">
                <button
                  onClick={dismissChecklist}
                  className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                >
                  Dismiss checklist
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
