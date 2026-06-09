/**
 * DUYดูDEE Service Worker
 * Implements advanced caching strategies for optimal performance
 */

const CACHE_VERSION = 'v4';
const CACHE_NAME = `duydee-premium-${CACHE_VERSION}`;

// Cache names for different strategies
const CACHES = {
  STATIC: `duydee-static-${CACHE_VERSION}`,
  DYNAMIC: `duydee-dynamic-${CACHE_VERSION}`,
  IMAGES: `duydee-images-${CACHE_VERSION}`
};

// Precache critical assets
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/register.html',
  '/css/output.css',
  '/css/fonts.css',
  '/assets/logo/DUYDODEE.png'
];

// Cache size limits (in bytes)
const CACHE_LIMITS = {
  STATIC: 5 * 1024 * 1024, // 5MB
  DYNAMIC: 10 * 1024 * 1024, // 10MB
  IMAGES: 50 * 1024 * 1024 // 50MB
};

/**
 * Install Event - Precache critical assets
 */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHES.STATIC).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

/**
 * Activate Event - Cleanup old caches and enforce cache limits
 */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      // Delete old caches
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (!Object.values(CACHES).includes(key)) return caches.delete(key);
          })
        );
      }),
      // Enforce cache size limits
      enforceCacheLimit(CACHES.STATIC, CACHE_LIMITS.STATIC),
      enforceCacheLimit(CACHES.DYNAMIC, CACHE_LIMITS.DYNAMIC),
      enforceCacheLimit(CACHES.IMAGES, CACHE_LIMITS.IMAGES)
    ])
  );
  self.clients.claim();
});

/**
 * Enforces cache size limit by removing oldest entries
 * @param {string} cacheName - Name of the cache
 * @param {number} maxSize - Maximum size in bytes
 * @returns {Promise<void>}
 */
async function enforceCacheLimit(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length === 0) return;

  let totalSize = 0;
  const entries = [];

  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const size = response.headers.get('content-length') || 0;
      totalSize += parseInt(size);
      entries.push({ request, response, size });
    }
  }

  if (totalSize <= maxSize) return;

  // Remove oldest entries until under limit
  entries.sort((a, b) => {
    const aDate = a.response.headers.get('date') || 0;
    const bDate = b.response.headers.get('date') || 0;
    return new Date(aDate) - new Date(bDate);
  });

  let currentSize = totalSize;
  for (const entry of entries) {
    if (currentSize <= maxSize) break;
    await cache.delete(entry.request);
    currentSize -= entry.size;
  }
}

/**
 * Fetch Event - Optimized Caching Strategies
 */
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Skip non-GET requests and chrome-extension requests
  if (e.request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // 1. Cache First: Static assets (fonts, images, icons)
  if (isStaticAsset(url)) {
    e.respondWith(cacheFirst(e.request, CACHES.IMAGES));
    return;
  }

  // 2. Stale-While-Revalidate: CSS & JS files
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    e.respondWith(staleWhileRevalidate(e.request, CACHES.STATIC));
    return;
  }

  // 3. Network First: HTML pages (fallback to cache)
  if (e.request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(networkFirst(e.request, CACHES.STATIC));
    return;
  }

  // 4. Network First with cache fallback: API calls and dynamic content
  if (url.pathname.includes('/api/') || url.hostname.includes('firebaseio.com')) {
    e.respondWith(networkFirst(e.request, CACHES.DYNAMIC, 5 * 60 * 1000)); // 5 minutes
    return;
  }

  // 5. Default: Network only for other requests
  e.respondWith(fetch(e.request));
});

/**
 * Determines if a request is for a static asset
 * @param {URL} url - Request URL
 * @returns {boolean}
 */
function isStaticAsset(url) {
  return url.pathname.match(/\.(woff|woff2|ttf|otf|png|jpg|jpeg|svg|ico|webp|gif)$/);
}

/**
 * Cache First Strategy
 * @param {Request} request - Fetch request
 * @param {string} cacheName - Cache name to use
 * @returns {Promise<Response>}
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const network = await fetch(request);
    if (network.ok) {
      cache.put(request, network.clone());
    }
    return network;
  } catch (error) {
    console.error('Cache First failed:', error);
    throw error;
  }
}

/**
 * Stale-While-Revalidate Strategy
 * @param {Request} request - Fetch request
 * @param {string} cacheName - Cache name to use
 * @returns {Promise<Response>}
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((network) => {
    if (network.ok) {
      cache.put(request, network.clone());
    }
    return network;
  }).catch((error) => {
    console.error('Stale-While-Revalidate fetch failed:', error);
    return cached;
  });

  return cached || fetchPromise;
}

/**
 * Network First Strategy with cache fallback
 * @param {Request} request - Fetch request
 * @param {string} cacheName - Cache name to use
 * @param {number} maxAge - Maximum age for cached response in ms
 * @returns {Promise<Response>}
 */
async function networkFirst(request, cacheName, maxAge = Infinity) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  try {
    const network = await fetch(request);
    if (network.ok) {
      cache.put(request, network.clone());
    }
    return network;
  } catch (error) {
    console.error('Network First failed, using cache:', error);
    if (cached) {
      // Check cache age if maxAge is specified
      if (maxAge !== Infinity) {
        const date = cached.headers.get('date');
        if (date) {
          const cacheAge = Date.now() - new Date(date).getTime();
          if (cacheAge > maxAge) {
            throw new Error('Cache expired');
          }
        }
      }
      return cached;
    }
    throw error;
  }
}

