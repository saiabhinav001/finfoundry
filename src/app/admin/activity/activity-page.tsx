"use client";

import { useEffect, useState, useMemo } from "react";
import { Toast, type ToastData } from "@/components/admin/toast";
import { CustomSelect } from "@/components/admin/custom-select";
import { ExpandingSearch } from "@/components/admin/expanding-search";
import { Activity, Search, Filter, Calendar, Download, RefreshCw } from "lucide-react";

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

  const [refreshing, setRefreshing] = useState(false);

  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  const fetchEntries = async (refresh = false) => {
    try {
      const url = refresh ? "/api/audit?refresh=true" : "/api/audit";
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setEntries(data);
    } catch {
      showToast("Could not load activity log.", "error");
    }
  };

  useEffect(() => {
    fetchEntries()
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

  const exportCSV = () => {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const headers = ["Timestamp", "Action", "Target", "User", "Email"];
    const dataRows = filtered.map((e) => [
      e.timestamp,
      formatAction(e.action),
      e.target || e.details || "",
      e.userName || e.email || "Unknown",
      e.email || "",
    ]);
    const csv = [headers.map(esc).join(","), ...dataRows.map((r) => r.map(esc).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const actionColorMap: Record<string, string> = { create: "text-emerald-400 bg-emerald-500/10", update: "text-teal-300 bg-teal-500/10", delete: "text-red-400 bg-red-500/10", reorder: "text-gold bg-gold/10", login: "text-blue-400 bg-blue-500/10" };
  const getActionColor = (action: string) => {
    const key = Object.keys(actionColorMap).find((k) => action.toLowerCase().includes(k));
    return key ? actionColorMap[key] : "text-muted-foreground bg-white/[0.04]";
  };

  return (
    <div>
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">Activity Log</h1>
          <p className="text-muted-foreground text-sm mt-1">Audit trail of all admin actions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-xs text-muted-foreground/40 hidden sm:block">{entries.length} total entries</span>
          <button
            onClick={async () => {
              setRefreshing(true);
              await fetchEntries(true);
              setRefreshing(false);
              showToast("Activity log refreshed.", "success");
            }}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
          {filtered.length > 0 && (
            <button onClick={exportCSV} className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {entries.length > 0 && (
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <ExpandingSearch value={search} onChange={setSearch} placeholder="Search user, action, details..." className="flex-1" />
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 hidden md:block" />
            <CustomSelect
              value={filterAction}
              options={[{ value: "all", label: "All Actions" }, ...actionTypes.map((a) => ({ value: a, label: formatAction(a) }))]}
              onChange={setFilterAction}
              placeholder="All Actions"
              size="sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-2 w-full sm:flex-1 sm:min-w-[130px]">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
              <div className="relative flex-1">
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-all duration-200 [color-scheme:dark]"/>
                {!dateFrom && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/40">From date</span>}
              </div>
            </div>
            <span className="text-xs text-muted-foreground/40 text-center">to</span>
            <div className="flex items-center gap-2 w-full sm:flex-1 sm:min-w-[130px]">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 sm:hidden" />
              <div className="relative flex-1">
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-all duration-200 [color-scheme:dark]"/>
                {!dateTo && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/40">To date</span>}
              </div>
            </div>
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
