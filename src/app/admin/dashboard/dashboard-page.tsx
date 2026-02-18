"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Users,
  Calendar,
  BookOpen,
  FileText,
  MessageSquare,
  Activity,
  TrendingUp,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { GettingStarted } from "@/components/admin/getting-started";

interface DashboardStats {
  team: number;
  events: number;
  programs: number;
  resources: number;
  messages: number;
  unreadMessages: number;
  recentActivity: { action: string; email: string; timestamp: string }[];
}

const statCards = [
  { key: "team" as const, label: "Team Members", icon: Users, href: "/admin/team", color: "from-teal/20 to-teal/5 border-teal/20 text-teal-light" },
  { key: "events" as const, label: "Events", icon: Calendar, href: "/admin/events", color: "from-gold/20 to-gold/5 border-gold/20 text-gold" },
  { key: "programs" as const, label: "Programs", icon: BookOpen, href: "/admin/programs", color: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400" },
  { key: "resources" as const, label: "Resource Categories", icon: FileText, href: "/admin/resources", color: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400" },
];

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [teamRes, eventsRes, programsRes, resourcesRes, messagesRes, activityRes] = await Promise.all([
          fetch("/api/team").then((r) => r.json()).catch(() => []),
          fetch("/api/events").then((r) => r.json()).catch(() => []),
          fetch("/api/programs").then((r) => r.json()).catch(() => []),
          fetch("/api/resources").then((r) => r.json()).catch(() => []),
          fetch("/api/contact").then((r) => r.json()).catch(() => []),
          fetch("/api/audit").then((r) => r.json()).catch(() => []),
        ]);
        const messages = Array.isArray(messagesRes) ? messagesRes : [];
        setStats({
          team: Array.isArray(teamRes) ? teamRes.length : 0,
          events: Array.isArray(eventsRes) ? eventsRes.length : 0,
          programs: Array.isArray(programsRes) ? programsRes.length : 0,
          resources: Array.isArray(resourcesRes) ? resourcesRes.length : 0,
          messages: messages.length,
          unreadMessages: messages.filter((m: { read: boolean }) => !m.read).length,
          recentActivity: Array.isArray(activityRes) ? activityRes.slice(0, 5) : [],
        });
      } catch { /* fallback: stats remain null */ }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
    catch { return iso; }
  };
  const formatAction = (action: string) => action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-teal/30 border-t-teal animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-foreground">{greeting()}{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}!</h1>
        <p className="text-muted-foreground text-sm mt-1">Here&apos;s an overview of your FinFoundry dashboard.</p>
      </div>

      {/* Getting Started Checklist */}
      <div className="mb-8">
        <GettingStarted />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-tour="stat-cards">
        {statCards.map(({ key, label, icon: Icon, href, color }) => (
          <Link key={key} href={href} className={`glass-card rounded-2xl p-5 border bg-gradient-to-br ${color} group hover:scale-[1.02] transition-all duration-200`}>
            <div className="flex items-center justify-between mb-3">
              <Icon className="w-5 h-5 opacity-80" />
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity duration-200" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats?.[key] ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Messages */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-light/60" /> Messages
              {(stats?.unreadMessages ?? 0) > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-teal/20 text-teal-light text-[10px] font-bold">{stats?.unreadMessages} new</span>
              )}
            </h2>
            <Link href="/admin/messages" className="text-xs text-teal-light hover:underline">View all →</Link>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{stats?.messages ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-teal-light">{stats?.unreadMessages ?? 0}</p>
              <p className="text-xs text-muted-foreground">Unread</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-semibold text-foreground flex items-center gap-2"><Activity className="w-4 h-4 text-teal-light/60" /> Recent Activity</h2>
            <Link href="/admin/activity" className="text-xs text-teal-light hover:underline">View all →</Link>
          </div>
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-white/[0.04] text-muted-foreground font-medium">{formatAction(a.action)}</span>
                    <span className="text-muted-foreground/70 truncate">{a.email}</span>
                  </div>
                  <span className="text-xs text-muted-foreground/50 shrink-0">{formatDate(a.timestamp)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/50">No recent activity.</p>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 glass-card rounded-2xl p-6">
        <h2 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-teal-light/60" /> Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "View Website", href: "/", external: true },
            { label: "Manage Team", href: "/admin/team" },
            { label: "Manage Events", href: "/admin/events" },
            { label: "Site Settings", href: "/admin/settings" },
          ].map((link) => (
            link.external ? (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] text-sm text-muted-foreground hover:text-foreground transition-all duration-200">
                <ExternalLink className="w-3.5 h-3.5" /> {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] text-sm text-muted-foreground hover:text-foreground transition-all duration-200">
                <ArrowRight className="w-3.5 h-3.5" /> {link.label}
              </Link>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
