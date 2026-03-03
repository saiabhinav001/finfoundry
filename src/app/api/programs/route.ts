import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession, requireRole } from "@/lib/firebase/auth-helpers";
import { FieldValue } from "firebase-admin/firestore";
import { logAction } from "@/lib/audit-log";
import { sanitize } from "@/lib/sanitize";
import { createCachedFetcher, invalidateCache } from "@/lib/cache";

const getPrograms = createCachedFetcher("programs", async () => {
  const snap = await adminDb
    .collection("programs")
    .orderBy("order", "asc")
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}, ["programs"]);

/** GET — List all programs (public, persistent cache) */
export async function GET() {
  try {
    const programs = await getPrograms();
    return NextResponse.json(programs, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

/** POST — Create a program (editor+) */
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession(request);
    requireRole(session.role, "editor");

    const body = await request.json();
    const title = sanitize(body.title, 200);
    const description = sanitize(body.description, 5000);
    const icon = body.icon;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    // Use count aggregation instead of fetching all docs (1 read vs N reads)
    const countSnap = await adminDb.collection("programs").count().get();
    const order = countSnap.data().count;

    const docRef = await adminDb.collection("programs").add({
      title,
      description,
      icon: icon || "TrendingUp",
      order,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await logAction(session.uid, session.name, "create", `created program "${title}"`);
    invalidateCache("programs");

    return NextResponse.json({ id: docRef.id, message: "Program created!" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    const status = msg.includes("Insufficient") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

/** PUT — Update a program (editor+) */
export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession(request);
    requireRole(session.role, "editor");

    const { id, ...rawData } = await request.json();
    const data: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(rawData)) {
      data[key] = typeof val === "string" ? sanitize(val, 5000) : val;
    }

    if (!id) {
      return NextResponse.json({ error: "Missing program ID." }, { status: 400 });
    }

    await adminDb
      .collection("programs")
      .doc(id)
      .update({ ...data, updatedAt: FieldValue.serverTimestamp() });

    await logAction(session.uid, session.name, "update", `updated program "${data.title || id}"`);
    invalidateCache("programs");

    return NextResponse.json({ message: "Program updated!" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** DELETE — Delete a program (admin+) */
export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession(request);
    requireRole(session.role, "admin");

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing program ID." }, { status: 400 });
    }

    const doc = await adminDb.collection("programs").doc(id).get();
    const title = doc.data()?.title || id;
    await adminDb.collection("programs").doc(id).delete();
    await logAction(session.uid, session.name, "delete", `deleted program "${title}"`);
    invalidateCache("programs");

    return NextResponse.json({ message: "Program deleted!" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
