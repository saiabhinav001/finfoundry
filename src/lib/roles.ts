import type { UserRole } from "@/types/firebase";

/** Numeric hierarchy — higher number = more permission */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  member: 0,
  editor: 1,
  admin: 2,
  super_admin: 3,
};

export function hasMinRole(userRole: UserRole, minRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

export function canAccessAdmin(role: UserRole): boolean {
  return hasMinRole(role, "editor");
}

export function canManageContent(role: UserRole): boolean {
  return hasMinRole(role, "editor");
}

export function canManageUsers(role: UserRole): boolean {
  return hasMinRole(role, "admin");
}

export function canChangeRoles(role: UserRole): boolean {
  return role === "super_admin" || role === "admin";
}

export const ROLE_LABELS: Record<UserRole, string> = {
  member: "Member",
  editor: "Editor",
  admin: "Admin",
  super_admin: "Super Admin",
};

/** Roles that a super_admin can assign to others */
export const ASSIGNABLE_ROLES: UserRole[] = [
  "member",
  "editor",
  "admin",
  "super_admin",
];

/** Roles that an admin can assign (cannot promote to super_admin) */
export const ADMIN_ASSIGNABLE_ROLES: UserRole[] = [
  "member",
  "editor",
];
