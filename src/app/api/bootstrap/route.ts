import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

/**
 * POST — One-time bootstrap to create the first super_admin.
 *
 * Requires:
 * - BOOTSTRAP_SECRET environment variable to be set
 * - A valid Firebase ID token (user must be logged in)
 * - The secret in the request body must match
 *
 * After using this endpoint, DELETE the BOOTSTRAP_SECRET env var.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 attempts per 15 minutes per IP
    const ip = getClientIP(request);
    const rl = checkRateLimit(`bootstrap:${ip}`, {
      maxRequests: 5,
      windowSeconds: 900,
    });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const secret = process.env.BOOTSTRAP_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "Bootstrap has been disabled. The secret is no longer set." },
        { status: 403 }
      );
    }

    const { idToken, bootstrapSecret } = await request.json();

    if (!idToken || !bootstrapSecret) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (bootstrapSecret !== secret) {
      return NextResponse.json(
        { error: "Invalid bootstrap secret." },
        { status: 403 }
      );
    }

    // Verify the ID token
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Check if there are already any super_admins
    const existing = await adminDb
      .collection("users")
      .where("role", "==", "super_admin")
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        {
          error:
            "A Super Admin already exists. Use the admin panel to manage roles.",
        },
        { status: 400 }
      );
    }

    // Create or update the user document
    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      await userRef.update({ role: "super_admin", active: true });
    } else {
      await userRef.set({
        name: decoded.name || decoded.email?.split("@")[0] || "Super Admin",
        email: decoded.email || "",
        role: "super_admin",
        active: true,
        photoURL: decoded.picture || "",
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      message:
        "You are now Super Admin! Remove the BOOTSTRAP_SECRET from your environment variables.",
      uid,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    console.error("Bootstrap error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
