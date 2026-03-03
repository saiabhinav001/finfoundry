/**
 * Persistent data cache for API route responses (v4.0).
 *
 * Uses Next.js `unstable_cache` backed by Vercel's Data Cache, which
 * persists across serverless cold starts.
 *
 * Architecture:
 *   - Admin API routes use `createCachedFetcher` for admin panel data
 *   - Public pages use server-side `db.ts` fetchers (same tag system)
 *   - `invalidateCache()` busts BOTH admin + public caches via tags
 *     and triggers ISR page rebuilds via `revalidatePath()`
 *   - 24-hour TTL safety net (mutations trigger instant invalidation)
 *
 * v4.0 changes:
 *   - Added `revalidatePath()` for ISR page rebuilds on mutation
 *   - Tag → path mapping ensures public pages update instantly
 *   - Public pages no longer fetch from API routes (server-first)
 *
 * Expected Firestore reads (1000 daily users, ~30 mutations/month):
 *   ~5,000 reads/month — 0.3% of Spark 1.5M limit
 */

import { unstable_cache } from "next/cache";
import { revalidateTag, revalidatePath } from "next/cache";

const DEFAULT_REVALIDATE_SECONDS = 86400; // 24 hours

/**
 * Create a cached data fetcher backed by Vercel's persistent Data Cache.
 * Used by admin API routes. Public pages use db.ts instead.
 */
export function createCachedFetcher<T>(
  key: string,
  fetcher: () => Promise<T>,
  tags: string[],
  revalidate = DEFAULT_REVALIDATE_SECONDS
): () => Promise<T> {
  return unstable_cache(fetcher, [key], { tags, revalidate });
}

/** Collection tag → public page paths that need ISR revalidation */
const TAG_PATHS: Record<string, string[]> = {
  about: ["/", "/about"],
  events: ["/", "/events"],
  programs: ["/", "/programs"],
  team: ["/team"],
  team_all: ["/team"],
  resources: ["/resources"],
  settings: ["/contact"],
};

/**
 * Invalidate one or more cache tags + rebuild affected public pages.
 * Call after mutations (POST / PUT / DELETE) to ensure both admin
 * panel AND public site show fresh data immediately.
 */
export function invalidateCache(...tags: string[]): void {
  const paths = new Set<string>();
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
    const tagPaths = TAG_PATHS[tag];
    if (tagPaths) tagPaths.forEach((p) => paths.add(p));
  }
  for (const p of paths) {
    revalidatePath(p);
  }
}
