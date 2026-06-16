/**
 * 🛠️ DUYดูDEE UI UTILITIES
 * Pure helper functions for the UI Engine.
 */

export const UIUtils = {
    /**
     * Extract YouTube video ID from URL
     * @param {string} url - YouTube video URL
     * @returns {string|null} YouTube video ID or null if invalid
     * @example
     * extractYouTubeId('https://youtube.com/watch?v=dQw4w9WgXcQ') // 'dQw4w9WgXcQ'
     * extractYouTubeId('https://youtu.be/dQw4w9WgXcQ') // 'dQw4w9WgXcQ'
     */
    extractYouTubeId: (url) => {
        if (!url) {
            return null;
        }
        const match = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
        return (match && match[2].length === 11) ? match[2] : null;
    },

    /**
     * Get the appropriate watch page path based on content type and category
     * @param {string} category - Content category (e.g., 'Action', 'แนวตั้ง')
     * @param {string} type - Content type ('movie' or 'series')
     * @param {string} id - Content ID
     * @returns {string} Full watch page URL with query parameter
     * @example
     * getMediaWatchPath('Action', 'movie', '123') // '/watch-movie.html?id=123'
     * getMediaWatchPath('แนวตั้ง', 'series', '456') // '/watch-movie.html?id=456'
     */
    getMediaWatchPath: (category, type, id) => {
        const isVertical = category && (category.includes('แนวตั้ง') || category.includes('Vertical'));
        const page = (isVertical || type === 'movie' || type === 'movies') ? '/watch-movie.html' : '/watch-series.html';
        return `${page}?id=${id}`;
    },

    /**
     * Get safe poster URL with fallback and quality optimization
     * @param {string} url - Original poster URL
     * @param {string} quality - Image quality: 'high', 'medium', 'standard', 'low'
     * @returns {string} Safe poster URL with fallback to default logo
     * @example
     * getSafePoster('https://youtube.com/watch?v=dQw4w9WgXcQ', 'high') // 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
     * getSafePoster('', 'medium') // '/assets/logo/DUYDODEE.png'
     */
    getSafePoster: (url, quality = 'high') => {
        const logo = '/assets/logo/DUYDODEE.png';
        if (!url || url === '' || url.includes('DUYDODEE.png')) {
            return logo;
        }

        // YouTube thumbnail quality selection
        if (url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')) {
            const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^&#?\s]+)/);
            const id = (match && match[1]) ? match[1] : null;
            if (id) {
                // Use high quality by default: maxresdefault (1280x720) or hqdefault (480x360)
                const qualityMap = {
                    'high': 'maxresdefault',
                    'medium': 'hqdefault',
                    'standard': 'sddefault',
                    'low': 'mqdefault'
                };
                const selectedQuality = qualityMap[quality] || 'maxresdefault';
                return `https://img.youtube.com/vi/${id}/${selectedQuality}.jpg`;
            }
        } else if (url.includes('img.youtube.com') || url.includes('firebasestorage') || url.startsWith('http')) {
            return url;
        }
        return logo;
    },

    /**
     * Debounce function to limit execution rate
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     * @example
     * const debouncedSearch = debounce((query) => search(query), 300);
     */
    debounce: (func, delay) => {
        let timeoutId;
        return (...args) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    },

    /**
     * Escape HTML special characters to prevent XSS attacks
     * @param {string} str - String to escape
     * @returns {string} Escaped HTML-safe string
     * @example
     * escapeHTML('<script>alert("xss")</script>') // '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
     */
    escapeHTML: (str) => {
        if (typeof str !== 'string') {
            return '';
        }
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag]));
    },

    /**
     * 🚀 Performance: Lazy load images with intersection observer
     * Automatically lazy loads all images with 'data-src' attribute
     */
    setupLazyLoading: () => {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy-loading');
                            img.classList.add('lazy-loaded');
                        }
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                img.classList.add('lazy-loading');
                imageObserver.observe(img);
            });
        }
    },

    /**
     * 🚀 Performance: Prefetch critical resources for faster navigation
     * @param {string[]} urls - Array of URLs to prefetch
     * @example
     * prefetchResources(['/watch-movie.html', '/search.html'])
     */
    prefetchResources: (urls) => {
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        });
    },

    /**
     * 🚀 Performance: Throttle function for scroll events and frequent calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Minimum time between calls in milliseconds
     * @returns {Function} Throttled function
     * @example
     * const throttledScroll = throttle(() => handleScroll(), 100);
     */
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Format timestamp to Thai date format
     * @param {Date|Object} ts - Timestamp or Date object
     * @returns {string} Formatted Thai date string
     * @example
     * formatDate(new Date('2024-01-15')) // '15 ม.ค. 2567'
     */
    formatDate: (ts) => {
        if (!ts) {
            return 'N/A';
        }
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    }
};

