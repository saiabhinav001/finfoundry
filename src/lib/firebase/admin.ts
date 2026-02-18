import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let _app: App | null = null;
let _adminAuth: Auth | null = null;
let _adminDb: Firestore | null = null;

function getAdminApp(): App {
  if (_app) return _app;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin SDK environment variables are missing. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY."
    );
  }

  _app =
    getApps().length === 0
      ? initializeApp({
          credential: cert({ projectId, clientEmail, privateKey }),
        })
      : getApps()[0];

  return _app;
}

/** Lazily initialised Firebase Admin Auth — only accessed at request time */
export function getAdminAuth(): Auth {
  if (!_adminAuth) _adminAuth = getAuth(getAdminApp());
  return _adminAuth;
}

/** Lazily initialised Firebase Admin Firestore — only accessed at request time */
export function getAdminDb(): Firestore {
  if (!_adminDb) _adminDb = getFirestore(getAdminApp());
  return _adminDb;
}

// Keep backward-compatible named exports that lazily resolve
export const adminAuth = new Proxy({} as Auth, {
  get(_, prop) {
    const auth = getAdminAuth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (auth as any)[prop];
    if (typeof value === "function") return value.bind(auth);
    return value;
  },
});

export const adminDb = new Proxy({} as Firestore, {
  get(_, prop) {
    const db = getAdminDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (db as any)[prop];
    if (typeof value === "function") return value.bind(db);
    return value;
  },
});
