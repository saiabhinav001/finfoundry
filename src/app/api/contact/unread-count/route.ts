import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { createCachedFetcher } from "@/lib/cache";

/**
 * Lightweight cached endpoint: returns only the unread message count.
 * Uses Firestore count() aggregation = 1 read instead of N doc reads.
 * Cached with "contact_count" tag — invalidated when contacts change.
 */
const getUnreadCount = createCachedFetcher("contact_unread_count", async () => {
  const snap = await adminDb
    .collection("contacts")
    .where("read", "==", false)
    .count()
    .get();
  return snap.data().count;
}, ["contact_count"]);

export async function GET() {
  try {
    const count = await getUnreadCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
