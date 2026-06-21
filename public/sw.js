// Accessana service worker - offline queue support + venue cache fallback.
// Version bump this string to force clients to update.
const CACHE = "accessana-sw-v1";

// ── Install: pre-cache the offline fallback page ──────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add("/offline"))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: claim all clients immediately ────────────────────
self.addEventListener("activate", (event) => {
  // Remove old cache versions
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch ──────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // 1. Next.js static assets - cache-first (content-hashed, safe forever)
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 2. Venue API responses - network-first, cache on success for offline read
  if (url.pathname.startsWith("/api/venues") && request.method === "GET") {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // 3. Navigation requests - network-first, redirect to /offline on failure
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNav(request));
    return;
  }
  // Everything else: network only (mutations, auth, etc.)
});

// ── Strategies ─────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstWithCache(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return (
      cached ??
      new Response(JSON.stringify({ error: "offline" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      })
    );
  }
}

async function networkFirstNav(request) {
  try {
    const response = await fetch(request);
    // Cache successful page responses so a second offline visit works
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Try the browser cache for this specific page
    const cached = await caches.match(request);
    if (cached) return cached;

    // Fall back to the pre-cached /offline page, carrying the original path
    // so the offline page can attempt to load venue data from IDB.
    const from = encodeURIComponent(new URL(request.url).pathname);
    const offlineRequest = new Request(`/offline?from=${from}`);
    return (
      (await caches.match("/offline")) ??
      new Response("You are offline.", { status: 503, headers: { "Content-Type": "text/plain" } })
    );
  }
}
