"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, X } from "lucide-react";

export interface ToastData {
  message: string;
  type: "success" | "error";
}

interface ToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

/**
 * Solid, high-contrast toast notification for admin pages.
 * Slides in from the top-right, auto-dismisses after 4s.
 */
export function Toast({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [toast, onDismiss]);

  return (
    <AnimatePresence>
      {visible && toast && (
        <motion.div
          initial={{ opacity: 0, y: -12, x: 12 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -12, x: 12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`fixed top-5 right-5 z-[400] flex items-center gap-3 pl-4 pr-3 py-3.5 rounded-xl text-sm font-medium shadow-2xl max-w-sm ${
            toast.type === "success"
              ? "bg-[#0d2d2d] text-teal-light border border-teal/40 shadow-teal/10"
              : "bg-[#2d1218] text-red-300 border border-red-500/40 shadow-red-500/10"
          }`}
          role="alert"
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-teal" />
          ) : (
            <XCircle className="w-4.5 h-4.5 shrink-0 text-red-400" />
          )}
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className="shrink-0 p-1 rounded-md hover:bg-white/[0.08] transition-colors text-current opacity-60 hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
