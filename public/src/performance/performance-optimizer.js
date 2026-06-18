/**
 * ⚡ DUYดูDEE Performance Optimizer
 * ระบบปรับปรุงประสิทธิภาพและ optimization
 */

/**
 * Lazy Loading Utilities
 */
export class LazyLoader {
    /**
     * Lazy load images
     */
    static lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    /**
     * Lazy load components
     */
    static async lazyLoadComponent(modulePath, elementId) {
        const element = document.getElementById(elementId);
        if (!element) return null;

        try {
            const module = await import(modulePath);
            return module;
        } catch (error) {
            console.error(`Failed to load component: ${modulePath}`, error);
            return null;
        }
    }

    /**
     * Prefetch critical resources
     */
    static prefetchResources(urls) {
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        });
    }

    /**
     * Preload critical resources
     */
    static preloadResources(urls) {
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            link.as = url.endsWith('.js') ? 'script' : 
                      url.endsWith('.css') ? 'style' : 'fetch';
            document.head.appendChild(link);
        });
    }
}

/**
 * Code Splitting Manager
 */
export class CodeSplitter {
    static async loadModule(moduleName) {
        try {
            switch (moduleName) {
                case 'firebase':
                    return await import('../services/firebase.js');
                case 'auth':
                    return await import('../services/auth-service.js');
                case 'content':
                    return await import('../services/content-service.js');
                case 'review':
                    return await import('../services/review-service.js');
                default:
                    throw new Error(`Unknown module: ${moduleName}`);
            }
        } catch (error) {
            console.error(`Failed to load module: ${moduleName}`, error);
            return null;
        }
    }

    static preloadCriticalModules() {
        const criticalModules = ['firebase', 'auth'];
        criticalModules.forEach(module => {
            this.loadModule(module).catch(console.error);
        });
    }
}

/**
 * Caching System
 */
export class CacheManager {
    static cache = new Map();
    static DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

    /**
     * Set cache with TTL
     */
    static set(key, value, ttl = this.DEFAULT_TTL) {
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttl
        });
    }

    /**
     * Get cache
     */
    static get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    /**
     * Clear expired cache
     */
    static clearExpired() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiresAt) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear all cache
     */
    static clear() {
        this.cache.clear();
    }

    /**
     * Get cache size
     */
    static size() {
        return this.cache.size;
    }
}

/**
 * Debounce and Throttle Utilities
 */
export class PerformanceUtils {
    /**
     * Debounce function
     */
    static debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function
     */
    static throttle(func, limit = 300) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Request animation frame throttle
     */
    static rafThrottle(func) {
        let ticking = false;
        return function executedFunction(...args) {
            if (!ticking) {
                requestAnimationFrame(() => {
                    func(...args);
                    ticking = false;
                });
                ticking = true;
            }
        };
    }

    /**
     * Measure function performance
     */
    static measurePerformance(func, label = 'Function') {
        return function (...args) {
            const start = performance.now();
            const result = func.apply(this, args);
            const end = performance.now();
            console.log(`${label} took ${end - start}ms`);
            return result;
        };
    }
}

/**
 * Memory Management
 */
export class MemoryManager {
    /**
     * Clean up event listeners
     */
    static cleanupEventListeners(element, events) {
        events.forEach(event => {
            element.removeEventListener(event.type, event.handler);
        });
    }

    /**
     * Clean up timers
     */
    static cleanupTimers(timers) {
        timers.forEach(timer => {
            if (timer.timeout) clearTimeout(timer.timeout);
            if (timer.interval) clearInterval(timer.interval);
        });
    }

    /**
     * Force garbage collection hint
     */
    static forceCleanup() {
        if (window.gc && typeof window.gc === 'function') {
            window.gc();
        }
    }

    /**
     * Check memory usage
     */
    static getMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    /**
     * Log memory usage
     */
    static logMemoryUsage() {
        const usage = this.getMemoryUsage();
        if (usage) {
            console.log('Memory Usage:', {
                used: `${(usage.used / 1048576).toFixed(2)} MB`,
                total: `${(usage.total / 1048576).toFixed(2)} MB`,
                limit: `${(usage.limit / 1048576).toFixed(2)} MB`,
                percentage: `${((usage.used / usage.limit) * 100).toFixed(2)}%`
            });
        }
    }
}

/**
 * Performance Monitoring
 */
export class PerformanceMonitor {
    static metrics = new Map();

