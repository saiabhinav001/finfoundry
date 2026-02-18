/* ──────────────────────────────────────────
   Shared TypeScript types for Firebase data
   ────────────────────────────────────────── */

export type UserRole = "super_admin" | "admin" | "editor" | "member";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  photoURL?: string;
  createdAt: unknown; // Firestore Timestamp
}

export interface EventDoc {
  id?: string;
  title: string;
  date: string;
  type: string;
  status: "upcoming" | "ongoing" | "completed";
  description: string;
  imageURL?: string;
  venue?: string;
  time?: string;
  registrationLink?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ProgramDoc {
  id?: string;
  title: string;
  description: string;
  icon: string;
  order?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type TeamCategory = "core_committee" | "team_head" | "member";

export interface TeamMemberDoc {
  id?: string;
  name: string;
  role: string;
  image?: string;
  linkedin?: string;
  order?: number;
  batch?: string;
  visible?: boolean;       // defaults to true — hidden members are excluded from the public page
  category?: TeamCategory; // "core_committee" | "team_head" | "member"
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ResourceItemDoc {
  title: string;
  author: string;
  description: string;
}

export interface ResourceCategoryDoc {
  id?: string;
  category: string;
  items: ResourceItemDoc[];
  order?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}
