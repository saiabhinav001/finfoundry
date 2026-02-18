import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession, requireRole } from "@/lib/firebase/auth-helpers";
import { FieldValue } from "firebase-admin/firestore";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitize, isValidEmail, isNonEmpty } from "@/lib/sanitize";

/** POST — Public: Submit a contact message */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 submissions per 15 minutes per IP
    const ip = getClientIP(request);
    const rl = checkRateLimit(`contact:${ip}`, {
      maxRequests: 5,
      windowSeconds: 900,
    });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Sanitize all inputs
    const name = sanitize(body.name, 100);
    const email = sanitize(body.email, 254);
    const subject = sanitize(body.subject, 200);
    const message = sanitize(body.message, 5000);

    if (!isNonEmpty(name) || !isNonEmpty(email) || !isNonEmpty(subject) || !isNonEmpty(message)) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    await adminDb.collection("contacts").add({
      name,
      email,
      subject,
      message,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ message: "Message sent successfully!" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** GET — Admin+: List all contact submissions */
export async function GET(request: NextRequest) {
  try {
    const { role } = await verifySession(request);
    requireRole(role, "admin");

    const snap = await adminDb
      .collection("contacts")
      .orderBy("createdAt", "desc")
      .get();

    const contacts = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() || null,
    }));

    return NextResponse.json(contacts);
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

/** PATCH — Admin+: Mark message as read/unread */
export async function PATCH(request: NextRequest) {
  try {
    const { role } = await verifySession(request);
    requireRole(role, "admin");

    const { id, read } = await request.json();

    if (!id || typeof read !== "boolean") {
      return NextResponse.json(
        { error: "Message ID and read status required." },
        { status: 400 }
      );
    }

    await adminDb.collection("contacts").doc(id).update({ read });

    return NextResponse.json({ message: "Updated!" });
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

/** DELETE — Admin+: Delete a contact message */
export async function DELETE(request: NextRequest) {
  try {
    const { role } = await verifySession(request);
    requireRole(role, "admin");

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Message ID required." },
        { status: 400 }
      );
    }

    await adminDb.collection("contacts").doc(id).delete();

    return NextResponse.json({ message: "Message deleted!" });
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
