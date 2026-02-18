"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function SortableItem({ id, children, className = "" }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: transition || "transform 200ms cubic-bezier(0.25, 1, 0.5, 1)",
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : "auto" as const,
    scale: isDragging ? "1.02" : "1",
    boxShadow: isDragging
      ? "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(52,211,153,0.15)"
      : "none",
    borderRadius: isDragging ? "16px" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative ${className}`} {...attributes}>
      <button
        type="button"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-white/[0.04] cursor-grab active:cursor-grabbing transition-colors duration-200"
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="pl-10">
        {children}
      </div>
    </div>
  );
}

/** Inline sortable row for flat lists (milestones, stats, values) */
interface SortableRowProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function SortableRow({ id, children, className = "" }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: transition || "transform 200ms cubic-bezier(0.25, 1, 0.5, 1)",
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : "auto" as const,
    boxShadow: isDragging
      ? "0 4px 16px rgba(0,0,0,0.25), 0 0 0 1px rgba(52,211,153,0.1)"
      : "none",
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 ${className}`} {...attributes}>
      <button
        type="button"
        className="p-1 rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-white/[0.04] cursor-grab active:cursor-grabbing transition-colors duration-200 shrink-0"
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      {children}
    </div>
  );
}
