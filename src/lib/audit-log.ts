/**
 * Audit log utility — logs admin actions to Firestore.
 * Server-side only.
 */
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export interface AuditEntry {
  userId: string;
  userName: string;
  action: string;
  target: string;
  details?: string;
  timestamp?: unknown;
}

/**
 * Log an admin action to the audit_log collection.
 */
export async function logAction(
  userId: string,
  userName: string,
  action: string,
  target: string,
  details?: string
): Promise<void> {
  try {
    await adminDb.collection("audit_log").add({
      userId,
      userName,
      action,
      target,
      details: details || "",
      timestamp: FieldValue.serverTimestamp(),
    });
  } catch {
    // Silently fail — audit log should never block the main operation
    console.error("Failed to write audit log entry");
  }
}
