"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md";
}

export function CustomSelect({
  value,
  options,
  onChange,
  placeholder = "Select...",
  className = "",
  size = "md",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  const sizeClasses =
    size === "sm"
      ? "px-3 py-2 text-xs rounded-lg min-h-[36px]"
      : "px-4 py-3 text-sm rounded-xl min-h-[44px]";

  const dropdownItemClasses =
    size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 bg-white/[0.03] border border-white/[0.06] text-foreground focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-all duration-200 ${sizeClasses} ${
          !selected ? "text-muted-foreground/50" : ""
        } ${open ? "border-teal/30 ring-1 ring-teal/15 bg-white/[0.05]" : "hover:border-white/[0.12] hover:bg-white/[0.04]"}`}
      >
        <span className="truncate capitalize">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground/60 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-teal-light/60" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full min-w-[160px] py-1.5 rounded-xl bg-[#0d1128]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150">
          <div className="max-h-[240px] overflow-y-auto">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 text-left capitalize transition-all duration-100 ${dropdownItemClasses} ${
                    isSelected
                      ? "text-teal-light bg-teal/[0.1]"
                      : "text-foreground/80 hover:text-foreground hover:bg-white/[0.06]"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-teal-light shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
