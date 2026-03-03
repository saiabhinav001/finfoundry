import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession, requireRole } from "@/lib/firebase/auth-helpers";
import { unstable_cache } from "next/cache";
import { invalidateCache } from "@/lib/cache";

/**
 * Cached per-user onboarding fetcher.
 * The uid argument becomes part of the cache key so each user
 * gets their own cached entry. All entries share the "onboarding"
 * tag so one invalidateCache("onboarding") busts all of them
 * (fine — only 3-5 admin users).
 */
const getOnboardingState = unstable_cache(
  async (uid: string) => {
    const doc = await adminDb.collection("users").doc(uid).get();
    const data = doc.data() || {};
    return {
      tourComplete: data.tourComplete ?? false,
      checklistDismissed: data.checklistDismissed ?? false,
      checklistProgress: data.checklistProgress ?? {},
    };
  },
  ["onboarding"],
  { tags: ["onboarding"], revalidate: 86400 }
);

/**
 * GET /api/onboarding — Read current user's onboarding state (cached).
 */
export async function GET(request: NextRequest) {
  try {
    const { uid, role } = await verifySession(request);
    requireRole(role, "editor");

    const state = await getOnboardingState(uid);

    return NextResponse.json(state);
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
      // Use dot-notation merge to avoid an extra Firestore read
      for (const [taskId, done] of Object.entries(body.checklistProgress)) {
        update[`checklistProgress.${taskId}`] = done;
      }
    }

    if (Object.keys(update).length > 0) {
      await adminDb.collection("users").doc(uid).update(update);
      invalidateCache("onboarding");
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
