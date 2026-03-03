/**
 * Persistent data cache for API route responses (v3.0).
 *
 * Uses Next.js `unstable_cache` backed by Vercel's Data Cache, which
 * persists across serverless cold starts (unlike the old in-memory Map).
 *
 * Architecture:
 *   - 24-hour TTL safety net (data almost never hits this; mutations
 *     trigger on-demand invalidation well before expiry)
 *   - `revalidateTag("events")` instantly purges the events cache
 *   - ALL routes cached: public collections + admin-only (contact,
 *     audit, users, onboarding)
 *   - Sidebar uses lightweight count() aggregation endpoint
 *   - Audit cache is never auto-invalidated; admin triggers refresh
 *
 * Expected Firestore reads (college club, ~30 mutations/month):
 *   ~1,500–3,000 reads/month — well within Spark 50K limit.
 */

import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

const DEFAULT_REVALIDATE_SECONDS = 86400; // 24 hours

/**
 * Create a cached data fetcher backed by Vercel's persistent Data Cache.
 *
 * The returned function can be called repeatedly — it will serve cached
 * data until the TTL expires OR `invalidateCache(tag)` is called.
 *
 * IMPORTANT: The fetcher must return serializable data (plain objects,
 * arrays, primitives). Firestore snapshots must be mapped to POJOs
 * inside the fetcher.
 *
 * @param key         Unique cache key (e.g. "events", "about")
 * @param fetcher     Async function returning serializable data
 * @param tags        Cache tags for on-demand invalidation
 * @param revalidate  TTL in seconds (default: 600)
 */
export function createCachedFetcher<T>(
  key: string,
  fetcher: () => Promise<T>,
  tags: string[],
  revalidate = DEFAULT_REVALIDATE_SECONDS
): () => Promise<T> {
  return unstable_cache(fetcher, [key], { tags, revalidate });
}

/**
 * Invalidate one or more cache tags.
 * Call this after mutations (POST / PUT / DELETE) so the next
 * GET request fetches fresh data from Firestore.
 */
export function invalidateCache(...tags: string[]): void {
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }
}
