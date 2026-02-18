import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession, requireRole } from "@/lib/firebase/auth-helpers";
import { logAction } from "@/lib/audit-log";
import { invalidate } from "@/lib/cache";

const ALLOWED_COLLECTIONS = ["team", "programs", "resources"];

/** PATCH — Batch update order field for a collection (editor+) */
export async function PATCH(request: NextRequest) {
  try {
    const session = await verifySession(request);
    requireRole(session.role, "editor");

    const { collection, orderedIds } = await request.json();

    if (!collection || !ALLOWED_COLLECTIONS.includes(collection)) {
      return NextResponse.json(
        { error: `Invalid collection. Allowed: ${ALLOWED_COLLECTIONS.join(", ")}` },
        { status: 400 }
      );
    }

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { error: "orderedIds must be a non-empty array of document IDs." },
        { status: 400 }
      );
    }

    // Batch write all order updates
    const batch = adminDb.batch();
    orderedIds.forEach((id: string, index: number) => {
      const ref = adminDb.collection(collection).doc(id);
      batch.update(ref, { order: index });
    });
    await batch.commit();

    await logAction(
      session.uid,
      session.name,
      "update",
      `reordered ${collection} (${orderedIds.length} items)`
    );
    invalidate(collection);

    return NextResponse.json({ message: "Order updated!" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    const status = msg.includes("Insufficient") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
