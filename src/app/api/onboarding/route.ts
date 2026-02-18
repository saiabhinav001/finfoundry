import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession, requireRole } from "@/lib/firebase/auth-helpers";

/**
 * GET /api/onboarding — Read current user's onboarding state.
 * Returns { tourComplete, checklistDismissed, checklistProgress }.
 */
export async function GET(request: NextRequest) {
  try {
    const { uid, role } = await verifySession(request);
    requireRole(role, "editor");

    const doc = await adminDb.collection("users").doc(uid).get();
    const data = doc.data() || {};

    return NextResponse.json({
      tourComplete: data.tourComplete ?? false,
      checklistDismissed: data.checklistDismissed ?? false,
      checklistProgress: data.checklistProgress ?? {},
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    const status = msg.includes("Insufficient")
      ? 403
      : msg.includes("authenticated")
        ? 401
        : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

/**
 * PATCH /api/onboarding — Update current user's onboarding state.
 * Body can include: tourComplete, checklistDismissed, checklistProgress.
 */
export async function PATCH(request: NextRequest) {
  try {
    const { uid, role } = await verifySession(request);
    requireRole(role, "editor");

    const body = await request.json();
    const update: Record<string, unknown> = {};

    if (typeof body.tourComplete === "boolean") {
      update.tourComplete = body.tourComplete;
    }
    if (typeof body.checklistDismissed === "boolean") {
      update.checklistDismissed = body.checklistDismissed;
    }
    if (body.checklistProgress && typeof body.checklistProgress === "object") {
      // Merge with existing progress, don't overwrite
      const doc = await adminDb.collection("users").doc(uid).get();
      const existing = doc.data()?.checklistProgress ?? {};
      update.checklistProgress = { ...existing, ...body.checklistProgress };
    }

    if (Object.keys(update).length > 0) {
      await adminDb.collection("users").doc(uid).update(update);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    const status = msg.includes("Insufficient")
      ? 403
      : msg.includes("authenticated")
        ? 401
        : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
