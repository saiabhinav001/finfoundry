"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import type { UserRole } from "@/types/firebase";

/** Key used to persist google-redirect loading state across navigation */
const GOOGLE_REDIRECT_PENDING = "gg_redirect_pending";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  googleLoading: boolean;
  sessionError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  googleLoading: false,
  sessionError: null,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(() => {
    // Restore spinner while the OAuth redirect is in flight
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(GOOGLE_REDIRECT_PENDING) === "1";
    }
    return false;
  });
  const [sessionError, setSessionError] = useState<string | null>(null);
  // Guard to prevent duplicate createSession calls during signUpWithEmail
  const skipNextAuthChange = useRef(false);

  /** Exchange Firebase ID token for a server session cookie */
  const createSession = useCallback(async (firebaseUser: User) => {
    try {
      setSessionError(null);
      const idToken = await firebaseUser.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (res.ok) {
        const data = await res.json();
        setRole(data.role as UserRole);
      } else {
        const data = await res.json().catch(() => ({}));
        const errMsg = data.error || `Session failed (${res.status})`;
        console.error("Session creation failed:", errMsg);
        setSessionError(errMsg);
        // If account is deactivated (403), sign out of Firebase to prevent
        // an infinite retry loop from onAuthStateChanged
        if (res.status === 403) {
          await firebaseSignOut(auth!);
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Session creation failed";
      console.error("Session creation failed:", errMsg);
      setSessionError(errMsg);
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    // Handle redirect result — fires after Google redirects back to the app.
    // createSession will be called via onAuthStateChanged below, but we
    // clear the pending flag here so the spinner goes away on error too.
    getRedirectResult(auth)
      .then((result) => {
        sessionStorage.removeItem(GOOGLE_REDIRECT_PENDING);
        if (result?.user) {
          // onAuthStateChanged will also fire; createSession is handled there.
          setGoogleLoading(false);
        } else {
          setGoogleLoading(false);
        }
      })
      .catch((err: unknown) => {
        sessionStorage.removeItem(GOOGLE_REDIRECT_PENDING);
        setGoogleLoading(false);
        console.error("Redirect sign-in error:", err);
      });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Skip if signUpWithEmail already called createSession manually
        if (skipNextAuthChange.current) {
          skipNextAuthChange.current = false;
        } else {
          await createSession(firebaseUser);
        }
        setGoogleLoading(false);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [createSession]);

  /**
   * Google Sign-In — always tries popup first (works on all platforms).
   * Falls back to redirect only if popup is blocked (rare on modern browsers).
   * Popup is preferred because authDomain (Firebase’s domain) handles the OAuth
   * calls, avoiding GCP API-key referrer restrictions on the Vercel domain.
   */
  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase not configured");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    setGoogleLoading(true);

    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged handles session creation + setGoogleLoading(false)
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || "";
      if (code === "auth/popup-blocked") {
        // Fallback to redirect if popup is blocked
        sessionStorage.setItem(GOOGLE_REDIRECT_PENDING, "1");
        await signInWithRedirect(auth, provider);
      } else {
        setGoogleLoading(false);
        throw err; // Re-throw so login page handles specific error codes
      }
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase not configured");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string
  ) => {
    if (!auth) throw new Error("Firebase not configured");
    // Set guard BEFORE creating user — onAuthStateChanged will fire
    skipNextAuthChange.current = true;
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(credential.user, { displayName: name });
    // Force token refresh so the ID token includes the updated displayName
    await credential.user.getIdToken(true);
    // Manually trigger session creation with the refreshed token
    await createSession(credential.user);
  };

  /** Send a password reset email */
  const resetPassword = async (email: string) => {
    if (!auth) throw new Error("Firebase not configured");
    await sendPasswordResetEmail(auth, email);
  };

  /** Re-create session cookie to refresh the __role cookie (e.g. after role change) */
  const refreshSession = async () => {
    if (!auth?.currentUser) return;
    await auth.currentUser.getIdToken(true);
    await createSession(auth.currentUser);
  };

  const signOut = async () => {
    // Delete server session cookie BEFORE Firebase sign-out
    // to prevent race condition where cookie lingers after sign-out
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {
      // best-effort — proceed with sign-out regardless
    }
    if (auth) await firebaseSignOut(auth);
    setUser(null);
    setRole(null);
    setSessionError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        googleLoading,
        sessionError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        resetPassword,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
