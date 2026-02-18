"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableItem } from "@/components/admin/sortable-item";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Toast, type ToastData } from "@/components/admin/toast";
import { ImageUpload } from "@/components/admin/image-upload";
import { useAuth } from "@/lib/auth-context";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Filter,
  Search,
  Users,
  ExternalLink,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
} from "lucide-react";
import type { TeamMemberDoc, TeamCategory } from "@/types/firebase";

interface FormData {
  name: string;
  role: string;
  image: string;
  linkedin: string;
  batch: string;
  visible: boolean;
  category: TeamCategory;
}

const emptyForm: FormData = {
  name: "",
  role: "",
  image: "",
  linkedin: "",
  batch: new Date().getFullYear().toString(),
  visible: true,
  category: "member",
};

export function TeamAdminPage() {
  const { role: userRole } = useAuth();
  const [members, setMembers] = useState<TeamMemberDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeamMemberDoc | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [filterBatch, setFilterBatch] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const showToast = (message: string, type: "success" | "error") =>
    setToast({ message, type });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/team?all=1");
      const data = await res.json();
      if (Array.isArray(data)) setMembers(data);
    } catch {
      showToast("Could not load team members.", "error");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const batches = useMemo(() => {
    const set = new Set(members.map((m) => m.batch).filter(Boolean) as string[]);
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [members]);

  const filteredMembers = useMemo(() => {
    let result = members;
    if (filterBatch !== "all") result = result.filter((m) => m.batch === filterBatch);
    if (filterCategory !== "all") result = result.filter((m) => (m.category || "member") === filterCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          (m.batch && m.batch.includes(q))
      );
    }
    return result;
  }, [members, filterBatch, filterCategory, search]);

  const openNew = () => { setForm(emptyForm); setEditingId(null); setFormErrors({}); setShowForm(true); };
  const openEdit = (m: TeamMemberDoc) => {
    setForm({ name: m.name, role: m.role, image: m.image || "", linkedin: m.linkedin || "", batch: m.batch || "", visible: m.visible !== false, category: m.category || "member" });
    setEditingId(m.id || null);
    setFormErrors({});
    setShowForm(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.role.trim()) errors.role = "Role is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, ...form } : form;
      const res = await fetch("/api/team", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(editingId ? `"${form.name}" updated!` : `"${form.name}" added to team!`, "success");
      setShowForm(false);
      fetchMembers();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Something went wrong.", "error");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      const res = await fetch("/api/team", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleteTarget.id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(`"${deleteTarget.name}" removed.`, "success");
      fetchMembers();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Could not delete.", "error");
    }
    setDeleteTarget(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = members.findIndex((m) => m.id === active.id);
    const newIndex = members.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(members, oldIndex, newIndex);
    setMembers(reordered);
    try {
      const orderedIds = reordered.map((m) => m.id).filter(Boolean);
      const res = await fetch("/api/reorder", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collection: "team", orderedIds }) });
      if (!res.ok) throw new Error("Failed to save order");
      showToast("Order saved!", "success");
    } catch {
      showToast("Could not save order.", "error");
      fetchMembers();
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMembers.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredMembers.map((m) => m.id).filter(Boolean) as string[]));
  };
  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    let deleted = 0;
    for (const id of selectedIds) {
      try { const res = await fetch("/api/team", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); if (res.ok) deleted++; } catch { /* continue */ }
    }
    showToast(`${deleted} member${deleted !== 1 ? "s" : ""} removed.`, "success");
    setSelectedIds(new Set());
    setShowBulkConfirm(false);
    setBulkDeleting(false);
    fetchMembers();
  };

  const isAdmin = userRole === "admin" || userRole === "super_admin";
  const canDrag = filterBatch === "all" && filterCategory === "all" && !search.trim();

  const toggleVisibility = async (member: TeamMemberDoc) => {
    const newVisible = member.visible === false; // toggle: false→true, true/undefined→false
    // Optimistic update
    setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, visible: newVisible } : m));
    try {
      const res = await fetch("/api/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, visible: newVisible }),
      });
      if (!res.ok) throw new Error("Failed");
      showToast(newVisible ? `"${member.name}" is now visible` : `"${member.name}" is now hidden`, "success");
    } catch {
      showToast("Could not update visibility.", "error");
      fetchMembers();
    }
  };

  return (
    <div>
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">Team</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage team members shown on the website.{" "}
            {members.length > 0 && <span className="text-foreground/60">{members.length} member{members.length !== 1 ? "s" : ""}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/team" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200">
            <ExternalLink className="w-4 h-4" /> Preview
          </a>
          <button onClick={openNew} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold hover:bg-gold-light transition-colors duration-200">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-semibold text-lg text-foreground">{editingId ? "Edit Member" : "Add Team Member"}</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition-colors duration-200"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Name <span className="text-red-400">*</span></label>
              <input value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); if (formErrors.name) setFormErrors({ ...formErrors, name: "" }); }} placeholder="e.g. Arjun Sharma"
                className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200 ${formErrors.name ? "border-red-400/50" : "border-white/[0.06]"}`}/>
              {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Role / Position <span className="text-red-400">*</span></label>
              <input value={form.role} onChange={(e) => { setForm({ ...form, role: e.target.value }); if (formErrors.role) setFormErrors({ ...formErrors, role: "" }); }} placeholder="e.g. President"
                className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200 ${formErrors.role ? "border-red-400/50" : "border-white/[0.06]"}`}/>
              {formErrors.role && <p className="text-xs text-red-400 mt-1">{formErrors.role}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Batch / Year</label>
              <input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} placeholder="e.g. 2025"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">LinkedIn URL</label>
              <input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..."
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TeamCategory })}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200 appearance-none">
                <option value="core_committee" className="bg-[#0a0f1c]">Core Committee</option>
                <option value="team_head" className="bg-[#0a0f1c]">Team Head</option>
                <option value="member" className="bg-[#0a0f1c]">Member</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Visibility</label>
              <button type="button" onClick={() => setForm({ ...form, visible: !form.visible })}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  form.visible
                    ? "bg-teal/[0.08] border-teal/20 text-teal-light"
                    : "bg-white/[0.03] border-white/[0.06] text-muted-foreground"
                }`}>
                {form.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {form.visible ? "Visible on website" : "Hidden from website"}
              </button>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Photo</label>
              <ImageUpload value={form.image} folder="team" onChange={(url) => setForm({ ...form, image: url })} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-8">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-light disabled:opacity-50 transition-colors duration-200">
              {saving ? "Saving..." : editingId ? "Save Changes" : "Add Member"}
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      {members.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, role, or batch..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"/>
          </div>
          {batches.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-muted-foreground/50" />
              <button onClick={() => setFilterBatch("all")} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterBatch === "all" ? "bg-teal/20 text-teal-light border border-teal/30" : "text-muted-foreground hover:text-foreground bg-white/[0.03] border border-white/[0.06]"}`}>All</button>
              {batches.map((b) => (
                <button key={b} onClick={() => setFilterBatch(b)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterBatch === b ? "bg-teal/20 text-teal-light border border-teal/30" : "text-muted-foreground hover:text-foreground bg-white/[0.03] border border-white/[0.06]"}`}>{b}</button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            {[{ key: "all", label: "All Roles" }, { key: "core_committee", label: "Core Committee" }, { key: "team_head", label: "Team Head" }, { key: "member", label: "Member" }].map(({ key, label }) => (
              <button key={key} onClick={() => setFilterCategory(key)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterCategory === key ? "bg-gold/20 text-gold border border-gold/30" : "text-muted-foreground hover:text-foreground bg-white/[0.03] border border-white/[0.06]"}`}>{label}</button>
            ))}
          </div>
          {isAdmin && filteredMembers.length > 0 && (
            <button onClick={toggleSelectAll} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground bg-white/[0.03] border border-white/[0.06] transition-all duration-200 shrink-0">
              {selectedIds.size === filteredMembers.length ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
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

      {/* List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-teal/30 border-t-teal animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading team...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-teal/[0.06] flex items-center justify-center mx-auto mb-4"><Users className="w-6 h-6 text-teal-light/40" /></div>
          <p className="text-foreground font-medium">No team members yet</p>
          <p className="text-muted-foreground/60 text-sm mt-1 mb-4">Add your first team member to get started.</p>
          <button onClick={openNew} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-light transition-colors duration-200"><Plus className="w-4 h-4" /> Add First Member</button>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl">
          <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No members match your search.</p>
          <button onClick={() => { setSearch(""); setFilterBatch("all"); setFilterCategory("all"); }} className="text-teal-light text-sm mt-2 hover:underline">Clear filters</button>
        </div>
      ) : canDrag ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredMembers.map((m) => m.id || "")} strategy={rectSortingStrategy}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <SortableItem key={member.id} id={member.id || ""} className="glass-card rounded-2xl">
                  <MemberCard member={member} isAdmin={isAdmin} isSelected={selectedIds.has(member.id || "")} onToggleSelect={() => toggleSelect(member.id || "")} onEdit={() => openEdit(member)} onDelete={() => setDeleteTarget(member)} onToggleVisibility={() => toggleVisibility(member)} />
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="glass-card rounded-2xl">
              <MemberCard member={member} isAdmin={isAdmin} isSelected={selectedIds.has(member.id || "")} onToggleSelect={() => toggleSelect(member.id || "")} onEdit={() => openEdit(member)} onDelete={() => setDeleteTarget(member)} onToggleVisibility={() => toggleVisibility(member)} />
            </div>
          ))}
        </div>
      )}

      {canDrag && members.length > 1 && (
        <p className="text-xs text-muted-foreground/40 text-center mt-4">↕ Drag members to reorder · Order is saved automatically and reflected on the website</p>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Remove Team Member?" message={`This will remove "${deleteTarget?.name}" from the team.`} confirmLabel="Yes, Remove" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      <ConfirmDialog open={showBulkConfirm} title={`Delete ${selectedIds.size} Members?`} message={`This will permanently remove ${selectedIds.size} team member${selectedIds.size !== 1 ? "s" : ""}. This cannot be undone.`} confirmLabel={bulkDeleting ? "Deleting..." : "Yes, Delete All"} danger onConfirm={handleBulkDelete} onCancel={() => setShowBulkConfirm(false)} />
    </div>
  );
}

function MemberCard({ member, isAdmin, isSelected, onToggleSelect, onEdit, onDelete, onToggleVisibility }: {
  member: TeamMemberDoc; isAdmin: boolean; isSelected: boolean; onToggleSelect: () => void; onEdit: () => void; onDelete: () => void; onToggleVisibility: () => void;
}) {
  const isHidden = member.visible === false;
  const categoryLabel = member.category === "core_committee" ? "Core Committee" : member.category === "team_head" ? "Team Head" : "Member";
  const categoryColor = member.category === "core_committee" ? "bg-gold/15 text-gold border-gold/25" : member.category === "team_head" ? "bg-teal/15 text-teal-light border-teal/25" : "bg-white/[0.04] text-muted-foreground border-white/[0.06]";

  return (
    <div className={`p-5 ${isHidden ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3 mb-3">
        {isAdmin && (
          <button onClick={onToggleSelect} className="mt-0.5 shrink-0 text-muted-foreground/40 hover:text-teal-light transition-colors">
            {isSelected ? <CheckSquare className="w-4 h-4 text-teal-light" /> : <Square className="w-4 h-4" />}
          </button>
        )}
        {member.image ? (
          <img src={member.image} alt={member.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center shrink-0">
            <span className="text-teal-light font-semibold text-sm">{member.name?.charAt(0)}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-semibold text-foreground text-sm truncate">{member.name}</h3>
            {isHidden && <EyeOff className="w-3 h-3 text-muted-foreground/50 shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground">{member.role}</p>
          {member.batch && <p className="text-xs text-muted-foreground/60">Batch {member.batch}</p>}
          <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium border ${categoryColor}`}>{categoryLabel}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onToggleVisibility} title={isHidden ? "Show on website" : "Hide from website"} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 border ${isHidden ? "text-muted-foreground hover:text-teal-light hover:bg-teal/[0.04] border-white/[0.06]" : "text-teal-light/70 hover:text-muted-foreground hover:bg-white/[0.04] border-white/[0.06]"}`}>
          {isHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          {isHidden ? "Show" : "Hide"}
        </button>
        <button onClick={onEdit} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-white/[0.06] transition-all duration-200">
          <Pencil className="w-3 h-3" /> Edit
        </button>
        {isAdmin && (
          <button onClick={onDelete} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] border border-white/[0.06] transition-all duration-200">
            <Trash2 className="w-3 h-3" /> Remove
          </button>
        )}
      </div>
    </div>
  );
}
