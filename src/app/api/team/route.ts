import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession, requireRole } from "@/lib/firebase/auth-helpers";
import { FieldValue } from "firebase-admin/firestore";
import { logAction } from "@/lib/audit-log";
import { sanitize } from "@/lib/sanitize";
import { createCachedFetcher, invalidateCache } from "@/lib/cache";

/** Cached fetcher: public team (visible only) */
const getPublicTeam = createCachedFetcher("team", async () => {
  const snap = await adminDb.collection("team").orderBy("order", "asc").get();
  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((m: Record<string, unknown>) => m.visible !== false);
}, ["team"]);

/** Cached fetcher: all team members (admin) */
const getAllTeam = createCachedFetcher("team_all", async () => {
  const snap = await adminDb.collection("team").orderBy("order", "asc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}, ["team"]);

/** GET — List team members (public or admin, persistent cache) */
export async function GET(request: NextRequest) {
  const showAll = request.nextUrl.searchParams.get("all") === "1";

  try {
    if (showAll) {
      const session = await verifySession(request);
      requireRole(session.role, "editor");
      return NextResponse.json(await getAllTeam());
    }

    return NextResponse.json(await getPublicTeam(), {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
    });
  } catch (error: unknown) {
    if (showAll) {
      const msg = error instanceof Error ? error.message : "Server error";
      const status = msg.includes("Insufficient") ? 403 : msg.includes("authenticated") ? 401 : 500;
      return NextResponse.json({ error: msg }, { status });
    }
    return NextResponse.json([], { status: 200 });
  }
}

/** POST — Add a team member (editor+) */
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession(request);
    requireRole(session.role, "editor");

    const body = await request.json();
    const name = sanitize(body.name, 200);
    const memberRole = sanitize(body.role, 200);
    const image = typeof body.image === "string" ? sanitize(body.image, 2000) : "";
    const linkedin = typeof body.linkedin === "string" ? sanitize(body.linkedin, 2000) : "";
    const batch = typeof body.batch === "string" ? sanitize(body.batch, 20) : new Date().getFullYear().toString();
    const visible = body.visible !== false; // default true
    const category = ["core_committee", "team_head", "member"].includes(body.category)
      ? body.category
      : "member";

    if (!name || !memberRole) {
      return NextResponse.json(
        { error: "Name and role are required." },
        { status: 400 }
      );
    }

    // Use count aggregation instead of fetching all docs (1 read vs N reads)
    const countSnap = await adminDb.collection("team").count().get();
    const order = countSnap.data().count;

    const docRef = await adminDb.collection("team").add({
      name,
      role: memberRole,
      image: image || "",
      linkedin: linkedin || "",
      batch: batch || new Date().getFullYear().toString(),
      visible,
      category,
      order,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await logAction(session.uid, session.name, "create", `created team member "${name}"`);
    invalidateCache("team", "team_all");

    return NextResponse.json({
      id: docRef.id,
      message: "Team member added!",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    const status = msg.includes("Insufficient") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

/** PUT — Update a team member (editor+) */
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
      return NextResponse.json(
        { error: "Missing team member ID." },
        { status: 400 }
      );
    }

    await adminDb
      .collection("team")
      .doc(id)
      .update({ ...data, updatedAt: FieldValue.serverTimestamp() });

    await logAction(session.uid, session.name, "update", `updated team member "${data.name || id}"`);
    invalidateCache("team", "team_all");

    return NextResponse.json({ message: "Team member updated!" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** DELETE — Remove a team member (admin+) */
export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession(request);
    requireRole(session.role, "admin");

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Missing team member ID." },
        { status: 400 }
      );
    }

    const doc = await adminDb.collection("team").doc(id).get();
    const memberName = doc.data()?.name || id;
    await adminDb.collection("team").doc(id).delete();
    await logAction(session.uid, session.name, "delete", `deleted team member "${memberName}"`);
    invalidateCache("team", "team_all");

    return NextResponse.json({ message: "Team member removed!" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
