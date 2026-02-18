"use client";

import { useEffect, useCallback, useRef } from "react";

/**
 * Hook that warns user about unsaved changes when navigating away.
 * @param hasUnsavedChanges - Whether the form has unsaved changes
 */
export function useUnsavedChanges(hasUnsavedChanges: boolean) {
  const hasChanges = useRef(hasUnsavedChanges);
  hasChanges.current = hasUnsavedChanges;

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (hasChanges.current) {
      e.preventDefault();
      // Modern browsers ignore custom messages but this triggers the warning
      return "";
    }
  }, []);

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);
}
