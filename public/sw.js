const CACHE_VERSION = 'v2';
const CACHE_NAME = `duydee-master-${CACHE_VERSION}`;
const STATIC_CACHE = `duydee-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `duydee-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `duydee-images-${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/output.css',
  '/css/fonts.css',
  '/assets/logo/DUYDODEE.png',
  '/manifest.json'
];

// Cache size limits
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_CACHE_SIZE = 100 * 1024 * 1024; // 100MB

// 🛠️ Install Event - Cache static assets
self.addEventListener('install', (e) => {
  console.log('[SW] Installing service worker');
  
  e.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return Promise.allSettled(
          STATIC_ASSETS.map(url => cache.add(url).catch(err => {
            console.error('[SW] Failed to cache:', url, err);
            return null;
          }))
        );
      }),
      // Pre-cache important fonts
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.addAll([
          '/assets/logo/DUYDODEE.png'
        ]).catch(err => {
          console.error('[SW] Failed to cache images:', err);
        });
      })
    ])
  );
  
  self.skipWaiting();
});

// 🚀 Activate Event - Cleanup old caches
self.addEventListener('activate', (e) => {
  console.log('[SW] Activating service worker');
  
  e.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== STATIC_CACHE && 
                key !== DYNAMIC_CACHE && 
                key !== IMAGE_CACHE &&
                key.startsWith('duydee-')) {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            }
          })
        );
      }),
      // Claim all clients immediately
      self.clients.claim()
    ])
  );
});

// 📡 Fetch Event - Advanced caching strategies
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  // Don't cache non-GET requests or API calls
  if (url.pathname.startsWith('/api/') || 
      url.pathname.startsWith('/_')) {
    return;
  }

  // Determine caching strategy based on request type
  const strategy = determineCacheStrategy(url, e.request);
  
  if (strategy) {
    e.respondWith(strategy(e.request, url));
  }
});

function determineCacheStrategy(url, request) {
  const isSameOrigin = url.origin === self.location.origin;
  const isImage = url.pathname.match(/\.(jpg|jpeg|png|webp|gif|svg|ico)$/i);
  const isVideo = url.pathname.match(/\.(mp4|webm|ogg)$/i);
  const isFont = url.pathname.match(/\.(woff2|woff|ttf|otf)$/i);
  const isCSS = url.pathname.match(/\.css$/i);
  const isJS = url.pathname.match(/\.js$/i);
  const isHTML = url.pathname.match(/\.html$/i) || url.pathname === '/';
  
  // HTML pages - Network First for fresh content
  if (isHTML && isSameOrigin) {
    return networkFirstStrategy(request);
  }
  
  // Images - Cache First with stale-while-revalidate
  if (isImage) {
    return cacheFirstStrategy(request, IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE);
  }
  
  // Videos - Network Only (too large to cache)
  if (isVideo) {
    return networkOnlyStrategy(request);
  }
  
  // Fonts - Cache First (permanent assets)
  if (isFont) {
    return cacheFirstStrategy(request, STATIC_CACHE);
  }
  
  // CSS/JS - Stale While Revalidate
  if (isCSS || isJS) {
    return staleWhileRevalidateStrategy(request, STATIC_CACHE);
  }
  
  // API calls to Firebase - Network First
  if (url.hostname.includes('firebaseio.com') || 
      url.hostname.includes('firebasestorage.googleapis.com')) {
    return networkFirstStrategy(request);
  }
  
  // Default - Stale While Revalidate
  return staleWhileRevalidateStrategy(request, DYNAMIC_CACHE, MAX_CACHE_SIZE);
}

// 🌐 Network First Strategy
async function networkFirstStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cacheCopy = networkResponse.clone();
      await cache.put(request, cacheCopy);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline.html') || new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    }
    
    throw error;
  }
}

// 💾 Cache First Strategy
async function cacheFirstStrategy(request, cacheName, maxSize = MAX_CACHE_SIZE) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(networkResponse => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse);
      }
    }).catch(() => {});
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      // Check cache size before adding
      await trimCache(cacheName, maxSize);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    throw error;
  }
}

// 🔄 Stale While Revalidate Strategy
async function staleWhileRevalidateStrategy(request, cacheName, maxSize = MAX_CACHE_SIZE) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Always fetch from network in background
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse && networkResponse.status === 200) {
      // Update cache
      trimCache(cacheName, maxSize).then(() => {
        cache.put(request, networkResponse.clone());
      });
    }
    return networkResponse;
  }).catch(error => {
    console.error('[SW] Background fetch failed:', error);
    return cachedResponse;
  });
  
  // Return cached version immediately if available
  return cachedResponse || fetchPromise;
}

// 🚫 Network Only Strategy
async function networkOnlyStrategy(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('[SW] Network only failed:', error);
    throw error;
  }
}

// 🧹 Cache Management
async function trimCache(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length === 0) return;
  
  // Calculate current cache size
  let totalSize = 0;
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const headers = response.headers;
      const contentLength = headers.get('content-length');
      if (contentLength) {
        totalSize += parseInt(contentLength, 10);
      }
    }
  }
  
  // If over limit, remove oldest entries
  if (totalSize > maxSize) {
    console.log(`[SW] Trimming cache ${cacheName}, current size: ${totalSize}`);
    const entriesToRemove = Math.ceil(keys.length * 0.1); // Remove 10% of entries
    
    for (let i = 0; i < entriesToRemove; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// 📨 Push Notification Support
self.addEventListener('push', (e) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: e.data ? e.data.text() : 'New notification',
    icon: '/assets/logo/DUYDODEE.png',
    badge: '/assets/logo/DUYDODEE.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/assets/logo/DUYDODEE.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/logo/DUYDODEE.png'
      }
    ]
  };
  
  e.waitUntil(
    self.registration.showNotification('DUYDODEE Premium', options)
  );
});

// 🔔 Notification Click Handler
self.addEventListener('notificationclick', (e) => {
  console.log('[SW] Notification clicked');
  
  e.notification.close();
  
  if (e.action === 'explore') {
    e.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 📊 Background Sync (for future use)
self.addEventListener('sync', (e) => {
  console.log('[SW] Background sync:', e.tag);
  
  if (e.tag === 'sync-favorites') {
    e.waitUntil(syncFavorites());
  }
});

async function syncFavorites() {
  // Implement favorites sync logic
  console.log('[SW] Syncing favorites');
}

// 📡 Message Handling
self.addEventListener('message', (e) => {
  console.log('[SW] Message received:', e.data);
  
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (e.data && e.data.type === 'CACHE_URLS') {
    e.waitUntil(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(e.data.urls);
      })
    );
  }
  
  if (e.data && e.data.type === 'CLEAR_CACHE') {
    e.waitUntil(
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => caches.delete(key))
        );
      })
    );
  }
});

// 🧪 Periodic Background Sync (Chrome only)
self.addEventListener('periodicsync', (e) => {
  console.log('[SW] Periodic sync:', e.tag);
  
  if (e.tag === 'update-content') {
    e.waitUntil(updateContent());
  }
});

async function updateContent() {
  // Implement content update logic
  console.log('[SW] Updating content');
}

console.log('[SW] Service worker loaded');
