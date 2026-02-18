/**
 * Server-side helpers for verifying Firebase sessions in API routes.
 * NEVER import this file in client components.
 */
import { adminAuth, adminDb } from "./admin";
import type { NextRequest } from "next/server";
import type { UserRole } from "@/types/firebase";
import { ROLE_HIERARCHY } from "@/lib/roles";

export interface SessionUser {
  uid: string;
  role: UserRole;
  email: string;
  name: string;
}

/**
 * Verify the session cookie and return the authenticated user's info.
 * Throws if not authenticated or account deactivated.
 */
export async function verifySession(
  request: NextRequest
): Promise<SessionUser> {
  const session = request.cookies.get("__session")?.value;
  if (!session) throw new Error("Not authenticated");

  const decoded = await adminAuth.verifySessionCookie(session, true);
  const userDoc = await adminDb.collection("users").doc(decoded.uid).get();

  if (!userDoc.exists) throw new Error("User profile not found");

  const data = userDoc.data()!;
  // Only block if explicitly deactivated (active === false)
  // Super admins can never be locked out of API routes
  if (data.active === false && data.role !== "super_admin") {
    throw new Error("Account has been deactivated");
  }

  return {
    uid: decoded.uid,
    role: data.role as UserRole,
    email: data.email || decoded.email || "",
    name: data.name || "",
  };
}

/**
 * Throw if the user's role doesn't meet the minimum requirement.
 */
export function requireRole(userRole: UserRole, minRole: UserRole): void {
  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[minRole]) {
    throw new Error(
      `Insufficient permissions. Requires ${minRole} or higher.`
    );
  }
}
