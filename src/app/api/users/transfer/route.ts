import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/firebase/auth-helpers";
import { logAction } from "@/lib/audit-log";

/**
 * POST — Transfer Super Admin role to another user.
 * Only the current super_admin can do this.
 * Promotes target to super_admin, demotes self to admin.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession(request);

    if (session.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only a Super Admin can transfer ownership." },
        { status: 403 }
      );
    }

    const { targetUid } = await request.json();

    if (!targetUid) {
      return NextResponse.json(
        { error: "Target user ID is required." },
        { status: 400 }
      );
    }

    if (targetUid === session.uid) {
      return NextResponse.json(
        { error: "You cannot transfer to yourself." },
        { status: 400 }
      );
    }

    // Verify target user exists and is active
    const targetDoc = await adminDb.collection("users").doc(targetUid).get();
    if (!targetDoc.exists) {
      return NextResponse.json(
        { error: "Target user not found." },
        { status: 404 }
      );
    }

    const targetData = targetDoc.data()!;
    if (targetData.active === false) {
      return NextResponse.json(
        { error: "Cannot transfer to a deactivated user." },
        { status: 400 }
      );
    }

    // Use a batch to atomically update both users
    const batch = adminDb.batch();
    batch.update(adminDb.collection("users").doc(targetUid), {
      role: "super_admin",
    });
    batch.update(adminDb.collection("users").doc(session.uid), {
      role: "admin",
    });
    await batch.commit();

    await logAction(
      session.uid,
      session.name,
      "transfer",
      `transferred Super Admin to ${targetData.name || targetUid}`,
      `${session.name} → admin, ${targetData.name || targetUid} → super_admin`
    );

    return NextResponse.json({
      message: `Super Admin transferred to ${targetData.name || "user"} successfully! You are now an Admin.`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    const status = msg.includes("authenticated") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
