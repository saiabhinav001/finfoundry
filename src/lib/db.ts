/**
 * Server-side cached data fetchers (v1.0).
 *
 * Called ONLY from Server Components (page.tsx files).
 * Uses Next.js `unstable_cache` backed by Vercel's Data Cache
 * — persists across serverless cold starts.
 *
 * Architecture:
 *   - Tag-based invalidation: admin mutations call invalidateCache()
 *     which triggers revalidateTag() → data cache + page cache purge
 *   - 1-hour TTL safety net (mutations trigger instant revalidation)
 *   - Eliminates the old pattern: useEffect → fetch("/api/...") → Firestore
 *   - Public pages now render data at build/ISR time (zero client reads)
 *
 * Expected Firestore reads (1000 daily users, ~30 mutations/month):
 *   ~5,000 reads/month — 0.3% of Spark 1.5M limit
 */

import { unstable_cache } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";

/* ── About ─────────────────────────────────────────────────── */

export const getAboutData = unstable_cache(
  async () => {
    const doc = await adminDb.collection("about").doc("content").get();
    if (!doc.exists) return null;
    const d = doc.data()!;
    return {
      values: Array.isArray(d.values) ? d.values : null,
      milestones: Array.isArray(d.milestones) ? d.milestones : null,
      mission: Array.isArray(d.mission) ? d.mission : null,
      stats: Array.isArray(d.stats) ? d.stats : null,
    };
  },
  ["db-about"],
  { tags: ["about"], revalidate: 3600 }
);

/* ── Events ────────────────────────────────────────────────── */

export const getEvents = unstable_cache(
  async () => {
    const snap = await adminDb
      .collection("events")
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        title: (d.title as string) ?? "",
        date: (d.date as string) ?? "",
        type: (d.type as string) ?? "",
        status: (d.status as string) ?? "upcoming",
        description: (d.description as string) ?? "",
        venue: (d.venue as string) ?? "",
        time: (d.time as string) ?? "",
        registrationLink: (d.registrationLink as string) ?? "",
        imageURL: (d.imageURL as string) ?? "",
      };
    });
  },
  ["db-events"],
  { tags: ["events"], revalidate: 1800 }
);

/* ── Programs ──────────────────────────────────────────────── */

export const getPrograms = unstable_cache(
  async () => {
    const snap = await adminDb
      .collection("programs")
      .orderBy("order", "asc")
      .get();
    return snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        title: (d.title as string) ?? "",
        description: (d.description as string) ?? "",
        icon: (d.icon as string) ?? "TrendingUp",
      };
    });
  },
  ["db-programs"],
  { tags: ["programs"], revalidate: 3600 }
);

/* ── Team (public — visible members only) ──────────────────── */

export const getTeamMembers = unstable_cache(
  async () => {
    const snap = await adminDb
      .collection("team")
      .orderBy("order", "asc")
      .get();
    return snap.docs
      .filter((doc) => doc.data().visible !== false)
      .map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          name: (d.name as string) ?? "",
          role: (d.role as string) ?? "",
          image: (d.image as string) ?? "",
          linkedin: (d.linkedin as string) ?? "",
          batch: (d.batch as string) ?? "",
          category: ((d.category as string) ?? "member") as
            | "core_committee"
            | "team_head"
            | "member",
        };
      });
  },
  ["db-team"],
  { tags: ["team"], revalidate: 3600 }
);

/* ── Resources ─────────────────────────────────────────────── */

export const getResources = unstable_cache(
  async () => {
    const snap = await adminDb
      .collection("resources")
      .orderBy("order", "asc")
      .get();
    return snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        category: (d.category as string) ?? "",
        items: Array.isArray(d.items)
          ? (d.items as { title: string; author: string; description: string }[])
          : [],
      };
    });
  },
  ["db-resources"],
  { tags: ["resources"], revalidate: 3600 }
);

/* ── Settings (social links, club config) ──────────────────── */

export const getSettings = unstable_cache(
  async () => {
    const doc = await adminDb.collection("settings").doc("site").get();
    if (!doc.exists) return null;
    const d = doc.data()!;
    return {
      clubName: (d.clubName as string) ?? "",
      tagline: (d.tagline as string) ?? "",
      heroTagline: (d.heroTagline as string) ?? "",
      email: (d.email as string) ?? "",
      instagram: (d.instagram as string) ?? "",
      linkedin: (d.linkedin as string) ?? "",
      whatsapp: (d.whatsapp as string) ?? "",
      registrationLink: (d.registrationLink as string) ?? "",
      logoUrl: (d.logoUrl as string) ?? "",
    };
  },
  ["db-settings"],
  { tags: ["settings"], revalidate: 3600 }
);
