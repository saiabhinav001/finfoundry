"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase/config";

export default function BootstrapPage() {
  const { user } = useAuth();
  const [secret, setSecret] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBootstrap = async () => {
    if (!user || !auth?.currentUser) {
      setResult("Error: You must be signed in first.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch("/api/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, bootstrapSecret: secret }),
      });
      const data = await res.json();
      setResult(
        res.ok
          ? `✅ ${data.message}`
          : `❌ ${data.error}`
      );
    } catch (err) {
      setResult(`❌ ${err instanceof Error ? err.message : "Request failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6 p-8 rounded-2xl bg-surface border border-white/[0.06]">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Bootstrap Super Admin
        </h1>
        {!user ? (
          <p className="text-muted-foreground text-sm">
            You must{" "}
            <a href="/login" className="text-teal-light underline hover:text-teal transition-colors duration-200">
              sign in
            </a>{" "}
            first.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="text-foreground font-medium">{user.email}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Bootstrap Secret
              </label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Paste your BOOTSTRAP_SECRET"
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-white/[0.08] text-foreground text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"
              />
            </div>
            <button
              onClick={handleBootstrap}
              disabled={loading || !secret}
              className="w-full px-6 py-2.5 text-sm font-semibold rounded-lg bg-gold text-background hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? "Processing..." : "Make Me Super Admin"}
            </button>
          </>
        )}
        {result && (
          <p className="text-sm p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] break-words">
            {result}
          </p>
        )}
      </div>
    </div>
  );
}
