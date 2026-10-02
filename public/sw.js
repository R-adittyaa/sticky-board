// Service Worker — Pinboard PWA
const CACHE_NAME = 'pinboard-v1';
const RUNTIME_CACHE = 'pinboard-runtime-v1';

// File yang di-cache saat install (offline-ready)
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
];

// Install — precache asset utama
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Kalau gagal, skip aja (misal offline pas install)
      });
    })
  );
  self.skipWaiting();
});

// Activate — hapus cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch — strategi:
// - Navigation (HTML) → Network first, fallback ke cache
// - Static asset (JS/CSS/img) → Cache first, fallback ke network
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET & chrome-extension
  if (request.method !== 'GET') return;
  if (request.url.startsWith('chrome-extension://')) return;

  // Navigation request (HTML page)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Update cache
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(() => {
          // Offline — coba dari cache
          return caches.match(request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // Static asset — cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        // Cuma cache response yang OK
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, copy);
        });

        return response;
      });
    }).catch(() => {
      // Offline & gak ada di cache
      return new Response('Offline', { status: 503 });
    })
  );
});