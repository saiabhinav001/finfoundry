"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";

interface ExpandingSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ExpandingSearch({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: ExpandingSearchProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const clear = useCallback(() => {
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  // Close on Escape
  useEffect(() => {
    if (!focused) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onChange("");
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [focused, onChange]);

  const active = focused || !!value;

  return (
    <div className={`relative group ${className}`}>
      <div
        className={`flex items-center gap-2.5 rounded-xl border min-h-[44px] px-3.5 transition-all duration-300 ease-out ${
          active
            ? "bg-white/[0.06] border-teal/30 shadow-[0_0_0_3px_rgba(16,185,129,0.08),0_0_20px_-4px_rgba(16,185,129,0.15)]"
            : "bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05]"
        }`}
      >
        <Search
          className={`w-4 h-4 shrink-0 transition-all duration-300 ${
            active
              ? "text-teal-light drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]"
              : "text-muted-foreground/50 group-hover:text-muted-foreground/70"
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/40 py-2.5"
        />

        {value && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clear}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-white/[0.06] transition-all duration-200 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Animated underline */}
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-transparent via-teal to-transparent transition-all duration-400 ${
          active ? "w-[60%] opacity-100" : "w-0 opacity-0"
        }`}
      />
    </div>
  );
}
