// Update this version number whenever you make changes
const CACHE_VERSION = "v2.1.1";
const CACHE_NAME = `study-notes-${CACHE_VERSION}`;

const urlsToCache = ["/", "/index.html", "/styles.css", "/manifest.json"];

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()), // Activate immediately
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()), // Take control immediately
  );
});

// Fetch event - Stale-while-revalidate strategy for better UX
self.addEventListener("fetch", (event) => {
  // Only handle http and https requests
  if (!event.request.url.startsWith("http")) {
    return;
  }

  // Never cache app.js or JSON files - always fetch fresh to avoid stale code/data
  if (event.request.url.includes("/app.js") || event.request.url.endsWith(".json")) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" }).catch(() => {
        if (event.request.url.includes("/app.js")) {
          return new Response("console.error('Failed to load app.js')", {
            headers: { "Content-Type": "application/javascript" },
          });
        }
        return new Response("null", {
          headers: { "Content-Type": "application/json" },
        });
      }),
    );
    return;
  }

  // Stale-while-revalidate: serve from cache immediately, update cache in background
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Only cache successful responses
          if (networkResponse && networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, return cached response if available
          return cachedResponse;
        });

      // Return cached response immediately if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
