"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Toast, type ToastData } from "@/components/admin/toast";
import {
  MessageSquare,
  Trash2,
  Mail,
  MailOpen,
  Search,
  CheckSquare,
  Square,
  Download,
  X,
} from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string | null;
}

export function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [search, setSearch] = useState("");
  const [filterRead, setFilterRead] = useState<"all" | "unread" | "read">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/contact");
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch { showToast("Could not load messages.", "error"); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const filteredMessages = useMemo(() => {
    let result = messages;
    if (filterRead === "unread") result = result.filter((m) => !m.read);
    if (filterRead === "read") result = result.filter((m) => m.read);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.message.toLowerCase().includes(q));
    }
    return result;
  }, [messages, filterRead, search]);

  const toggleRead = async (msg: ContactMessage) => {
    const newRead = !msg.read;
    // Optimistic: update both list & detail instantly — no refetch needed
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: newRead } : m));
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage((prev) => prev ? { ...prev, read: newRead } : prev);
    }
    try {
      const res = await fetch("/api/contact", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: msg.id, read: newRead }) });
      if (!res.ok) throw new Error("Failed");
    } catch {
      // Revert on failure
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: !newRead } : m));
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage((prev) => prev ? { ...prev, read: !newRead } : prev);
      }
      showToast("Could not update message.", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch("/api/contact", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleteTarget.id }) });
      if (!res.ok) throw new Error("Failed");
      showToast("Message deleted.", "success");
      if (selectedMessage?.id === deleteTarget.id) setSelectedMessage(null);
      fetchMessages();
    } catch { showToast("Could not delete message.", "error"); }
    setDeleteTarget(null);
  };

  const openMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      // Optimistically mark as read in local state
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
      setSelectedMessage({ ...msg, read: true });
      try {
        await fetch("/api/contact", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: msg.id, read: true }) });
      } catch { /* silent */ }
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMessages.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredMessages.map((m) => m.id)));
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    const ids = [...selectedIds];
    // Optimistically remove from UI
    setMessages((prev) => prev.filter((m) => !selectedIds.has(m.id)));
    if (selectedMessage && selectedIds.has(selectedMessage.id)) setSelectedMessage(null);
    // Fire all deletes in parallel
    const results = await Promise.allSettled(
      ids.map((id) => fetch("/api/contact", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }))
    );
    const deleted = results.filter((r) => r.status === "fulfilled").length;
    showToast(`${deleted} message${deleted !== 1 ? "s" : ""} deleted.`, "success");
    setSelectedIds(new Set()); setShowBulkConfirm(false); setBulkDeleting(false);
    fetchMessages();
  };

  const handleBulkRead = async (read: boolean) => {
    const ids = [...selectedIds];
    // Optimistic update
    setMessages((prev) => prev.map((m) => ids.includes(m.id) ? { ...m, read } : m));
    if (selectedMessage && ids.includes(selectedMessage.id)) {
      setSelectedMessage((prev) => prev ? { ...prev, read } : prev);
    }
    showToast(`Marked ${ids.length} as ${read ? "read" : "unread"}.`, "success");
    setSelectedIds(new Set());
    // Fire all patches in parallel (fire-and-forget with soft refetch)
    await Promise.allSettled(
      ids.map((id) => fetch("/api/contact", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, read }) }))
    );
    fetchMessages();
  };

  const exportCSV = () => {
    const rows = [["Name", "Email", "Subject", "Message", "Date", "Read"]];
    messages.forEach((m) => rows.push([m.name, m.email, m.subject, m.message.replace(/"/g, '""'), m.createdAt || "", m.read ? "Yes" : "No"]));
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `messages-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div>
      <Toast toast={toast} onDismiss={() => setToast(null)} />

        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">Messages</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Contact form submissions.{" "}
            {unreadCount > 0 && <span className="text-teal-light font-medium">{unreadCount} unread</span>}
          </p>
        </div>
        {messages.length > 0 && (
          <button onClick={exportCSV} className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export CSV</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      {messages.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"/>
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "unread", "read"] as const).map((f) => (
              <button key={f} onClick={() => setFilterRead(f)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filterRead === f ? "bg-teal/20 text-teal-light border border-teal/30" : "text-muted-foreground hover:text-foreground bg-white/[0.03] border border-white/[0.06]"}`}>
                {f}{f === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
              </button>
            ))}
          </div>
          <button onClick={toggleSelectAll} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground bg-white/[0.03] border border-white/[0.06] transition-all duration-200 shrink-0">
            {selectedIds.size === filteredMessages.length && filteredMessages.length > 0 ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select"}
          </button>
        </div>
      )}

      {/* Bulk bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-sm text-foreground/80">{selectedIds.size} selected</span>
          <button onClick={() => handleBulkRead(true)} className="px-3 py-1.5 rounded-lg text-xs text-teal-light hover:bg-teal/[0.06] border border-white/[0.06] transition-all">Read</button>
          <button onClick={() => handleBulkRead(false)} className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-white/[0.04] border border-white/[0.06] transition-all">Unread</button>
          <button onClick={() => setShowBulkConfirm(true)} className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/[0.06] border border-red-500/[0.15] transition-all">
            <Trash2 className="w-3 h-3 inline mr-1" /> Delete
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto">Clear</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-teal/30 border-t-teal animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-teal/[0.06] flex items-center justify-center mx-auto mb-4"><MessageSquare className="w-6 h-6 text-teal-light/40" /></div>
          <p className="text-foreground font-medium">No messages yet</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Messages from the contact form will appear here.</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl">
          <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No messages match your filters.</p>
          <button onClick={() => { setSearch(""); setFilterRead("all"); }} className="text-teal-light text-sm mt-2 hover:underline">Clear filters</button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Message List — hidden on mobile when a message is open */}
          <div className={`lg:col-span-2 space-y-2 ${selectedMessage ? "hidden lg:block" : ""}`}>
            {filteredMessages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2">
                <button onClick={() => toggleSelect(msg.id)} className="mt-4 shrink-0 text-muted-foreground/40 hover:text-teal-light transition-colors">
                  {selectedIds.has(msg.id) ? <CheckSquare className="w-3.5 h-3.5 text-teal-light" /> : <Square className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => openMessage(msg)} className={`flex-1 text-left glass-card rounded-xl p-4 transition-all hover:bg-white/[0.03] ${selectedMessage?.id === msg.id ? "border-teal/20 bg-teal/[0.03]" : ""} ${!msg.read ? "border-l-2 border-l-teal-light" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm truncate ${!msg.read ? "font-semibold text-foreground" : "text-foreground/80"}`}>{msg.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.subject}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 shrink-0 hidden sm:block">{formatDate(msg.createdAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground/70 mt-1.5 line-clamp-2">{msg.message}</p>
                </button>
              </div>
            ))}
          </div>

          {/* Detail — full-width on mobile, shown only when message selected on mobile */}
          <div className={`lg:col-span-3 ${!selectedMessage ? "hidden lg:block" : ""}`}>
            <AnimatePresence mode="wait">
              {selectedMessage ? (
                <motion.div
                  key={selectedMessage.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-card rounded-2xl p-6 md:p-8"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="font-heading font-semibold text-lg text-foreground">{selectedMessage.subject}</h2>
                      <p className="text-sm text-muted-foreground mt-1">From <span className="text-foreground font-medium">{selectedMessage.name}</span> &lt;{selectedMessage.email}&gt;</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">{formatDate(selectedMessage.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => toggleRead(selectedMessage)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all duration-200" title={selectedMessage.read ? "Mark unread" : "Mark read"}>
                        {selectedMessage.read ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setDeleteTarget(selectedMessage)} className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200"><Trash2 className="w-4 h-4" /></button>
                      <button onClick={() => setSelectedMessage(null)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all duration-200" title="Close"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="border-t border-white/[0.06] pt-6"><p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p></div>
                  <div className="mt-6 pt-4 border-t border-white/[0.06]">
                    <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-light transition-colors duration-200"><Mail className="w-4 h-4" /> Reply via Email</a>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="glass-card rounded-2xl p-8 text-center text-muted-foreground"
                >
                  <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" /><p className="text-sm">Select a message to view</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete Message?" message={`Delete the message from "${deleteTarget?.name}"? This cannot be undone.`} confirmLabel="Yes, Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      <ConfirmDialog open={showBulkConfirm} title={`Delete ${selectedIds.size} Messages?`} message={`This will permanently delete ${selectedIds.size} message${selectedIds.size !== 1 ? "s" : ""}. This cannot be undone.`} confirmLabel={bulkDeleting ? "Deleting..." : "Yes, Delete All"} danger onConfirm={handleBulkDelete} onCancel={() => setShowBulkConfirm(false)} />
    </div>
  );
}
