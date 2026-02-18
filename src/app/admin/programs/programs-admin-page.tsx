"use client";

import { useEffect, useState, useCallback } from "react";
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
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableItem } from "@/components/admin/sortable-item";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Toast, type ToastData } from "@/components/admin/toast";
import { CustomSelect } from "@/components/admin/custom-select";
import { useAuth } from "@/lib/auth-context";
import { Plus, Pencil, Trash2, X, BookOpen, ExternalLink, Copy } from "lucide-react";
import type { ProgramDoc } from "@/types/firebase";

const ICON_OPTIONS = ["TrendingUp", "BarChart3", "Wallet", "Bitcoin", "LineChart", "Building2"];

interface FormData { title: string; description: string; icon: string; }
const emptyForm: FormData = { title: "", description: "", icon: ICON_OPTIONS[0] };

export function ProgramsAdminPage() {
  const { role } = useAuth();
  const [programs, setPrograms] = useState<ProgramDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProgramDoc | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchPrograms = useCallback(async () => {
    try {
      const res = await fetch("/api/programs");
      const data = await res.json();
      if (Array.isArray(data)) setPrograms(data);
    } catch { showToast("Could not load programs.", "error"); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  const openNew = () => { setForm(emptyForm); setEditingId(null); setFormErrors({}); setShowForm(true); };
  const openEdit = (p: ProgramDoc) => { setForm({ title: p.title, description: p.description, icon: p.icon }); setEditingId(p.id || null); setFormErrors({}); setShowForm(true); };
  const duplicateProgram = (p: ProgramDoc) => { setForm({ title: `${p.title} (Copy)`, description: p.description, icon: p.icon }); setEditingId(null); setFormErrors({}); setShowForm(true); };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "Title is required";
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
      const res = await fetch("/api/programs", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(editingId ? `"${form.title}" updated!` : `"${form.title}" created!`, "success");
      setShowForm(false);
      fetchPrograms();
    } catch (err: unknown) { showToast(err instanceof Error ? err.message : "Something went wrong.", "error"); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      const res = await fetch("/api/programs", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleteTarget.id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(`"${deleteTarget.title}" deleted!`, "success");
      fetchPrograms();
    } catch (err: unknown) { showToast(err instanceof Error ? err.message : "Could not delete.", "error"); }
    setDeleteTarget(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = programs.findIndex((p) => p.id === active.id);
    const newIndex = programs.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(programs, oldIndex, newIndex);
    setPrograms(reordered);
    try {
      const orderedIds = reordered.map((p) => p.id).filter(Boolean);
      const res = await fetch("/api/reorder", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collection: "programs", orderedIds }) });
      if (!res.ok) throw new Error("Failed");
      showToast("Order saved!", "success");
    } catch { showToast("Could not save order.", "error"); fetchPrograms(); }
  };

  const isAdmin = role === "admin" || role === "super_admin";

  return (
    <div>
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">Programs</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage learning programs displayed on the website.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/programs" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200">
            <ExternalLink className="w-4 h-4" /> Preview
          </a>
          <button onClick={openNew} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold hover:bg-gold-light transition-colors duration-200">
            <Plus className="w-4 h-4" /> Add Program
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass-card rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-semibold text-lg text-foreground">{editingId ? "Edit Program" : "Add New Program"}</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition-colors duration-200"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Title <span className="text-red-400">*</span></label>
              <input value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); if (formErrors.title) setFormErrors({ ...formErrors, title: "" }); }} placeholder="e.g. Stock Market Fundamentals"
                className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200 ${formErrors.title ? "border-red-400/50" : "border-white/[0.06]"}`}/>
              {formErrors.title && <p className="text-xs text-red-400 mt-1">{formErrors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description <span className="text-red-400">*</span></label>
              <textarea value={form.description} onChange={(e) => { setForm({ ...form, description: e.target.value }); if (formErrors.description) setFormErrors({ ...formErrors, description: "" }); }} rows={3} placeholder="What this program covers..."
                className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors resize-none ${formErrors.description ? "border-red-400/50" : "border-white/[0.06]"}`}/>
              {formErrors.description && <p className="text-xs text-red-400 mt-1">{formErrors.description}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Icon</label>
              <CustomSelect value={form.icon} options={ICON_OPTIONS.map((i) => ({ value: i, label: i }))} onChange={(val) => setForm({ ...form, icon: val })} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-8">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-light disabled:opacity-50 transition-colors duration-200">
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Program"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-teal/30 border-t-teal animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading programs...</p>
        </div>
      ) : programs.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-teal/[0.06] flex items-center justify-center mx-auto mb-4"><BookOpen className="w-6 h-6 text-teal-light/40" /></div>
          <p className="text-foreground font-medium">No programs yet</p>
          <p className="text-muted-foreground/60 text-sm mt-1 mb-4">Create your first program to get started.</p>
          <button onClick={openNew} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-light transition-colors duration-200"><Plus className="w-4 h-4" /> Add First Program</button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={programs.map((p) => p.id || "")} strategy={verticalListSortingStrategy}>
            <div className="grid gap-4">
              {programs.map((program) => (
                <SortableItem key={program.id} id={program.id || ""} className="glass-card rounded-2xl">
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold text-foreground">{program.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{program.description}</p>
                      <p className="text-xs text-muted-foreground/50 mt-1">Icon: {program.icon}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => duplicateProgram(program)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-white/[0.06] transition-all duration-200" title="Duplicate">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(program)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-white/[0.06] transition-all duration-200">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      {isAdmin && (
                        <button onClick={() => setDeleteTarget(program)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] border border-white/[0.06] transition-all duration-200">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {programs.length > 1 && (
        <p className="text-xs text-muted-foreground/40 text-center mt-4">↕ Drag programs to reorder · Order is saved automatically and reflected on the website</p>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete Program?" message={`This will permanently delete "${deleteTarget?.title}".`} confirmLabel="Yes, Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
