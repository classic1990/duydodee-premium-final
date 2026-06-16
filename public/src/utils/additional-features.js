/**
 * 🎨 DUYดูDEE Additional Features
 * Extended features for better user experience
 */

import { SearchEnhancements, FilteringEnhancements } from './search-filtering-enhancements.js';

export const AdditionalFeatures = {
    /**
     * Bookmark/Watchlist Management
     */
    Bookmarks: {
        add: (itemId) => {
            const bookmarks = AdditionalFeatures.Bookmarks.get();
            if (!bookmarks.includes(itemId)) {
                bookmarks.push(itemId);
                localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
                return true;
            }
            return false;
        },

        remove: (itemId) => {
            const bookmarks = AdditionalFeatures.Bookmarks.get();
            const filtered = bookmarks.filter(id => id !== itemId);
            localStorage.setItem('bookmarks', JSON.stringify(filtered));
        },

        get: () => {
            const bookmarks = localStorage.getItem('bookmarks');
            return bookmarks ? JSON.parse(bookmarks) : [];
        },

        has: (itemId) => {
            return AdditionalFeatures.Bookmarks.get().includes(itemId);
        },

        toggle: (itemId) => {
            if (AdditionalFeatures.Bookmarks.has(itemId)) {
                AdditionalFeatures.Bookmarks.remove(itemId);
                return false;
            } else {
                AdditionalFeatures.Bookmarks.add(itemId);
                return true;
            }
        }
    },

    /**
     * Rating & Review System
     */
    Reviews: {
        submit: async (itemId, rating, comment) => {
            // This would be implemented with Firestore
            // For now, store locally
            const reviews = AdditionalFeatures.Reviews.get(itemId) || [];
            reviews.push({
                rating,
                comment,
                timestamp: Date.now()
            });
            localStorage.setItem(`reviews_${itemId}`, JSON.stringify(reviews));
            return true;
        },

        get: (itemId) => {
            const reviews = localStorage.getItem(`reviews_${itemId}`);
            return reviews ? JSON.parse(reviews) : [];
        },

        getAverage: (itemId) => {
            const reviews = AdditionalFeatures.Reviews.get(itemId);
            if (reviews.length === 0) {
                return 0;
            }
            const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
            return (sum / reviews.length).toFixed(1);
        }
    },

    /**
     * Recommendation System (Content-based)
     */
    Recommendations: {
        getBasedOnViewHistory: (viewHistory, allContent) => {
            if (!viewHistory || viewHistory.length === 0) {
                return [];
            }

            // Get categories user watches most
            const categoryCount = {};
            viewHistory.forEach(item => {
                const category = item.category;
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            });

            // Get top categories
            const topCategories = Object.entries(categoryCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(entry => entry[0]);

            // Recommend content from top categories
            const recommendations = allContent.filter(item => {
                return topCategories.includes(item.category) &&
                       !viewHistory.some(v => v.id === item.id);
            });

            return recommendations.slice(0, 10);
        },

        getSimilar: (item, allContent) => {
            // Find items with same category
            const similar = allContent.filter(other => {
                return other.category === item.category && other.id !== item.id;
            });

            // Sort by rating
            return similar
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 5);
        }
    },

    /**
     * Download/Offline Manager
     */
    Offline: {
        isAvailable: () => {
            return 'serviceWorker' in navigator && 'caches' in window;
        },

        cacheContent: async (itemId, contentData) => {
            if (!AdditionalFeatures.Offline.isAvailable()) {
                return false;
            }

            try {
                const cache = await caches.open('duydodee-content-v1');
                await cache.put(`/content/${itemId}`, new Response(JSON.stringify(contentData)));
                return true;
            } catch (error) {
                console.error('Failed to cache content:', error);
                return false;
            }
        },

        getCachedContent: async (itemId) => {
            if (!AdditionalFeatures.Offline.isAvailable()) {
                return null;
            }

            try {
                const cache = await caches.open('duydodee-content-v1');
                const response = await cache.match(`/content/${itemId}`);
                if (response) {
                    return await response.json();
                }
                return null;
            } catch (error) {
                console.error('Failed to get cached content:', error);
                return null;
            }
        }
    },

    /**
     * Social Sharing
     */
    Social: {
        share: async (title, url) => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: title,
                        url: url
                    });
                    return true;
                } catch (error) {
                    console.log('Share canceled:', error);
                    return false;
                }
            } else {
                // Fallback to clipboard
                AdditionalFeatures.Social.copyToClipboard(url);
                return false;
            }
        },

        copyToClipboard: async (text) => {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (error) {
                console.error('Failed to copy:', error);
                return false;
            }
        },

        shareOnFacebook: (url) => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        },

        shareOnTwitter: (title, url) => {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        },

        shareOnLine: (title, url) => {
            window.open(`https://line.me/R/msg/text/?${encodeURIComponent(title)}%20${encodeURIComponent(url)}`, '_blank');
        }
    },

    /**
     * Theme & Appearance
     */
    Theme: {
        set: (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        },

        get: () => {
            return localStorage.getItem('theme') || 'dark';
        },

        toggle: () => {
            const current = AdditionalFeatures.Theme.get();
            const newTheme = current === 'dark' ? 'light' : 'dark';
            AdditionalFeatures.Theme.set(newTheme);
            return newTheme;
        },

        init: () => {
            const theme = AdditionalFeatures.Theme.get();
            document.documentElement.setAttribute('data-theme', theme);
        }
    },

    /**
     * Notification System
     */
    Notifications: {
        requestPermission: async () => {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                return permission === 'granted';
            }
            return false;
        },

        send: (title, body, icon = '/assets/logo/DUYDODEE.png') => {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, {
                    body,
                    icon
                });
            }
        },

        isSupported: () => {
            return 'Notification' in window;
        }
    },

    /**
     * Language & Localization
     */
    Localization: {
        supportedLanguages: ['th', 'en'],

        set: (lang) => {
            if (AdditionalFeatures.Localization.supportedLanguages.includes(lang)) {
                localStorage.setItem('language', lang);
                document.documentElement.lang = lang;
                return true;
            }
            return false;
        },

        get: () => {
            return localStorage.getItem('language') || 'th';
        },

        t: (key) => {
            // Simple translation system
            const translations = {
                th: {
                    'home': 'หน้าแรก',
                    'search': 'ค้นหา',
                    'login': 'เข้าสู่ระบบ',
                    'register': 'สมัครสมาชิก',
                    'watch': 'รับชม',
                    'trending': 'ยอดนิยม',
                    'new': 'ใหม่'
                },
                en: {
                    'home': 'Home',
                    'search': 'Search',
                    'login': 'Login',
                    'register': 'Register',
                    'watch': 'Watch',
                    'trending': 'Trending',
                    'new': 'New'
                }
            };

            const lang = AdditionalFeatures.Localization.get();
            return translations[lang][key] || key;
        }
    }
};

export default AdditionalFeatures;
