/**
 * 🚀 DUYดูDEE Service Worker - PWA Caching Strategy
 * Implements intelligent caching for optimal performance
 */

importScripts('/src/services/firebase-fallback.js'); // Load firebaseFallback for offline mock

const CACHE_NAME = 'duydodee-v2';
const STATIC_CACHE = 'duydodee-static-v2';
const DYNAMIC_CACHE = 'duydodee-dynamic-v2';
const IMAGE_CACHE = 'duydodee-images-v2';

// Cache expiration (in seconds)
const CACHE_EXPIRY = {
  STATIC: 7 * 24 * 60 * 60,    // 7 days
  DYNAMIC: 24 * 60 * 60,       // 1 day
  IMAGES: 30 * 24 * 60 * 60,    // 30 days
};

// URLs to precache on install. Keep this list to URLs that are guaranteed to
// return a direct 200 — `cache.addAll` rejects atomically if ANY entry 404s or
// redirects, which would fail SW installation and strand the previous worker.
// Hashed build assets (CSS/JS) are cached lazily by the fetch handler instead.
const CACHE_URLS = [
  '/',
  '/offline.html',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== IMAGE_CACHE
          ) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategy 1: Cache First for static assets (CSS, JS, images, fonts, assets)
  if (
    url.pathname.match(/\.(css|js|woff2|png|jpg|jpeg|gif|svg|ico|ttf|eot)$/) ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }

  // Strategy 2: Network First for HTML pages
  if (url.pathname.match(/\.html$/) || url.pathname === '/') {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // Strategy 3: Firebase APIs – try network first, fallback to cache/offline
  const isFirebaseRequest =
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebasestorage.googleapis.com') ||
    url.hostname.includes('www.googleapis.com'); // adjust as needed
  if (isFirebaseRequest) {
    event.respondWith(firebaseNetworkFirstStrategy(event.request));
    return;
  }

  // Default: Network First
  event.respondWith(networkFirstStrategy(event.request));
});

/**
 * Cache First Strategy - Try cache first, fallback to network
 */
async function cacheFirstStrategy(request) {
  // Determine correct cache based on file extension or path
  let cacheName = STATIC_CACHE; // default
  const url = new URL(request.url);
  const path = url.pathname.toLowerCase();

  if (path.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)) {
    cacheName = IMAGE_CACHE;
  } else if (path.match(/\.(css|js|woff2|ttf|eot)$/) || path.startsWith('/assets/')) {
    cacheName = STATIC_CACHE;
  }

  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
      // Validate cache age using Date header if available, else fall back to timestamp stored in cache metadata
      const dateHeader = cached.headers.get('date');
      if (dateHeader && isCacheValid(dateHeader, getMaxAgeForCache(cacheName))) {
        return cached;
      }
      // If no date header, we could optionally store a timestamp when caching, but for now treat as stale
    }

    const networkResponse = await fetch(request);

    // Only cache GET requests - Cache API doesn't support POST by default
    if (networkResponse.ok && request.method === 'GET') {
      // Put a clone in the cache
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Cache First Strategy Error:', error);
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

/**
 * Network First Strategy - Try network first, fallback to cache
 */
async function networkFirstStrategy(request) {
  let cache;
  try {
    cache = await caches.open(DYNAMIC_CACHE);
    const networkResponse = await fetch(request);

    // Only cache GET requests - Cache API doesn't support POST by default
    if (networkResponse.ok && request.method === 'GET') {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Network First Strategy Error:', error);
    try {
      if (!cache) {
        cache = await caches.open(DYNAMIC_CACHE);
      }
      const cached = await cache.match(request);
      if (cached) {
        // Return cached version with offline warning
        const response = cached.clone();
        const modifiedResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
        modifiedResponse.headers.set('X-Offline', 'true');
        return modifiedResponse;
      }
    } catch (cacheError) {
      console.error('Cache fallback error:', cacheError);
    }

    // Return offline page as last resort
    try {
      const offlineCache = await caches.open(STATIC_CACHE);
      const offlinePage = await offlineCache.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    } catch (offlineError) {
      console.error('Offline page fallback error:', offlineError);
    }

    throw error;
  }
}

/**
 * Firebase-specific Network First Strategy with fallback to firebaseFallback mock data
 */
async function firebaseNetworkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.error('Firebase Network First Strategy Error:', error);
    // Attempt to serve mock data from firebaseFallback if applicable
    // For simplicity, we return a generic JSON error or offline page
    // In a real app you would map the request to specific mock data
    try {
      // Try to serve offline page as fallback
      const offlineCache = await caches.open(STATIC_CACHE);
      const offlinePage = await offlineCache.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    } catch (offlineError) {
      console.error('Offline page fallback error:', offlineError);
    }
    // If even offline page fails, respond with a generic error
    return new Response(JSON.stringify({ error: 'Firebase service unavailable, please check your connection.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Network Only Strategy - Always fetch from network
 */
async function networkOnlyStrategy(request) {
  return fetch(request);
}

/**
 * Check if cache is still valid based on age
 */
function isCacheValid(dateString, maxAgeSeconds) {
  const cacheDate = new Date(dateString);
  const now = new Date();
  const ageInSeconds = (now - cacheDate) / 1000;
  return ageInSeconds < maxAgeSeconds;
}

/**
 * Get max age seconds based on cache name
 */
function getMaxAgeForCache(cacheName) {
  switch (cacheName) {
    case STATIC_CACHE: return CACHE_EXPIRY.STATIC;
    case DYNAMIC_CACHE: return CACHE_EXPIRY.DYNAMIC;
    case IMAGE_CACHE: return CACHE_EXPIRY.IMAGES;
    default: return CACHE_EXPIRY.DYNAMIC;
  }
}

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-watch-history') {
    event.waitUntil(syncWatchHistory());
  }
});

/**
 * Sync watch history when back online
 */
async function syncWatchHistory() {
  try {
    // Implement sync logic for watch history
    console.log('Syncing watch history...');
    // This would sync any pending watch history to Firebase
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

/**
 * Push notifications (future implementation)
 */
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/assets/logo/DUYDODEE.png',
    badge: '/assets/logo/DUYDODEE.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('DUYดูDEE', options)
  );
});