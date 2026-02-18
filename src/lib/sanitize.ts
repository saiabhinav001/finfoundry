/**
 * Input sanitization utilities for API routes.
 * Protects against XSS, injection, and oversized payloads.
 */

/**
 * Strip HTML tags from a string to prevent XSS.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Sanitize a string: strip HTML, trim whitespace, enforce max length.
 */
export function sanitize(input: string, maxLength: number = 1000): string {
  if (typeof input !== "string") return "";
  return stripHtml(input).slice(0, maxLength);
}

/**
 * Validate an email address with a standard regex.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate that a string is non-empty after trimming.
 */
export function isNonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Sanitize all string values in an object (shallow, one level deep).
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  maxLength: number = 2000
): T {
  const cleaned = { ...obj };
  for (const key of Object.keys(cleaned)) {
    const val = cleaned[key];
    if (typeof val === "string") {
      (cleaned as Record<string, unknown>)[key] = sanitize(val, maxLength);
    }
  }
  return cleaned;
}
