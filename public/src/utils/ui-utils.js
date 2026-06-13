/**
 * 🛠️ DUYดูDEE UI UTILITIES
 * Pure helper functions for the UI Engine.
 */

export const UIUtils = {
    extractYouTubeId: (url) => {
        if (!url) {
            return null;
        }
        const match = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
        return (match && match[2].length === 11) ? match[2] : null;
    },

    getMediaWatchPath: (category, type, id) => {
        const isVertical = category && (category.includes('แนวตั้ง') || category.includes('Vertical'));
        const page = (isVertical || type === 'movie' || type === 'movies') ? '/watch-movie.html' : '/watch-series.html';
        return `${page}?id=${id}`;
    },

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

    debounce: (func, delay) => {
        let timeoutId;
        return (...args) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    },

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
     * 🚀 Performance: Prefetch critical resources
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
     * 🚀 Performance: Throttle function for scroll events
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

    formatDate: (ts) => {
        if (!ts) {
            return 'N/A';
        }
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    }
};

