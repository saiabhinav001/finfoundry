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
import { useAuth } from "@/lib/auth-context";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
  Search,
} from "lucide-react";
import type { ResourceCategoryDoc } from "@/types/firebase";

interface ItemForm { title: string; author: string; description: string; }
interface CategoryForm { category: string; items: ItemForm[]; }
const emptyItem: ItemForm = { title: "", author: "", description: "" };
const emptyCategory: CategoryForm = { category: "", items: [{ ...emptyItem }] };

export function ResourcesAdminPage() {
  const { role } = useAuth();
  const [categories, setCategories] = useState<ResourceCategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyCategory);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ResourceCategoryDoc | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [search, setSearch] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchResources = useCallback(async () => {
    try {
      const res = await fetch("/api/resources");
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch { showToast("Could not load resources.", "error"); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const filteredCategories = categories.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.category.toLowerCase().includes(q) || c.items.some((i) => i.title.toLowerCase().includes(q) || i.author.toLowerCase().includes(q));
  });

  const openNew = () => { setForm({ ...emptyCategory, items: [{ ...emptyItem }] }); setEditingId(null); setFormErrors({}); setShowForm(true); };
  const openEdit = (cat: ResourceCategoryDoc) => {
    setForm({ category: cat.category, items: cat.items.length > 0 ? cat.items.map((i) => ({ ...i })) : [{ ...emptyItem }] });
    setEditingId(cat.id || null); setFormErrors({}); setShowForm(true);
  };

  const updateItem = (index: number, field: keyof ItemForm, value: string) => {
    const newItems = [...form.items]; newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, items: newItems });
  };
  const addItem = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] });
  const removeItem = (index: number) => { if (form.items.length <= 1) return; setForm({ ...form, items: form.items.filter((_, i) => i !== index) }); };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.category.trim()) errors.category = "Category name is required";
    const validItems = form.items.filter((i) => i.title.trim());
    if (validItems.length === 0) errors.items = "Add at least one item with a title";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    const validItems = form.items.filter((i) => i.title.trim());
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, category: form.category, items: validItems } : { category: form.category, items: validItems };
      const res = await fetch("/api/resources", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(editingId ? `"${form.category}" updated!` : `"${form.category}" created!`, "success");
      setShowForm(false); fetchResources();
    } catch (err: unknown) { showToast(err instanceof Error ? err.message : "Something went wrong.", "error"); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      const res = await fetch("/api/resources", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleteTarget.id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(`"${deleteTarget.category}" deleted!`, "success"); fetchResources();
    } catch (err: unknown) { showToast(err instanceof Error ? err.message : "Could not delete.", "error"); }
    setDeleteTarget(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);
    try {
      const orderedIds = reordered.map((c) => c.id).filter(Boolean);
      const res = await fetch("/api/reorder", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collection: "resources", orderedIds }) });
      if (!res.ok) throw new Error("Failed");
      showToast("Order saved!", "success");
    } catch { showToast("Could not save order.", "error"); fetchResources(); }
  };

  const isAdmin = role === "admin" || role === "super_admin";

  return (
    <div>
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">Resources</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage resource categories and learning materials.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/resources" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200">
            <ExternalLink className="w-4 h-4" /> Preview
          </a>
          <button onClick={openNew} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold hover:bg-gold-light transition-colors duration-200">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Search */}
      {categories.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories or items..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"/>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-semibold text-lg text-foreground">{editingId ? "Edit Category" : "Add New Category"}</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition-colors duration-200"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category Name <span className="text-red-400">*</span></label>
              <input value={form.category} onChange={(e) => { setForm({ ...form, category: e.target.value }); if (formErrors.category) setFormErrors({ ...formErrors, category: "" }); }} placeholder="e.g. Personal Finance"
                className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200 ${formErrors.category ? "border-red-400/50" : "border-white/[0.06]"}`}/>
              {formErrors.category && <p className="text-xs text-red-400 mt-1">{formErrors.category}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">Items</label>
                <button onClick={addItem} className="text-xs text-teal-light hover:text-teal font-medium transition-colors duration-200">+ Add another item</button>
              </div>
              {formErrors.items && <p className="text-xs text-red-400 mb-2">{formErrors.items}</p>}
              <div className="space-y-4">
                {form.items.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground font-medium">Item {idx + 1}</span>
                      {form.items.length > 1 && (
                        <button onClick={() => removeItem(idx)} className="text-xs text-red-400/60 hover:text-red-400 transition-colors duration-200">Remove</button>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input value={item.title} onChange={(e) => updateItem(idx, "title", e.target.value)} placeholder="Title"
                        className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"/>
                      <input value={item.author} onChange={(e) => updateItem(idx, "author", e.target.value)} placeholder="Author"
                        className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"/>
                      <input value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} placeholder="Brief description"
                        className="sm:col-span-2 w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-8">
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-light disabled:opacity-50 transition-colors duration-200">
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </div>
      )}

      {/* Category List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-teal/30 border-t-teal animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading resources...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-teal/[0.06] flex items-center justify-center mx-auto mb-4"><FileText className="w-6 h-6 text-teal-light/40" /></div>
          <p className="text-foreground font-medium">No resource categories yet</p>
          <p className="text-muted-foreground/60 text-sm mt-1 mb-4">Create your first category to get started.</p>
          <button onClick={openNew} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-light transition-colors duration-200"><Plus className="w-4 h-4" /> Add First Category</button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl">
          <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No categories match your search.</p>
          <button onClick={() => setSearch("")} className="text-teal-light text-sm mt-2 hover:underline">Clear search</button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredCategories.map((c) => c.id || "")} strategy={verticalListSortingStrategy}>
            <div className="grid gap-4">
              {filteredCategories.map((cat) => (
                <SortableItem key={cat.id} id={cat.id || ""} className="glass-card rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpanded(expanded === cat.id ? null : (cat.id || null))}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors duration-200"
                  >
                    <div>
                      <h3 className="font-heading font-semibold text-foreground">{cat.category}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{cat.items.length} {cat.items.length === 1 ? "item" : "items"}</p>
                    </div>
                    {expanded === cat.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  {expanded === cat.id && (
                    <div className="px-6 pb-5 space-y-3 border-t border-white/[0.04] pt-4">
                      {cat.items.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/[0.02]">
                          <p className="text-sm font-medium text-foreground">{item.title}</p>
                          {item.author && <p className="text-xs text-muted-foreground">by {item.author}</p>}
                          {item.description && <p className="text-xs text-muted-foreground/70 mt-1">{item.description}</p>}
                        </div>
                      ))}
                      <div className="flex items-center gap-2 pt-2">
                        <button onClick={() => openEdit(cat)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-white/[0.06] transition-all duration-200">
                          <Pencil className="w-3.5 h-3.5" /> Edit Category
                        </button>
                        {isAdmin && (
                          <button onClick={() => setDeleteTarget(cat)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] border border-white/[0.06] transition-all duration-200">
                            <Trash2 className="w-3.5 h-3.5" /> Delete Category
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {categories.length > 1 && (
        <p className="text-xs text-muted-foreground/40 text-center mt-4">↕ Drag categories to reorder · Order is saved automatically and reflected on the website</p>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete Category?" message={`This will permanently delete "${deleteTarget?.category}" and all its items.`} confirmLabel="Yes, Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
