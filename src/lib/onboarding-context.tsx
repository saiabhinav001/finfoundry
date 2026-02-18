"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth-context";
import { getStepsForRole, type TourStep } from "@/components/admin/tour/tour-steps";

/* ═══════════════════════════════════════════════════════════════
 * OnboardingContext — Orchestrates the admin guided tour +
 * getting-started checklist.
 *
 * State sourced from Firestore (via /api/onboarding) on mount,
 * and written back on changes. Falls back gracefully if fetch fails.
 * ═══════════════════════════════════════════════════════════════ */

export interface ChecklistTask {
  id: string;
  label: string;
  description: string;
  href: string;
  minRole: "editor" | "admin";
}

export const CHECKLIST_TASKS: ChecklistTask[] = [
  {
    id: "add_team",
    label: "Add a team member",
    description: "Add your first club member with photo & role.",
    href: "/admin/team",
    minRole: "editor",
  },
  {
    id: "create_event",
    label: "Create an event",
    description: "Publish an upcoming, ongoing, or completed event.",
    href: "/admin/events",
    minRole: "editor",
  },
  {
    id: "add_program",
    label: "Add a program",
    description: "Define a program that your club offers.",
    href: "/admin/programs",
    minRole: "editor",
  },
  {
    id: "add_resource",
    label: "Add a resource category",
    description: "Create a learning resource category with items.",
    href: "/admin/resources",
    minRole: "editor",
  },
  {
    id: "update_about",
    label: "Update the About page",
    description: "Write your club's mission and story.",
    href: "/admin/about",
    minRole: "editor",
  },
  {
    id: "site_settings",
    label: "Configure site settings",
    description: "Update the site name, description, and social links.",
    href: "/admin/settings",
    minRole: "admin",
  },
];

interface OnboardingState {
  /* Tour */
  tourActive: boolean;
  tourSteps: TourStep[];
  currentStepIndex: number;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  tourComplete: boolean;

  /* Checklist */
  checklistTasks: ChecklistTask[];
  checklistProgress: Record<string, boolean>;
  checklistDismissed: boolean;
  markTaskDone: (taskId: string) => void;
  dismissChecklist: () => void;
  checklistLoaded: boolean;
}

const OnboardingContext = createContext<OnboardingState>({
  tourActive: false,
  tourSteps: [],
  currentStepIndex: 0,
  startTour: () => {},
  nextStep: () => {},
  prevStep: () => {},
  skipTour: () => {},
  tourComplete: false,
  checklistTasks: [],
  checklistProgress: {},
  checklistDismissed: false,
  markTaskDone: () => {},
  dismissChecklist: () => {},
  checklistLoaded: false,
});

export function useOnboarding() {
  return useContext(OnboardingContext);
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { role } = useAuth();

  /* ── Tour state ──────────────────────────────────────── */
  const [tourActive, setTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tourComplete, setTourComplete] = useState(true); // default true so tour doesn't flash
  const [loaded, setLoaded] = useState(false);

  /* ── Checklist state ─────────────────────────────────── */
  const [checklistProgress, setChecklistProgress] = useState<Record<string, boolean>>({});
  const [checklistDismissed, setChecklistDismissed] = useState(false);

  /* ── Derived ─────────────────────────────────────────── */
  const tourSteps = role ? getStepsForRole(role) : [];
  const hierarchy: Record<string, number> = { member: 0, editor: 1, admin: 2, super_admin: 3 };
  const userLevel = role ? hierarchy[role] ?? 0 : 0;
  const checklistTasks = CHECKLIST_TASKS.filter(
    (t) => userLevel >= hierarchy[t.minRole]
  );

  /* ── Fetch onboarding state from Firestore on mount ──── */
  useEffect(() => {
    if (!role || userLevel < 1) return; // members don't get onboarding

    const fetchState = async () => {
      try {
        const res = await fetch("/api/onboarding");
        if (res.ok) {
          const data = await res.json();
          setTourComplete(data.tourComplete ?? false);
          setChecklistDismissed(data.checklistDismissed ?? false);
          setChecklistProgress(data.checklistProgress ?? {});
        }
      } catch {
        // Fail silently — defaults are safe
      }
      setLoaded(true);
    };
    fetchState();
  }, [role, userLevel]);

  /* ── Auto-start tour for first-time admin users ──────── */
  useEffect(() => {
    if (!loaded) return;
    if (!tourComplete && !tourActive && tourSteps.length > 0) {
      // Small delay to let the admin panel render + attach data-tour attrs
      const t = setTimeout(() => setTourActive(true), 800);
      return () => clearTimeout(t);
    }
  }, [loaded, tourComplete, tourActive, tourSteps.length]);

  /* ── Persist helpers ─────────────────────────────────── */
  const persist = useCallback(async (body: Record<string, unknown>) => {
    try {
      await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      // best-effort persistence
    }
  }, []);

  /* ── Tour controls ───────────────────────────────────── */
  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setTourActive(true);
  }, []);

  const finishTour = useCallback(() => {
    setTourActive(false);
    setTourComplete(true);
    setCurrentStepIndex(0);
    persist({ tourComplete: true });
  }, [persist]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < tourSteps.length - 1) {
      setCurrentStepIndex((i) => i + 1);
    } else {
      finishTour();
    }
  }, [currentStepIndex, tourSteps.length, finishTour]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const skipTour = useCallback(() => {
    finishTour();
  }, [finishTour]);

  /* ── Checklist controls ──────────────────────────────── */
  const markTaskDone = useCallback(
    (taskId: string) => {
      setChecklistProgress((prev) => {
        const updated = { ...prev, [taskId]: true };
        persist({ checklistProgress: { [taskId]: true } });
        return updated;
      });
    },
    [persist]
  );

  const dismissChecklist = useCallback(() => {
    setChecklistDismissed(true);
    persist({ checklistDismissed: true });
  }, [persist]);

  return (
    <OnboardingContext.Provider
      value={{
        tourActive,
        tourSteps,
        currentStepIndex,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        tourComplete,
        checklistTasks,
        checklistProgress,
        checklistDismissed,
        markTaskDone,
        dismissChecklist,
        checklistLoaded: loaded,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}
