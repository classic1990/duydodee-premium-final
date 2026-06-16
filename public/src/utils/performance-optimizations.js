/**
 * ⚡ DUYดูDEE Performance Optimizations
 * Performance enhancement utilities
 */

export const PerformanceOptimizations = {
    /**
     * Memory cache for API responses
     */
    memoryCache: new Map(),

    /**
     * Cache duration in milliseconds (5 minutes)
     */
    CACHE_DURATION: 5 * 60 * 1000,

    /**
     * Get data from cache
     */
    getFromCache: (key) => {
        const cached = PerformanceOptimizations.memoryCache.get(key);
        if (!cached) {
            return null;
        }

        const now = Date.now();
        if (now - cached.timestamp > PerformanceOptimizations.CACHE_DURATION) {
            PerformanceOptimizations.memoryCache.delete(key);
            return null;
        }

        return cached.data;
    },

    /**
     * Set data to cache
     */
    setCache: (key, data) => {
        PerformanceOptimizations.memoryCache.set(key, {
            data,
            timestamp: Date.now()
        });
    },

    /**
     * Clear cache
     */
    clearCache: () => {
        PerformanceOptimizations.memoryCache.clear();
    },

    /**
     * Request queue to prevent duplicate requests
     */
    requestQueue: new Map(),

    /**
     * Fetch with deduplication and caching
     */
    async fetchWithCache(url, options = {}) {
        const cacheKey = url + JSON.stringify(options);

        // Check if request is in progress
        if (PerformanceOptimizations.requestQueue.has(cacheKey)) {
            return PerformanceOptimizations.requestQueue.get(cacheKey);
        }

        // Check cache
        const cached = PerformanceOptimizations.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        // Make request
        const promise = fetch(url, options).then(response => response.json());

        // Add to queue
        PerformanceOptimizations.requestQueue.set(cacheKey, promise);

        // Remove from queue after completion
        promise.finally(() => {
            PerformanceOptimizations.requestQueue.delete(cacheKey);
        });

        // Cache the result
        promise.then(data => {
            PerformanceOptimizations.setCache(cacheKey, data);
        });

        return promise;
    },

    /**
     * Batch operations for Firestore
     */
    batchFirestoreOperations: async (operations) => {
        const { db, writeBatch } = await import('../services/firebase.js');
        const batch = writeBatch(db);

        operations.forEach(op => {
            const ref = op.ref;
            const data = op.data;

            if (op.type === 'set') {
                batch.set(ref, data);
            } else if (op.type === 'update') {
                batch.update(ref, data);
            } else if (op.type === 'delete') {
                batch.delete(ref);
            }
        });

        await batch.commit();
    },

    /**
     * Debounce function with memory leak prevention
     */
    createDebouncedFn: (fn, delay) => {
        let timeoutId = null;
        let lastArgs = null;

        const debounced = (...args) => {
            lastArgs = args;

            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                timeoutId = null;
                return fn(...lastArgs);
            }, delay);
        };

        // Cancel method
        debounced.cancel = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        };

        return debounced;
    },

    /**
     * Throttle function with trailing option
     */
    createThrottledFn: (fn, limit, options = { leading: true, trailing: true }) => {
        let inThrottle = false;
        let lastArgs = null;
        let lastThis = null;

        return function(...args) {
            lastArgs = args;
            lastThis = this;

            if (!inThrottle) {
                if (options.leading) {
                    fn.apply(this, args);
                }

                inThrottle = true;

                setTimeout(() => {
                    inThrottle = false;

                    if (options.trailing && lastArgs) {
                        fn.apply(lastThis, lastArgs);
                        lastArgs = null;
                        lastThis = null;
                    }
                }, limit);
            }
        };
    },

    /**
     * Image optimization utilities
     */
    optimizeImage: (url, options = {}) => {
        const {
            quality = 80,
            format = 'webp',
            width = 800,
            height = 600
        } = options;

        // For YouTube thumbnails, use YouTube's image optimization
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
            if (videoId) {
                return `https://img.youtube.com/vi/${videoId[1]}/mqdefault.jpg`;
            }
        }

        // For Firebase Storage images, use Firebase image optimization
        if (url.includes('firebasestorage')) {
            const params = new URLSearchParams({
                w: width.toString(),
                h: height.toString(),
                q: quality.toString(),
                f: format
            });

            return `${url}?${params.toString()}`;
        }

        return url;
    },

    /**
     * Lazy load images with Intersection Observer
     */
    lazyLoadImages: (container = document) => {
        const images = container.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.dataset.src;

                        if (src) {
                            img.src = src;
                            img.onload = () => {
                                img.classList.add('loaded');
                            };
                        }

                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px',
                threshold: 0.1
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
        }
    },

    /**
     * Prefetch critical resources
     */
    prefetchCriticalResources: () => {
        const criticalResources = [
            '/assets/logo/DUYDODEE.png',
            '/css/output.css',
            '/css/fonts.css'
        ];

        criticalResources.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        });
    },

    /**
     * Add service worker update check
     */
    checkServiceWorkerUpdate: () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content is available
                            const updateBanner = document.createElement('div');
                            updateBanner.className = 'fixed top-0 left-0 right-0 bg-brand-primary text-white text-center py-2 z-[9999]';
                            updateBanner.innerHTML = `
                                <div class="flex items-center justify-center gap-4">
                                    <span>มีเนื้อหาใหม่ คลิกเพื่อรีเฟรช</span>
                                    <button onclick="window.location.reload()" class="bg-white text-brand-primary px-4 py-1 rounded font-bold">รีเฟรช</button>
                                </div>
                            `;
                            document.body.appendChild(updateBanner);
                        }
                    });
                });
            });
        }
    },

    /**
     * Performance monitoring
     */
    monitorPerformance: () => {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                        const navEntry = entry;
                        // eslint-disable-next-line no-console
                        console.log('⚡ Performance:', {
                            loadTime: navEntry.loadEventEnd - navEntry.fetchStart,
                            domReady: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
                            firstPaint: navEntry.responseStart - navEntry.fetchStart
                        });
                    } else if (entry.entryType === 'resource') {
                        if (entry.duration > 1000) {
                            console.warn('⚠️ Slow resource:', entry.name, `${entry.duration}ms`);
                        }
                    }
                }
            });

            observer.observe({ entryTypes: ['navigation', 'resource'] });
        }
    },

    /**
     * Initialize all performance optimizations
     */
    init: () => {
        PerformanceOptimizations.lazyLoadImages();
        PerformanceOptimizations.prefetchCriticalResources();
        PerformanceOptimizations.checkServiceWorkerUpdate();
        PerformanceOptimizations.monitorPerformance();

        // eslint-disable-next-line no-console
        console.log('⚡ Performance optimizations initialized');
    }
};

export default PerformanceOptimizations;
