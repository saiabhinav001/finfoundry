import type { UserRole } from "@/types/firebase";

/* ═══════════════════════════════════════════════════════════════
 * Tour step definitions — role-aware guided walkthrough.
 *
 * Each step targets a DOM element via `data-tour="<targetId>"`.
 * Steps are filtered based on the user's role.
 * ═══════════════════════════════════════════════════════════════ */

export interface TourStep {
  /** Unique identifier — matches data-tour attribute on target element */
  targetId: string;
  /** Short title shown in tooltip header */
  title: string;
  /** Description text */
  description: string;
  /** Minimum role needed to see this step */
  minRole: UserRole;
  /** Preferred tooltip placement relative to target */
  placement: "top" | "bottom" | "left" | "right";
  /** Optional: navigate to this path before showing the step */
  route?: string;
}

export const TOUR_STEPS: TourStep[] = [
  // ─── Welcome (shown to all admin-panel users) ────────────
  {
    targetId: "sidebar-header",
    title: "Welcome to FinFoundry Admin!",
    description:
      "This is your control center for managing the entire website. Let me give you a quick tour of what's here.",
    minRole: "editor",
    placement: "right",
  },

  // ─── Dashboard ────────────────────────────────────────────
  {
    targetId: "sidebar-dashboard",
    title: "Dashboard",
    description:
      "Your home base. See total team members, events, programs, resources, unread messages, and recent activity — all at a glance.",
    minRole: "editor",
    placement: "right",
  },

  // ─── Content management (editor+) ────────────────────────
  {
    targetId: "sidebar-team",
    title: "Team Management",
    description:
      "Add, edit, and reorder team members. Upload photos, add LinkedIn links, and organize by batch. Drag to reorder.",
    minRole: "editor",
    placement: "right",
  },
  {
    targetId: "sidebar-events",
    title: "Events",
    description:
      "Create upcoming, ongoing, or completed events. Add images, venue details, and registration links. They appear on the public Events page instantly.",
    minRole: "editor",
    placement: "right",
  },
  {
    targetId: "sidebar-programs",
    title: "Programs",
    description:
      "Manage the club's program offerings — each with a title, description, and icon. Drag to reorder them on the website.",
    minRole: "editor",
    placement: "right",
  },
  {
    targetId: "sidebar-resources",
    title: "Resources",
    description:
      "Organize learning resources by category. Each category contains items with titles, authors, and descriptions.",
    minRole: "editor",
    placement: "right",
  },
  {
    targetId: "sidebar-about",
    title: "About Section",
    description:
      "Edit the club's about page content — mission, vision, and the story behind FinFoundry.",
    minRole: "editor",
    placement: "right",
  },
  {
    targetId: "sidebar-messages",
    title: "Messages",
    description:
      "View contact form submissions from visitors. Mark as read/unread, and use bulk actions to manage them efficiently.",
    minRole: "editor",
    placement: "right",
  },

  // ─── Governance (admin+) ─────────────────────────────────
  {
    targetId: "sidebar-users",
    title: "User Management",
    description:
      "Manage who has access to this admin panel. Promote members to editors, or editors to admins. Deactivate accounts if needed.",
    minRole: "admin",
    placement: "right",
  },
  {
    targetId: "sidebar-activity",
    title: "Activity Log",
    description:
      "Track every admin action — who created, edited, or deleted content, and when. Full audit trail for accountability.",
    minRole: "admin",
    placement: "right",
  },
  {
    targetId: "sidebar-settings",
    title: "Site Settings",
    description:
      "Configure site-wide metadata — name, description, social links, and more. Changes reflect across the entire public website.",
    minRole: "admin",
    placement: "right",
  },

  // ─── Final step ──────────────────────────────────────────
  {
    targetId: "sidebar-header",
    title: "You're All Set! 🎉",
    description:
      "That's the full tour. You can always restart it from the Settings page. Now go build something great!",
    minRole: "editor",
    placement: "right",
  },
];

/** Filter steps based on current user's role */
export function getStepsForRole(role: UserRole): TourStep[] {
  const hierarchy: Record<UserRole, number> = {
    member: 0,
    editor: 1,
    admin: 2,
    super_admin: 3,
  };
  const userLevel = hierarchy[role];
  return TOUR_STEPS.filter(
    (step) => userLevel >= hierarchy[step.minRole]
  );
}
