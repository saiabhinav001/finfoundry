"use client";

import { useEffect, useState, useMemo } from "react";
import { Toast, type ToastData } from "@/components/admin/toast";
import { Activity, Search, Filter, Calendar } from "lucide-react";

interface AuditEntry {
  id: string;
  action: string;
  target: string;
  userId: string;
  userName: string;
  email?: string;
  timestamp: string;
  details?: string;
}

export function ActivityPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  useEffect(() => {
    fetch("/api/audit")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setEntries(data); })
      .catch(() => showToast("Could not load activity log.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const actionTypes = useMemo(() => {
    const set = new Set(entries.map((e) => e.action));
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    let result = entries;
    if (filterAction !== "all") result = result.filter((e) => e.action === filterAction);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) => (e.userName || e.email || "").toLowerCase().includes(q) || e.action.toLowerCase().includes(q) || (e.target && e.target.toLowerCase().includes(q)) || (e.details && e.details.toLowerCase().includes(q)));
    }
    if (dateFrom) result = result.filter((e) => e.timestamp >= dateFrom);
    if (dateTo) {
      const end = dateTo + "T23:59:59";
      result = result.filter((e) => e.timestamp <= end);
    }
    return result;
  }, [entries, filterAction, search, dateFrom, dateTo]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
  };

  const formatAction = (action: string) => action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const actionColorMap: Record<string, string> = { create: "text-emerald-400 bg-emerald-500/10", update: "text-teal-300 bg-teal-500/10", delete: "text-red-400 bg-red-500/10", reorder: "text-gold bg-gold/10", login: "text-blue-400 bg-blue-500/10" };
  const getActionColor = (action: string) => {
    const key = Object.keys(actionColorMap).find((k) => action.toLowerCase().includes(k));
    return key ? actionColorMap[key] : "text-muted-foreground bg-white/[0.04]";
  };

  return (
    <div>
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">Activity Log</h1>
          <p className="text-muted-foreground text-sm mt-1">Audit trail of all admin actions.</p>
        </div>
        <span className="text-xs text-muted-foreground/40">{entries.length} total entries</span>
      </div>

      {/* Filters */}
      {entries.length > 0 && (
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search user, action, details..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"/>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 hidden md:block" />
            <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground text-sm focus:outline-none focus:border-teal/30 appearance-none cursor-pointer">
              <option value="all">All Actions</option>
              {actionTypes.map((a) => (<option key={a} value={a}>{formatAction(a)}</option>))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 hidden md:block" />
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground text-sm focus:outline-none focus:border-teal/30 [color-scheme:dark]"/>
            <span className="text-xs text-muted-foreground/40">to</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground text-sm focus:outline-none focus:border-teal/30 [color-scheme:dark]"/>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-teal/30 border-t-teal animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading activity log...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-teal/[0.06] flex items-center justify-center mx-auto mb-4"><Activity className="w-6 h-6 text-teal-light/40" /></div>
          <p className="text-foreground font-medium">No activity yet</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Admin actions will be recorded here.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl">
          <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No entries match your filters.</p>
          <button onClick={() => { setSearch(""); setFilterAction("all"); setDateFrom(""); setDateTo(""); }} className="text-teal-light text-sm mt-2 hover:underline">Clear all filters</button>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((entry) => (
              <div key={entry.id} className="p-4 md:p-5 hover:bg-white/[0.02] transition-colors duration-150">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase ${getActionColor(entry.action)}`}>{formatAction(entry.action)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground/90 break-words">{entry.target || entry.details || "—"}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                        <span className="text-xs text-muted-foreground/50">by</span>
                        <span className="text-xs text-teal-light/70 font-medium truncate max-w-[200px]">{entry.userName || entry.email || "Unknown"}</span>
                        <span className="text-xs text-muted-foreground/40 sm:hidden">&middot; {formatDate(entry.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground/50 shrink-0 whitespace-nowrap hidden sm:block">{formatDate(entry.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
