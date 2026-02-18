import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  // Must always be the Firebase-hosted domain (e.g. finfoundry.firebaseapp.com)
  // so the /__/auth/handler route exists. Never override with a custom domain
  // unless you have Firebase Hosting set up there.
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Only initialize if API key is present (avoids crashes when env is not set)
const app =
  firebaseConfig.apiKey && getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0] ?? null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export default app;
