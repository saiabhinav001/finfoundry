"use client";

import { useEffect, useState } from "react";
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
import { SortableRow } from "@/components/admin/sortable-item";
import { Save, Plus, Trash2, Info, ExternalLink } from "lucide-react";
import { Toast, type ToastData } from "@/components/admin/toast";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

interface ValueItem { title: string; description: string; }
interface MilestoneItem { year: string; event: string; }
interface StatItem { value: string; label: string; }

const DEFAULT_MISSION = [
  "At CBIT FinFoundry, we recognize that traditional engineering curricula rarely cover financial literacy — a critical life skill. Our mission is to fill this gap by providing structured, practical financial education to every student at CBIT.",
  "From understanding how stock markets work to building professional-grade financial models, from personal wealth management to understanding macroeconomic indicators — we cover the full spectrum of financial knowledge.",
  "We don't just teach theory. Through simulated trading competitions, real-time market analysis sessions, and direct mentorship from industry professionals, our members gain practical skills that serve them throughout their careers.",
];

const DEFAULT_VALUES: ValueItem[] = [
  { title: "Financial Literacy for All", description: "We believe every engineering student deserves access to quality financial education, regardless of their branch or background." },
  { title: "Practical Over Theoretical", description: "Our programs emphasize hands-on learning through simulated trading, real case studies, and live market analysis sessions." },
  { title: "Community First", description: "FinFoundry is a peer-driven community where knowledge sharing, mentorship, and collaborative learning are at the core." },
  { title: "Industry Aligned", description: "We maintain strong connections with financial professionals and institutions to ensure our content stays relevant and practical." },
];

const DEFAULT_MILESTONES: MilestoneItem[] = [
  { year: "2022", event: "FinFoundry founded at CBIT" },
  { year: "2023", event: "First inter-college FinQuest competition" },
  { year: "2023", event: "100+ active members milestone" },
  { year: "2024", event: "Launched Market Pulse workshop series" },
  { year: "2024", event: "Partnership with industry professionals" },
  { year: "2025", event: "500+ members community" },
];

const DEFAULT_STATS: StatItem[] = [
  { value: "500+", label: "Members" },
  { value: "50+", label: "Events" },
  { value: "20+", label: "Industry Speakers" },
  { value: "3+", label: "Years" },
];

