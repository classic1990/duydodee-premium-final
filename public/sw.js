const CACHE_NAME = 'duydee-master-v1';
const ASSETS = [
  '/',
  '/css/output.css',
  '/css/fonts.css',
  '/assets/logo/DUYDODEE.png',
  'https://unpkg.com/lucide@0.410.0'
];

// 🛠️ Install Event - Caching basic assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(err => null))
      );
    })
  );
  self.skipWaiting();
});

// 🚀 Activate Event - Cleanup old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// 📡 Fetch Event - Network First with Cache Fallback
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  // Check if the request is for a font file
  const isFont = url.pathname.endsWith('.woff2');

  // Only handle same-origin assets or specific trusted CDNs
  const isSameOrigin = url.origin === self.location.origin;
  const isTrustedCDN = url.hostname === 'cdnjs.cloudflare.com';
  if (!isSameOrigin && !isTrustedCDN) return;

  // Strategy: Cache First for Fonts (more permanent)
  if (isFont) {
    e.respondWith(
      caches.match(e.request).then(cachedResponse => {
        // Return cached response if found, otherwise fetch from network
        return cachedResponse || fetch(e.request);
      })
    );
    return; // Stop processing for fonts
  }

  // Strategy: Stale-While-Revalidate for other Assets & CDNs
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, cacheCopy));
        }
        return networkResponse;
      }).catch(() => null);
      return cachedResponse || fetchPromise;
    })
  );
});

// 🔔 Background Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'DUYดูDEE-HD', body: 'มีหนังใหม่เข้าแล้วนะ!' };

  const options = {
    body: data.body,
    icon: '/assets/logo/DUYDODEE.png',
    badge: '/assets/logo/DUYDODEE.png',
    data: { url: data.url || '/' }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
