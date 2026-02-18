import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { verifySession, requireRole } from "@/lib/firebase/auth-helpers";
import { logAction } from "@/lib/audit-log";

/** GET — List all users (admin+) */
export async function GET(request: NextRequest) {
  try {
    const { role } = await verifySession(request);
    requireRole(role, "admin");

    const snap = await adminDb
      .collection("users")
      .orderBy("createdAt", "desc")
      .get();
    const users = snap.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(users);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    const status = msg.includes("Insufficient") ? 403 : msg.includes("authenticated") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

/**
 * DELETE — Permanently delete a user from Firestore AND Firebase Auth.
 * Only super_admin can delete users.
 * Revokes all sessions immediately so the user is logged out instantly.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession(request);

    if (session.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only a Super Admin can permanently delete users." },
        { status: 403 }
      );
    }

    const { uid } = await request.json();
    if (!uid) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    // Cannot delete yourself
    if (uid === session.uid) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    // Check user exists
    const userSnap = await adminDb.collection("users").doc(uid).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userData = userSnap.data()!;

    // Cannot delete the last super_admin
    if (userData.role === "super_admin") {
      const superAdmins = await adminDb
        .collection("users")
        .where("role", "==", "super_admin")
        .where("active", "==", true)
        .get();

      if (superAdmins.size <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last Super Admin." },
          { status: 400 }
        );
      }
    }

    // 1. Revoke all refresh tokens → invalidates session cookies immediately
    try {
      await adminAuth.revokeRefreshTokens(uid);
    } catch {
      // User might not exist in Auth (already deleted) — continue
    }

    // 2. Delete from Firebase Auth
    try {
      await adminAuth.deleteUser(uid);
    } catch {
      // User might not exist in Auth — continue with Firestore cleanup
    }

    // 3. Delete from Firestore
    await adminDb.collection("users").doc(uid).delete();

    await logAction(
      session.uid,
      session.name,
      "delete",
      `permanently deleted user ${userData.name || userData.email || uid}`
    );

    return NextResponse.json({
      message: `User "${userData.name || userData.email}" has been permanently deleted.`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    const status = msg.includes("Insufficient") ? 403 : msg.includes("authenticated") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