export function AboutAdminPage() {
  const [mission, setMission] = useState<string[]>(DEFAULT_MISSION);
  const [values, setValues] = useState<ValueItem[]>(DEFAULT_VALUES);
  const [milestones, setMilestones] = useState<MilestoneItem[]>(DEFAULT_MILESTONES);
  const [aboutStats, setAboutStats] = useState<StatItem[]>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useUnsavedChanges(isDirty);

  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetch("/api/about").then((res) => res.json()).then((data) => {
      if (data.mission) setMission(data.mission);
      if (data.values) setValues(data.values);
      if (data.milestones) setMilestones(data.milestones);
      if (data.stats) setAboutStats(data.stats);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markDirty = () => setIsDirty(true);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/about", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mission, values, milestones, stats: aboutStats }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("About page saved!", "success");
      setIsDirty(false);
    } catch (err: unknown) { showToast(err instanceof Error ? err.message : "Failed to save.", "error"); }
    setSaving(false);
  };

  // Milestone drag
  const handleMilestoneDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = milestones.findIndex((_, i) => `milestone-${i}` === active.id);
    const newIndex = milestones.findIndex((_, i) => `milestone-${i}` === over.id);
    setMilestones(arrayMove(milestones, oldIndex, newIndex));
    markDirty();
  };

  // Value drag
  const handleValueDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = values.findIndex((_, i) => `value-${i}` === active.id);
    const newIndex = values.findIndex((_, i) => `value-${i}` === over.id);
    setValues(arrayMove(values, oldIndex, newIndex));
    markDirty();
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-teal/30 border-t-teal animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">About Page</h1>
          <p className="text-muted-foreground text-sm mt-1">Edit the About page content shown on the website.{isDirty && <span className="text-gold ml-2">● Unsaved changes</span>}</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/about" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200">
            <ExternalLink className="w-4 h-4" /> Preview
          </a>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-background text-sm font-semibold hover:bg-gold-light disabled:opacity-50 transition-colors duration-200">
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      {/* Mission */}
      <div className="glass-card rounded-2xl p-6 md:p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2"><Info className="w-4 h-4 text-teal-light" /> Mission Statement</h2>
          <button onClick={() => { setMission([...mission, ""]); markDirty(); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-teal-light hover:bg-teal/[0.06] border border-white/[0.06] transition-all duration-200"><Plus className="w-3 h-3" /> Add Paragraph</button>
        </div>
        <div className="space-y-3">
          {mission.map((p, i) => (
            <div key={i} className="flex gap-3">
              <textarea value={p} onChange={(e) => { setMission(mission.map((m, idx) => (idx === i ? e.target.value : m))); markDirty(); }} rows={3}
                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors resize-none"/>
              <button onClick={() => { setMission(mission.filter((_, idx) => idx !== i)); markDirty(); }} className="p-2.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/[0.06] transition-all self-start"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="glass-card rounded-2xl p-6 md:p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-semibold text-lg text-foreground">By the Numbers</h2>
          <button onClick={() => { setAboutStats([...aboutStats, { value: "", label: "" }]); markDirty(); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-teal-light hover:bg-teal/[0.06] border border-white/[0.06] transition-all duration-200"><Plus className="w-3 h-3" /> Add Stat</button>
        </div>
        <div className="space-y-3">
          {aboutStats.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <input value={s.value} onChange={(e) => { setAboutStats(aboutStats.map((st, idx) => idx === i ? { ...st, value: e.target.value } : st)); markDirty(); }} placeholder="e.g. 500+"
                className="w-32 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"/>
              <input value={s.label} onChange={(e) => { setAboutStats(aboutStats.map((st, idx) => idx === i ? { ...st, label: e.target.value } : st)); markDirty(); }} placeholder="e.g. Members"
                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"/>
              <button onClick={() => { setAboutStats(aboutStats.filter((_, idx) => idx !== i)); markDirty(); }} className="p-2.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Values — Draggable */}
      <div className="glass-card rounded-2xl p-6 md:p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-semibold text-lg text-foreground">Our Values</h2>
          <button onClick={() => { setValues([...values, { title: "", description: "" }]); markDirty(); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-teal-light hover:bg-teal/[0.06] border border-white/[0.06] transition-all duration-200"><Plus className="w-3 h-3" /> Add Value</button>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleValueDragEnd}>
          <SortableContext items={values.map((_, i) => `value-${i}`)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {values.map((v, i) => (
                <SortableRow key={`value-${i}`} id={`value-${i}`} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex-1 space-y-3">
                    <input value={v.title} onChange={(e) => { setValues(values.map((val, idx) => idx === i ? { ...val, title: e.target.value } : val)); markDirty(); }} placeholder="Value title"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"/>
                    <textarea value={v.description} onChange={(e) => { setValues(values.map((val, idx) => idx === i ? { ...val, description: e.target.value } : val)); markDirty(); }} rows={2} placeholder="Value description"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors resize-none"/>
                  </div>
                  <button onClick={() => { setValues(values.filter((_, idx) => idx !== i)); markDirty(); }} className="p-2.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/[0.06] transition-all self-start"><Trash2 className="w-4 h-4" /></button>
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Milestones — Draggable */}
      <div className="glass-card rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-semibold text-lg text-foreground">Timeline Milestones</h2>
          <button onClick={() => { setMilestones([...milestones, { year: "", event: "" }]); markDirty(); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-teal-light hover:bg-teal/[0.06] border border-white/[0.06] transition-all duration-200"><Plus className="w-3 h-3" /> Add Milestone</button>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMilestoneDragEnd}>
          <SortableContext items={milestones.map((_, i) => `milestone-${i}`)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {milestones.map((m, i) => (
                <SortableRow key={`milestone-${i}`} id={`milestone-${i}`}>
                  <input value={m.year} onChange={(e) => { setMilestones(milestones.map((ms, idx) => idx === i ? { ...ms, year: e.target.value } : ms)); markDirty(); }} placeholder="2024"
                    className="w-24 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"/>
                  <input value={m.event} onChange={(e) => { setMilestones(milestones.map((ms, idx) => idx === i ? { ...ms, event: e.target.value } : ms)); markDirty(); }} placeholder="Milestone description"
                    className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors duration-200"/>
                  <button onClick={() => { setMilestones(milestones.filter((_, idx) => idx !== i)); markDirty(); }} className="p-2.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200"><Trash2 className="w-4 h-4" /></button>
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <p className="text-xs text-muted-foreground/40 mt-4">↕ Drag milestones and values to reorder</p>
      </div>
    </div>
  );
}
