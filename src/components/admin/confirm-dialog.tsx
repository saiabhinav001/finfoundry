"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog for destructive / important actions.
 * Backdrop fades in first, then the dialog scales up.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop — fades in immediately */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Dialog — scales in after backdrop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.2, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-surface-raised p-8 shadow-2xl"
          >
            {/* Icon */}
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${
                danger
                  ? "bg-red-500/10 text-red-400"
                  : "bg-teal/10 text-teal-light"
              }`}
            >
              {danger ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Info className="w-5 h-5" />
              )}
            </div>

            <h3 className="font-heading font-bold text-lg text-foreground mb-2">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              {message}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] border border-white/[0.08] transition-all duration-200"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  danger
                    ? "bg-red-500/90 text-white hover:bg-red-500"
                    : "bg-teal text-white hover:bg-teal-light"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
