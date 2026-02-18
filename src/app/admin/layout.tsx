"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { OnboardingProvider } from "@/lib/onboarding-context";
import { TourOverlay } from "@/components/admin/tour/tour-overlay";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-teal/30 border-t-teal animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isAllowed = role === "editor" || role === "admin" || role === "super_admin";
  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <h2 className="font-heading text-xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm mb-4">You don&apos;t have permission to access the admin panel. Contact an admin to request access.</p>
          <button onClick={() => router.push("/")} className="px-5 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-light transition-colors">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-background">
        <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        {/* Mobile header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#0a0f1a]/90 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all">
              <Menu className="w-5 h-5" />
            </button>
            <p className="text-sm font-bold text-foreground">FinFoundry Admin</p>
            <div className="w-9" /> {/* spacer */}
          </div>
        </header>

        {/* Main */}
        <main className="lg:ml-64 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 lg:pt-8">
            {children}
          </div>
        </main>

        {/* Tour spotlight overlay */}
        <TourOverlay />
      </div>
    </OnboardingProvider>
  );
}
