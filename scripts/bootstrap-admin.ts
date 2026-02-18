/**
 * Bootstrap Script — Create First Super Admin
 *
 * Usage:
 *   1. Set up your .env.local with Firebase and BOOTSTRAP_SECRET
 *   2. Sign in to the website with Google (at /login)
 *   3. Open the browser console and run:
 *        fetch('/api/auth/session', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ idToken: '<your-token>' })})
 *      Or simply sign in — the session will be created automatically.
 *   4. Then run this script with your Firebase UID:
 *        npx tsx scripts/bootstrap-admin.ts <your-uid>
 *
 * Alternative (recommended):
 *   Use the /api/bootstrap endpoint directly:
 *     1. Sign in to the website
 *     2. Open browser console
 *     3. Run:
 *        const user = (await import('firebase/auth')).getAuth().currentUser;
 *        const token = await user.getIdToken();
 *        fetch('/api/bootstrap', {
 *          method: 'POST',
 *          headers: {'Content-Type':'application/json'},
 *          body: JSON.stringify({ idToken: token, secret: 'YOUR_BOOTSTRAP_SECRET' })
 *        }).then(r => r.json()).then(console.log);
 *
 * After bootstrapping, remove BOOTSTRAP_SECRET from your environment variables.
 */

async function bootstrap() {
  const uid = process.argv[2];

  if (!uid) {
    console.error("Usage: npx tsx scripts/bootstrap-admin.ts <firebase-uid>");
    console.error("");
    console.error("To find your UID:");
    console.error("  1. Sign in at /login");
    console.error("  2. Open browser console");
    console.error("  3. Run: (await import('firebase/auth')).getAuth().currentUser.uid");
    process.exit(1);
  }

  // Load Firebase Admin
  const { initializeApp, cert, getApps } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");

  // Load env (dotenv for local development)
  try {
    const dotenv = await import("dotenv");
    dotenv.config({ path: ".env.local" });
  } catch {
    // dotenv not installed, env vars must be set manually
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.error("Missing Firebase Admin environment variables.");
    console.error("Make sure FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY are set.");
    process.exit(1);
  }

  const app =
    getApps().length === 0
      ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
      : getApps()[0];

  const db = getFirestore(app);

  // Check if super_admin already exists
  const existing = await db
    .collection("users")
    .where("role", "==", "super_admin")
    .limit(1)
    .get();

  if (!existing.empty) {
    const existingAdmin = existing.docs[0].data();
    console.error(`A super admin already exists: ${existingAdmin.email || existingAdmin.name}`);
    console.error("Only one super admin can be bootstrapped. Use the admin panel to manage roles.");
    process.exit(1);
  }

  // Check if user document exists
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    console.error(`No user found with UID: ${uid}`);
    console.error("Make sure the user has signed in at least once.");
    process.exit(1);
  }

  // Promote to super_admin
  await userRef.update({ role: "super_admin" });

  const userData = userSnap.data();
  console.log("");
  console.log("✓ Super admin created successfully!");
  console.log(`  Name:  ${userData?.name}`);
  console.log(`  Email: ${userData?.email}`);
  console.log(`  UID:   ${uid}`);
  console.log("");
  console.log("Next steps:");
  console.log("  1. Remove BOOTSTRAP_SECRET from your environment variables");
  console.log("  2. Sign out and sign back in at /login");
  console.log("  3. Visit /admin to access the dashboard");
  console.log("");
}

bootstrap().catch((err) => {
  console.error("Bootstrap failed:", err.message);
  process.exit(1);
});
