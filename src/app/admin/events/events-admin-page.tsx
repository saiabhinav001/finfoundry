"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Toast, type ToastData } from "@/components/admin/toast";
import { CustomSelect } from "@/components/admin/custom-select";
import { ImageUpload } from "@/components/admin/image-upload";
import { useAuth } from "@/lib/auth-context";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Calendar,
  Search,
  Filter,
  ExternalLink,
  Copy,
  CheckSquare,
  Square,
} from "lucide-react";
import type { EventDoc } from "@/types/firebase";

const EVENT_TYPES = ["Competition", "Workshop", "Guest Lecture", "Conference", "Bootcamp"];
const EVENT_STATUSES = ["upcoming", "ongoing", "completed"];

interface FormData {
  title: string;
  date: string;
  type: string;
  status: string;
  description: string;
  imageURL: string;
  venue: string;
  time: string;
  registrationLink: string;
}

const emptyForm: FormData = {
  title: "", date: "", type: EVENT_TYPES[0], status: "upcoming",
  description: "", imageURL: "", venue: "", time: "", registrationLink: "",
};

export function EventsAdminPage() {
  const { role } = useAuth();
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EventDoc | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (Array.isArray(data)) setEvents(data);
    } catch { showToast("Could not load events.", "error"); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    let result = events;
    if (filterStatus !== "all") result = result.filter((e) => e.status === filterStatus);
    if (filterType !== "all") result = result.filter((e) => e.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || (e.venue && e.venue.toLowerCase().includes(q)));
    }
    return result;
  }, [events, filterStatus, filterType, search]);

  const eventTypes = useMemo(() => [...new Set(events.map((e) => e.type).filter(Boolean))], [events]);

  const openNew = () => { setForm(emptyForm); setEditingId(null); setFormErrors({}); setShowForm(true); };
  const openEdit = (event: EventDoc) => {
    setForm({ title: event.title, date: event.date, type: event.type, status: event.status, description: event.description, imageURL: event.imageURL || "", venue: event.venue || "", time: event.time || "", registrationLink: event.registrationLink || "" });
    setEditingId(event.id || null);
    setFormErrors({});
    setShowForm(true);
  };

  const duplicateEvent = (event: EventDoc) => {
    setForm({ title: `${event.title} (Copy)`, date: "", type: event.type, status: "upcoming", description: event.description, imageURL: event.imageURL || "", venue: event.venue || "", time: event.time || "", registrationLink: "" });
    setEditingId(null);
    setFormErrors({});
    setShowForm(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.date.trim()) errors.date = "Date is required";
    if (!form.description.trim()) errors.description = "Description is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, ...form } : form;
      const res = await fetch("/api/events", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(editingId ? `"${form.title}" updated!` : `"${form.title}" created!`, "success");
      setShowForm(false);
      setEditingId(null);
      fetchEvents();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Something went wrong.", "error");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      const res = await fetch("/api/events", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleteTarget.id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(`"${deleteTarget.title}" deleted!`, "success");
      fetchEvents();
    } catch (err: unknown) { showToast(err instanceof Error ? err.message : "Could not delete event.", "error"); }
    setDeleteTarget(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEvents.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredEvents.map((e) => e.id).filter(Boolean) as string[]));
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    let deleted = 0;
    for (const id of selectedIds) {
      try { const res = await fetch("/api/events", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); if (res.ok) deleted++; } catch { /* continue */ }
    }
    showToast(`${deleted} event${deleted !== 1 ? "s" : ""} deleted.`, "success");
    setSelectedIds(new Set()); setShowBulkConfirm(false); setBulkDeleting(false); fetchEvents();
  };

  const isAdmin = role === "admin" || role === "super_admin";

  return (
    <div>
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">Events</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Add, edit, or remove events shown on the website.{" "}
            {events.length > 0 && <span className="text-foreground/60">{events.length} event{events.length !== 1 ? "s" : ""}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/events" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200">
            <ExternalLink className="w-4 h-4" /> Preview
          </a>
          <button onClick={openNew} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold hover:bg-gold-light transition-colors duration-200">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-semibold text-lg text-foreground">{editingId ? "Edit Event" : "Add New Event"}</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition-colors duration-200"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Title <span className="text-red-400">*</span></label>
              <input value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); if (formErrors.title) setFormErrors({ ...formErrors, title: "" }); }} placeholder="e.g. FinQuest 2025"
                className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200 ${formErrors.title ? "border-red-400/50" : "border-white/[0.06]"}`}/>
              {formErrors.title && <p className="text-xs text-red-400 mt-1">{formErrors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Date <span className="text-red-400">*</span></label>
              <input type="date" value={form.date} onChange={(e) => { setForm({ ...form, date: e.target.value }); if (formErrors.date) setFormErrors({ ...formErrors, date: "" }); }}
                className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-foreground text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200 [color-scheme:dark] ${formErrors.date ? "border-red-400/50" : "border-white/[0.06]"}`}/>
              {formErrors.date && <p className="text-xs text-red-400 mt-1">{formErrors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Type</label>
              <CustomSelect value={form.type} options={EVENT_TYPES.map((t) => ({ value: t, label: t }))} onChange={(val) => setForm({ ...form, type: val })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <CustomSelect value={form.status} options={EVENT_STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} onChange={(val) => setForm({ ...form, status: val })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Time (optional)</label>
              <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="e.g. 10:00 AM - 4:00 PM"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Venue (optional)</label>
              <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="e.g. CBIT Seminar Hall"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Registration Link (optional)</label>
              <input value={form.registrationLink} onChange={(e) => setForm({ ...form, registrationLink: e.target.value })} placeholder="https://forms.google.com/..."
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"/>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Description <span className="text-red-400">*</span></label>
              <textarea value={form.description} onChange={(e) => { setForm({ ...form, description: e.target.value }); if (formErrors.description) setFormErrors({ ...formErrors, description: "" }); }} rows={3} placeholder="Brief description of the event..."
                className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors resize-none ${formErrors.description ? "border-red-400/50" : "border-white/[0.06]"}`}/>
              {formErrors.description && <p className="text-xs text-red-400 mt-1">{formErrors.description}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Event Image (optional)</label>
              <ImageUpload value={form.imageURL} folder="events" onChange={(url) => setForm({ ...form, imageURL: url })} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-8">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-light disabled:opacity-50 transition-colors duration-200">
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      {events.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"/>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground/50" />
            {/* Status pills */}
            <button onClick={() => setFilterStatus("all")} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === "all" ? "bg-teal/20 text-teal-light border border-teal/30" : "text-muted-foreground hover:text-foreground bg-white/[0.03] border border-white/[0.06]"}`}>All</button>
            {EVENT_STATUSES.map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filterStatus === s ? "bg-teal/20 text-teal-light border border-teal/30" : "text-muted-foreground hover:text-foreground bg-white/[0.03] border border-white/[0.06]"}`}>{s}</button>
            ))}
          </div>
          {eventTypes.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button onClick={() => setFilterType("all")} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === "all" ? "bg-gold/20 text-gold border border-gold/30" : "text-muted-foreground hover:text-foreground bg-white/[0.03] border border-white/[0.06]"}`}>All Types</button>
              {eventTypes.map((t) => (
                <button key={t} onClick={() => setFilterType(t)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === t ? "bg-gold/20 text-gold border border-gold/30" : "text-muted-foreground hover:text-foreground bg-white/[0.03] border border-white/[0.06]"}`}>{t}</button>
              ))}
            </div>
          )}
          {isAdmin && filteredEvents.length > 0 && (
            <button onClick={toggleSelectAll} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground bg-white/[0.03] border border-white/[0.06] transition-all duration-200 shrink-0">
              {selectedIds.size === filteredEvents.length ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select"}
            </button>
          )}
        </div>
      )}

      {/* Bulk bar */}
      {selectedIds.size > 0 && isAdmin && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-red-500/[0.04] border border-red-500/[0.1]">
          <span className="text-sm text-foreground/80">{selectedIds.size} selected</span>
          <button onClick={() => setShowBulkConfirm(true)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm text-red-400 hover:bg-red-500/[0.08] border border-red-500/[0.15] transition-all duration-200">
            <Trash2 className="w-3.5 h-3.5" /> Delete Selected
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear</button>
        </div>
      )}

      {/* Events List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-teal/30 border-t-teal animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-teal/[0.06] flex items-center justify-center mx-auto mb-4"><Calendar className="w-6 h-6 text-teal-light/40" /></div>
          <p className="text-foreground font-medium">No events yet</p>
          <p className="text-muted-foreground/60 text-sm mt-1 mb-4">Create your first event to get started.</p>
          <button onClick={openNew} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-light transition-colors duration-200"><Plus className="w-4 h-4" /> Add First Event</button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl">
          <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No events match your filters.</p>
          <button onClick={() => { setSearch(""); setFilterStatus("all"); setFilterType("all"); }} className="text-teal-light text-sm mt-2 hover:underline">Clear filters</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              {isAdmin && (
                <button onClick={() => toggleSelect(event.id || "")} className="shrink-0 text-muted-foreground/40 hover:text-teal-light transition-colors self-start mt-1">
                  {selectedIds.has(event.id || "") ? <CheckSquare className="w-4 h-4 text-teal-light" /> : <Square className="w-4 h-4" />}
                </button>
              )}
              {event.imageURL && (
                <img src={event.imageURL} alt={event.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-heading font-semibold text-foreground">{event.title}</h3>
                  <span className={`inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full border capitalize ${
                    event.status === "upcoming" ? "text-teal-light/90 bg-teal/[0.06] border-teal/[0.1]"
                    : event.status === "ongoing" ? "text-gold/90 bg-gold/[0.06] border-gold/[0.1]"
                    : "text-muted-foreground bg-white/[0.03] border-white/[0.06]"
                  }`}>{event.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">{event.date} · {event.type}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => duplicateEvent(event)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-white/[0.06] transition-all duration-200" title="Duplicate">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => openEdit(event)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-white/[0.06] transition-all duration-200">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                {isAdmin && (
                  <button onClick={() => setDeleteTarget(event)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] border border-white/[0.06] transition-all duration-200">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete Event?" message={`This will permanently delete "${deleteTarget?.title}". This cannot be undone.`} confirmLabel="Yes, Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      <ConfirmDialog open={showBulkConfirm} title={`Delete ${selectedIds.size} Events?`} message={`This will permanently delete ${selectedIds.size} event${selectedIds.size !== 1 ? "s" : ""}. This cannot be undone.`} confirmLabel={bulkDeleting ? "Deleting..." : "Yes, Delete All"} danger onConfirm={handleBulkDelete} onCancel={() => setShowBulkConfirm(false)} />
    </div>
  );
}
