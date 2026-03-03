/**
 * Persistent data cache for API route responses (v2.0).
 *
 * Uses Next.js `unstable_cache` backed by Vercel's Data Cache, which
 * persists across serverless cold starts (unlike the old in-memory Map).
 *
 * Each collection has a dedicated cache tag for on-demand invalidation:
 *   - `revalidateTag("events")` instantly purges the events cache
 *   - TTL fallback: data auto-refreshes every 10 minutes even without
 *     an explicit invalidation call
 *
 * Expected Firestore reads:  ~0 per request (served from Data Cache)
 *   Reads only happen on first request after a revalidation.
 *   With 6 collections refreshing every 10 min = 864 reads/day MAX.
 *   With on-demand-only revalidation = ~20 reads/day.
 */

import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

const DEFAULT_REVALIDATE_SECONDS = 600; // 10 minutes

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