    /**
     * Mark performance point
     */
    static mark(name) {
        performance.mark(name);
    }

    /**
     * Measure between marks
     */
    static measure(name, startMark, endMark) {
        try {
            performance.measure(name, startMark, endMark);
            const measure = performance.getEntriesByName(name)[0];
            this.metrics.set(name, {
                duration: measure.duration,
                startTime: measure.startTime
            });
            return measure.duration;
        } catch (error) {
            console.error('Performance measure failed:', error);
            return null;
        }
    }

    /**
     * Get all metrics
     */
    static getMetrics() {
        return Object.fromEntries(this.metrics);
    }

    /**
     * Clear metrics
     */
    static clearMetrics() {
        this.metrics.clear();
        performance.clearMarks();
        performance.clearMeasures();
    }

    /**
     * Log Performance Metrics
     */
    static logMetrics() {
        console.table(this.getMetrics());
    }

    /**
     * Monitor Core Web Vitals
     */
    static monitorCoreWebVitals() {
        if (!('PerformanceObserver' in window)) return;

        // Largest Contentful Paint
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            console.warn('LCP observation not supported');
        }

        // First Input Delay
        try {
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const fid = entries[0].processingStart - entries[0].startTime;
                console.log('FID:', fid);
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
            console.warn('FID observation not supported');
        }

        // Cumulative Layout Shift
        try {
            const clsObserver = new PerformanceObserver((list) => {
                let clsValue = 0;
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                console.log('CLS:', clsValue);
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            console.warn('CLS observation not supported');
        }
    }
}

/**
 * Resource Optimization
 */
export class ResourceOptimizer {
    /**
     * Optimize images by using WebP format
     */
    static optimizeImageURL(url, format = 'webp', quality = 80) {
        if (!url) return url;
        
        // Add optimization parameters for image services
        if (url.includes('cloudinary.com') || url.includes('imgix.com')) {
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}format=${format}&quality=${quality}`;
        }
        
        return url;
    }

    /**
     * Generate responsive image sources
     */
    static generateResponsiveImages(baseURL, sizes = [320, 640, 1024, 1920]) {
        return sizes.map(size => ({
            srcSet: `${baseURL}?w=${size} ${size}w`,
            media: `(max-width: ${size}px)`
        }));
    }

    /**
     * Minify CSS/JS content
     */
    static minifyContent(content, type = 'js') {
        // Basic minification
        let minified = content
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/\s*([{}:;,])\s*/g, '$1') // Remove space around punctuation
            .trim();

        if (type === 'js') {
            minified = minified
                .replace(/\/\/.*$/gm, '') // Remove single-line comments
                .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
                .replace(/,\s*}/g, '}'); // Remove trailing commas
        }

        return minified;
    }
}

/**
 * Service Worker Integration
 */
export class ServiceWorkerManager {
    /**
     * Register service worker
     */
    static async register() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
                return registration;
            } catch (error) {
                console.error('Service Worker registration failed:', error);
                return null;
            }
        }
        return null;
    }

    /**
     * Update service worker
     */
    static async update() {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                await registration.update();
                console.log('Service Worker updated');
            }
        }
    }

    /**
     * Clear service worker cache
     */
    static async clearCache() {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
            console.log('Service Worker cache cleared');
        }
    }
}

/**
 * Performance Initialization
 */
export function initializePerformanceOptimizations() {
    // Initialize lazy loading
    LazyLoader.lazyLoadImages();

    // Preload critical resources
    LazyLoader.preloadResources([
        '/css/output.css',
        '/src/services/firebase.js'
    ]);

    // Start performance monitoring
    PerformanceMonitor.monitorCoreWebVitals();

    // Register service worker
    if ('serviceWorker' in navigator) {
        ServiceWorkerManager.register();
    }

    // Clean up expired cache periodically
    setInterval(() => {
        CacheManager.clearExpired();
    }, 60000); // Every minute

    // Log memory usage in development
    if (process.env.NODE_ENV === 'development') {
        setInterval(() => {
            MemoryManager.logMemoryUsage();
        }, 30000); // Every 30 seconds
    }
}

export default {
    LazyLoader,
    CodeSplitter,
    CacheManager,
    PerformanceUtils,
    MemoryManager,
    PerformanceMonitor,
    ResourceOptimizer,
    ServiceWorkerManager,
    initializePerformanceOptimizations
};