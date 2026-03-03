import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession, requireRole } from "@/lib/firebase/auth-helpers";
import { createCachedFetcher, invalidateCache } from "@/lib/cache";

const getAuditEntries = createCachedFetcher("audit", async () => {
  const snap = await adminDb
    .collection("audit_log")
    .orderBy("timestamp", "desc")
    .limit(200)
    .get();
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.()?.toISOString?.() || null,
  }));
}, ["audit"]);

/**
 * GET — Admin+: list recent audit log entries (cached, 24h TTL).
 * Pass ?refresh=true to force a fresh fetch (busts cache).
 */
export async function GET(request: NextRequest) {
  try {
    const { role } = await verifySession(request);
    requireRole(role, "admin");

    // Allow admin to manually bust the cache
    if (request.nextUrl.searchParams.get("refresh") === "true") {
      invalidateCache("audit");
    }

    const entries = await getAuditEntries();

    return NextResponse.json(entries);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    const status = msg.includes("permission") || msg.includes("Insufficient")
      ? 403
      : msg.includes("authenticated")
        ? 401
        : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
