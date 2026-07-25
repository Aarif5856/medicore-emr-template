/**
 * MediCore EMR — service worker
 *
 * Written by hand instead of using vite-plugin-pwa: this app is a TanStack
 * Start + nitro SSR build, so there is no static index.html to precache and
 * the plugin's generateSW step does not fit the nitro output pipeline.
 *
 * Strategy:
 *   - navigations      → network-first, fall back to cached shell, then /offline.html
 *   - /assets/* (hashed) → cache-first (immutable, safe to keep forever)
 *   - icons / manifest → stale-while-revalidate
 *
 * Bump CACHE_VERSION on every release so old caches are evicted.
 */

const CACHE_VERSION = "medicore-v1";
const PRECACHE = `${CACHE_VERSION}-precache`;
const RUNTIME = `${CACHE_VERSION}-runtime`;

const PRECACHE_URLS = [
  "/offline.html",
  "/favicon.svg",
  "/pwa-192x192.png",
  "/pwa-512x512.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle same-origin GETs. Google Fonts, analytics etc. go straight to
  // the network so we never cache a third-party opaque response.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 1. Page navigations — network-first so SSR content stays fresh.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match("/offline.html");
        }),
    );
    return;
  }

  // 2. Hashed build assets — cache-first, they never change under one URL.
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(RUNTIME).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
    return;
  }

  // 3. Everything else same-origin — stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(RUNTIME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
