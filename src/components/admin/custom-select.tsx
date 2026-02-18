"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

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

  const selected = options.find((o) => o.value === value);

  const sizeClasses =
    size === "sm"
      ? "px-3 py-1.5 text-xs rounded-lg"
      : "px-4 py-3 text-sm rounded-xl";

  const dropdownItemClasses =
    size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 bg-white/[0.03] border border-white/[0.06] text-foreground focus:outline-none focus:border-teal/30 focus:ring-1 focus:ring-teal/15 transition-colors ${sizeClasses} ${
          !selected ? "text-muted-foreground/50" : ""
        }`}
      >
        <span className="truncate capitalize">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[140px] py-1 rounded-xl bg-[#151520] border border-white/[0.08] shadow-xl shadow-black/40 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full text-left capitalize transition-colors duration-100 ${dropdownItemClasses} ${
                option.value === value
                  ? "text-teal-light bg-teal/[0.08]"
                  : "text-foreground/80 hover:text-foreground hover:bg-white/[0.04]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
