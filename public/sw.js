/* ═══════════════════════════════════════════════════════════════════
 * FinFoundry Service Worker v3.0 — Offline-first PWA support
 *
 * Caches a self-contained offline.html + icons so the app degrades
 * gracefully when the user has no internet connection.
 *
 * Strategy:
 *   - Install: precache /offline.html (self-contained, zero deps) + icons
 *   - Activate: clean old caches
 *   - Fetch (navigate): network-first, fall back to /offline.html
 *   - Fetch (JS/CSS): stale-while-revalidate
 *   - Fetch (other): network-only (Next.js handles its own caching)
 * ═══════════════════════════════════════════════════════════════════ */

const CACHE_NAME = "finfoundry-offline-v3";
const OFFLINE_URL = "/offline.html";
const ASSET_CACHE = "finfoundry-assets-v2";

const PRECACHE = [OFFLINE_URL, "/icon-192x192.png", "/icon-512x512.png"];

/* ── Install ─────────────────────────────────────── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate & clean old caches ────────────────── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== ASSET_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
      .then(() =>
        // Notify all open tabs to refresh so they pick up the new SW
        self.clients.matchAll({ type: "window" }).then((clients) =>
          clients.forEach((client) => client.navigate(client.url))
        )
      )
  );
});

/* ── Fetch ─────────────────────────────────────── */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Navigation requests: network-first, fallback to /offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((cached) =>
          cached || new Response("Offline", { status: 503 })
        )
      )
    );
    return;
  }

  // JS/CSS assets from same origin: stale-while-revalidate
  // This ensures the offline page's JS bundles are cached after first visit
  if (
    url.origin === self.location.origin &&
    (url.pathname.endsWith(".js") || url.pathname.endsWith(".css")) &&
    url.pathname.includes("/_next/")
  ) {
    event.respondWith(
      caches.open(ASSET_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
            .then((response) => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cached);

          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Everything else: network-only
});
