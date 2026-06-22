// ============================================================
//  Service Worker — VehicleTrack PWA
//  Caches app shell + static assets for offline use
// ============================================================

const CACHE_NAME = 'vehicletrack-v2.0.0';

// App shell files to cache on install
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/js/config.js',
  '/js/i18n.js',
  '/js/offline.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
];

// ─── INSTALL ──────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE).catch(err => {
        console.warn('[SW] Pre-cache partial failure:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE ─────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH STRATEGY ───────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and Supabase API calls — always go network for those
  if (request.method !== 'GET') return;
  if (url.hostname.includes('supabase.co')) return;

  // For navigation requests (HTML pages), use network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For JS/CDN resources: cache-first, network fallback
  if (
    url.pathname.startsWith('/js/') ||
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.hostname.includes('cdnjs.cloudflare.com')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        });
      })
    );
    return;
  }

  // Default: network-first
  event.respondWith(
    fetch(request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});

// ─── BACKGROUND SYNC ──────────────────────────────────────
// Triggered when connection is restored (requires Background Sync API)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-expenses') {
    event.waitUntil(
      // Notify all clients to trigger sync
      self.clients.matchAll().then(clients =>
        clients.forEach(client => client.postMessage({ type: 'TRIGGER_SYNC' }))
      )
    );
  }
});

// ─── PUSH NOTIFICATIONS ───────────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'VehicleTrack', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
    })
  );
});
