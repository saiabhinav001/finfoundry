"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Calendar,
  BookOpen,
  FileText,
  Settings,
  MessageSquare,
  Activity,
  Info,
  LogOut,
  Shield,
  HelpCircle,
  X,
} from "lucide-react";
import { canManageUsers } from "@/lib/roles";
import { useOnboarding } from "@/lib/onboarding-context";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, tourId: "sidebar-dashboard" },
  { label: "Team", href: "/admin/team", icon: Users, tourId: "sidebar-team" },
  { label: "Events", href: "/admin/events", icon: Calendar, tourId: "sidebar-events" },
  { label: "Programs", href: "/admin/programs", icon: BookOpen, tourId: "sidebar-programs" },
  { label: "Resources", href: "/admin/resources", icon: FileText, tourId: "sidebar-resources" },
  { label: "About", href: "/admin/about", icon: Info, tourId: "sidebar-about" },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare, badgeKey: "messages" as const, tourId: "sidebar-messages" },
  { label: "Users", href: "/admin/users", icon: UserCog, tourId: "sidebar-users", adminOnly: true },
  { label: "Activity", href: "/admin/activity", icon: Activity, tourId: "sidebar-activity" },
  { label: "Settings", href: "/admin/settings", icon: Settings, tourId: "sidebar-settings" },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, signOut, role } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const { startTour, tourComplete } = useOnboarding();
  const isAdmin = role ? canManageUsers(role) : false;

  // Fetch unread message count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/contact");
        const data = await res.json();
        if (Array.isArray(data)) setUnreadCount(data.filter((m: { read: boolean }) => !m.read).length);
      } catch { /* silent */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const roleLabel = role === "super_admin" ? "Super Admin" : role === "admin" ? "Admin" : role === "editor" ? "Editor" : "Member";
  const roleColor = role === "super_admin" ? "text-gold" : role === "admin" ? "text-teal-light" : "text-muted-foreground";

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-white/[0.06]" data-tour="sidebar-header">
        <div className="flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5" onClick={onMobileClose}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal to-teal-light flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">FinFoundry</p>
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Admin Panel</p>
            </div>
          </Link>
          {/* Mobile close button */}
          <button onClick={onMobileClose} className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          // Hide admin-only items from editors
          if ("adminOnly" in item && item.adminOnly && !isAdmin) return null;
          const active = isActive(item.href);
          const badge = "badgeKey" in item && item.badgeKey === "messages" ? unreadCount : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              data-tour={item.tourId}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-teal/[0.12] text-teal-light border border-teal/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-teal-light" : "text-muted-foreground/60 group-hover:text-foreground/60"}`} />
              <span className="flex-1">{item.label}</span>
              {badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-teal text-white text-[10px] font-bold min-w-[18px] text-center">{badge > 99 ? "99+" : badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 mb-3 px-1">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal/30 to-teal-light/20 flex items-center justify-center text-xs font-bold text-teal-light">
              {user?.displayName?.[0] || user?.email?.[0] || "?"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground font-medium truncate">{user?.displayName || user?.email}</p>
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${roleColor}`}>{roleLabel}</p>
          </div>
        </div>
        {tourComplete && (
          <button
            onClick={startTour}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-teal-light hover:bg-teal/[0.06] border border-white/[0.06] transition-all duration-200 mb-2"
          >
            <HelpCircle className="w-4 h-4" /> Take a Tour
          </button>
        )}
        <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/[0.06] border border-white/[0.06] transition-all duration-200">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col fixed left-0 top-0 bottom-0 bg-[#0a0f1a]/90 backdrop-blur-xl border-r border-white/[0.06] z-40">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#0a0f1a] border-r border-white/[0.06] animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
