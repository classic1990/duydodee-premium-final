import {
    db, toggleWatchlist, functions, httpsCallable,
    collection, collectionGroup, getDocs, doc, getDoc, setDoc, updateDoc,
    query, where, orderBy, limit, startAfter,
    increment, serverTimestamp, useFallback, firebaseFallback
} from './firebase.js';
import { SCHEMA } from '../constants.js';
import { UIUtils } from '../utils/ui-utils.js';
import { SearchService } from './search-service.js';
import { ReviewService } from './review-service.js';

/**
 * 🚀 DUYดูDEE CONTENT SERVICE (Master Edition)
 * Centralized business logic with hybrid Client/Server execution.
 */
export const ContentService = {
    async checkInWatchlist(uid, contentId) {
        try {
            const watchlistRef = doc(db, SCHEMA.COLLECTIONS.USERS, uid, SCHEMA.COLLECTIONS.WATCHLIST, contentId);
            const snap = await getDoc(watchlistRef);
            return snap.exists();
        } catch (error) {
            console.error('ContentService Error [checkInWatchlist]:', error);
            return false;
        }
    },

    toggleWatchlist,

    /**
     * Increment view count directly in Firestore (Client-side)
     * ⚠️ Firestore rules only permit updating the 'views' field on movies/series.
     *    Use updateDoc (not setDoc/merge) so the diff check in the rule works correctly.
     */
    async incrementViewCount(type, id) {
        try {
            const collName = type === 'series' ? SCHEMA.COLLECTIONS.SERIES : SCHEMA.COLLECTIONS.MOVIES;

            // Use updateDoc so Firestore security rule diff check passes (only 'views' field)
            await updateDoc(doc(db, collName, id), {
                views: increment(1)
            });

            // Update daily stats
            const today = new Date().toISOString().split('T')[0];
            await setDoc(doc(db, SCHEMA.COLLECTIONS.DAILY_STATS, today), {
                views: increment(1),
                lastUpdated: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('ContentService Error [incrementViewCount]:', error);
        }
    },

    /**
     * Search items across collections
     * Priority: Algolia > Firebase Functions > Local Firestore
     */
    async searchItems(term, limitCount = 12) {
        if (!term || term.length < 2) {
            return { movies: [], series: [] };
        }
        // Try Algolia first
        const algoliaResults = await SearchService.search(term, { hitsPerPage: limitCount });
        if (algoliaResults) {
            const movies = algoliaResults.filter(r => r.type === 'movie' || !r.type);
            const series = algoliaResults.filter(r => r.type === 'series');
            return { movies, series };
        }
        // Fallback to Firebase Functions
        try {
            const searchFn = httpsCallable(functions, 'searchContent');
            const result = await searchFn({ term, limit: limitCount });
            return result.data.results;
        } catch (error) {
            console.error('ContentService Error [searchItems]:', error);
            // Final fallback to local prefix matching
            return {
                movies: await this._localSearch('movie', term, limitCount),
                series: await this._localSearch('series', term, limitCount)
            };
        }
    },

    async _localSearch(type, term, limitCount) {
        const keyword = term.trim().toUpperCase();
        const q = query(
            collection(db, type === 'series' ? SCHEMA.COLLECTIONS.SERIES : SCHEMA.COLLECTIONS.MOVIES),
            where('title', '>=', keyword),
            where('title', '<=', keyword + '\uf8ff'),
            limit(limitCount)
        );
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data(), type }));
    },

    /**
     * Reset weekly views (Admin only, server-side)
     */
    async resetWeeklyViews() {
        try {
            const resetFn = httpsCallable(functions, 'resetWeeklyViews');
            const result = await resetFn();
            return result.data;
        } catch (error) {
            console.error('ContentService Error [resetWeeklyViews]:', error);
            throw error;
        }
    },

    // --- Data Fetching (Direct Firestore) ---

    async checkDuplicateLink(videoUrl) {
        if (!videoUrl) {
            return { exists: false };
        }
        const videoId = UIUtils.extractYouTubeId(videoUrl);
        if (!videoId) {
            return { exists: false };
        }

        const normalizedEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
        try {
            const mQuery = query(collection(db, SCHEMA.COLLECTIONS.MOVIES), where('embedURL', '==', normalizedEmbedUrl), limit(1));
            const mSnap = await getDocs(mQuery);
            if (!mSnap.empty) {
                return { exists: true, type: 'movie', data: mSnap.docs[0].data() };
            }

            const eQuery = query(collectionGroup(db, 'episodes'), where('embedURL', '==', normalizedEmbedUrl), limit(1));
            const eSnap = await getDocs(eQuery);
            if (!eSnap.empty) {
                return { exists: true, type: 'series', data: eSnap.docs[0].data() };
            }

            return { exists: false };
        } catch (error) {
            console.error('ContentService Error [checkDuplicateLink]:', error);
            return { exists: false };
        }
    },

    async fetchItems(type, options = {}) {
        const { pageSize = 12, lastDoc = null, sortBy = 'createdAt', direction = 'desc' } = options;
        const collName = type === 'series' ? SCHEMA.COLLECTIONS.SERIES : SCHEMA.COLLECTIONS.MOVIES;

        // Fallback mode: return mock data
        if (useFallback) {
            const mockItems = firebaseFallback.mockData.movies || [];
            return {
                items: mockItems.slice(0, pageSize).map(item => ({ ...item, type })),
                lastDoc: mockItems.length > 0 ? mockItems[mockItems.length - 1] : null,
                empty: mockItems.length === 0
            };
        }

        try {
            let q = query(collection(db, collName), orderBy(sortBy, direction), limit(pageSize));
            if (lastDoc) {
                q = query(q, startAfter(lastDoc));
            }
            const snap = await getDocs(q);
            return {
                items: snap.docs.map(d => ({ id: d.id, ...d.data(), type })),
                lastDoc: snap.docs[snap.docs.length - 1] || null,
                empty: snap.empty
            };
        } catch (error) {
            console.error('ContentService Error [fetchItems]:', error);
            // Return safe default to prevent UI breaking
            return { items: [], lastDoc: null, empty: true };
        }
    },

    async getItemById(type, id) {
        try {
            const snap = await getDoc(doc(db, type === 'series' ? SCHEMA.COLLECTIONS.SERIES : SCHEMA.COLLECTIONS.MOVIES, id));
            return snap.exists() ? { id: snap.id, ...snap.data(), type } : null;
        } catch (error) {
            console.error('ContentService Error [getItemById]:', error);
            return null;
        }
    },

    async getRelatedItems(type, category, currentId, limitCount = 6) {
        try {
            const q = query(collection(db, type === 'series' ? SCHEMA.COLLECTIONS.SERIES : SCHEMA.COLLECTIONS.MOVIES), where('category', '==', category), limit(limitCount + 1));
            const snap = await getDocs(q);
            return snap.docs
                .map(d => ({ id: d.id, ...d.data(), type }))
                .filter(item => item.id !== currentId)
                .slice(0, limitCount);
        } catch (error) {
            console.error('ContentService Error [getRelatedItems]:', error);
            return [];
        }
    },

    async getEpisodes(seriesId) {
        if (!seriesId) {
            return [];
        }
        try {
            const q = query(collection(db, SCHEMA.COLLECTIONS.SERIES, seriesId, 'episodes'), orderBy('episodeNumber', 'asc'));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error('ContentService Error [getEpisodes]:', error);
            return [];
        }
    },

    async fetchItemsByCategory(collections, categoryInput, options = {}) {
        const { pageSize = 12, lastDoc = null, sortBy = 'createdAt', direction = 'desc', isAllCategories = false } = options;
        const collectionsArray = Array.isArray(collections) ? collections : [collections];

        // Fallback mode: return mock data
        if (useFallback) {
            const mockItems = firebaseFallback.mockData.movies || [];
            return {
                items: mockItems.slice(0, pageSize),
                lastDoc: mockItems.length > 0 ? mockItems[mockItems.length - 1].id : null,
                empty: mockItems.length === 0
            };
        }

        if (collectionsArray.length === 1) {
            const type = collectionsArray[0];
            const collName = type === 'series' ? SCHEMA.COLLECTIONS.SERIES : SCHEMA.COLLECTIONS.MOVIES;
            try {
                let q = collection(db, collName);
                if (!isAllCategories) {
                    q = Array.isArray(categoryInput) ? query(q, where('category', 'in', categoryInput)) : query(q, where('category', '==', categoryInput));
                }
                let orderQ = query(q, orderBy(sortBy, direction), limit(pageSize));
                if (lastDoc) {
                    orderQ = query(orderQ, startAfter(lastDoc));
                }
                const snap = await getDocs(orderQ);
                return {
                    items: snap.docs.map(d => ({ id: d.id, ...d.data(), type })),
                    lastDoc: snap.docs[snap.docs.length - 1] || null,
                    empty: snap.empty
                };
            } catch (error) {
                console.error(`ContentService Error [fetchItemsByCategory]:`, error);
                // Return safe default to prevent UI breaking
                return { items: [], lastDoc: null, empty: true };
            }
        } else {
            // Merged multi-collection query (local sorting)
            try {
                const promises = collectionsArray.map(async (type) => {
                    const collName = type === 'series' ? SCHEMA.COLLECTIONS.SERIES : SCHEMA.COLLECTIONS.MOVIES;
                    let q = collection(db, collName);
                    if (!isAllCategories) {
                        q = Array.isArray(categoryInput) ? query(q, where('category', 'in', categoryInput)) : query(q, where('category', '==', categoryInput));
                    }
                    const orderQ = query(q, orderBy(sortBy, direction), limit(100));
                    const snap = await getDocs(orderQ);
                    return snap.docs.map(d => ({ id: d.id, ...d.data(), type }));
                });
                const results = await Promise.all(promises);
                const merged = results.flat();
                merged.sort((a, b) => {
                    const valA = a[sortBy]?.toDate ? a[sortBy].toDate() : a[sortBy];
                    const valB = b[sortBy]?.toDate ? b[sortBy].toDate() : b[sortBy];
                    return direction === 'asc' ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
                });

                let startIndex = 0;
                if (lastDoc) {
                    const idx = merged.findIndex(item => item.id === lastDoc);
                    if (idx !== -1) {
                        startIndex = idx + 1;
                    }
                }
                const paginatedItems = merged.slice(startIndex, startIndex + pageSize);
                return {
                    items: paginatedItems,
                    lastDoc: paginatedItems.length > 0 ? paginatedItems[paginatedItems.length - 1].id : null,
                    empty: paginatedItems.length === 0
                };
            } catch (error) {
                console.error('ContentService Error [fetchItemsByCategory] merged:', error);
                // Return safe default to prevent UI breaking
                return { items: [], lastDoc: null, empty: true };
            }
        }
    },

    // --- Rating & Review Methods ---

    /**
     * Get content rating information (wrapper for ReviewService)
     */
    async getContentRating(type, id) {
        try {
            return await ReviewService.getContentRating(type, id);
        } catch (error) {
            console.error('ContentService Error [getContentRating]:', error);
            return { averageRating: 0, totalReviews: 0 };
        }
    },

    /**
     * Get top rated items
     */
    async getTopRatedItems(type, limitCount = 10) {
        try {
            const collName = type === 'series' ? SCHEMA.COLLECTIONS.SERIES : SCHEMA.COLLECTIONS.MOVIES;
            const q = query(
                collection(db, collName),
                where('totalReviews', '>', 0),
                orderBy('averageRating', 'desc'),
                limit(limitCount)
            );
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data(), type }));
        } catch (error) {
            console.error('ContentService Error [getTopRatedItems]:', error);
            return [];
        }
    },

    /**
     * Get items with ratings included in the query
     */
    async fetchItemsWithRating(type, options = {}) {
        const { pageSize = 12, lastDoc = null, sortBy = 'createdAt', direction = 'desc', minReviews = 0 } = options;
        const collName = type === 'series' ? SCHEMA.COLLECTIONS.SERIES : SCHEMA.COLLECTIONS.MOVIES;

        try {
            let q = collection(db, collName);

            if (minReviews > 0) {
                q = query(q, where('totalReviews', '>=', minReviews));
            }

            let orderQ = query(q, orderBy(sortBy, direction), limit(pageSize));
            if (lastDoc) {
                orderQ = query(orderQ, startAfter(lastDoc));
            }

            const snap = await getDocs(orderQ);
            return {
                items: snap.docs.map(d => ({ id: d.id, ...d.data(), type })),
                lastDoc: snap.docs[snap.docs.length - 1] || null,
                empty: snap.empty
            };
        } catch (error) {
            console.error('ContentService Error [fetchItemsWithRating]:', error);
            return { items: [], lastDoc: null, empty: true };
        }
    }
};
