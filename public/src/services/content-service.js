import { db } from './firebase-config.js';
import { SCHEMA } from '../constants.js';
import { UI } from '../components/ui.js';
import {
    collection, collectionGroup, getDocs, doc, getDoc, setDoc,
    query, where, orderBy, limit, startAfter,
    increment
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

/**
 * 🚀 DUYดูDEE CONTENT SERVICE (Refactored)
 */
export const ContentService = {

    async checkDuplicateLink(videoUrl) {
        if (!videoUrl) {
            return { exists: false };
        }
        const videoId = UI.extractYouTubeId(videoUrl);
        if (!videoId) {
            return { exists: false };
        }

        const normalizedEmbedUrl = `https://www.youtube.com/embed/${videoId}`;

        try {
            // 1. Check Movies (via normalized embedURL)
            const mQuery = query(collection(db, SCHEMA.COLLECTIONS.MOVIES), where('embedURL', '==', normalizedEmbedUrl), limit(1));
            const mSnap = await getDocs(mQuery);
            if (!mSnap.empty) {
                return { exists: true, type: 'movie', data: mSnap.docs[0].data() };
            }

            // 2. Check Series Episodes (via normalized embedURL)
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
        const collName = this._getCollection(type);

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
            throw error;
        }
    },

    async getItemById(type, id) {
        try {
            const snap = await getDoc(doc(db, this._getCollection(type), id));
            return snap.exists() ? { id: snap.id, ...snap.data(), type } : null;
        } catch (error) {
            console.error('ContentService Error [getItemById]:', error);
            return null;
        }
    },

    async getRelatedItems(type, category, currentId, limitCount = 6) {
        try {
            const q = query(collection(db, this._getCollection(type)), where('category', '==', category), limit(limitCount + 1));
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

    async incrementViewCount(type, id) {
        try {
            await setDoc(doc(db, this._getCollection(type), id), { views: increment(1) }, { merge: true });
        } catch (error) {
            console.error('ContentService Error [incrementViewCount]:', error);
        }
    },

    async updateDailyStats(dateId, statData) {
        try {
            await setDoc(doc(db, SCHEMA.COLLECTIONS.DAILY_STATS, dateId), statData, { merge: true });
        } catch (error) {
            console.error('ContentService Error [updateDailyStats]:', error);
        }
    },

    async getEpisodes(seriesId) {
        if (!seriesId) {
            return [];
        }
        try {
            const q = query(
                collection(db, SCHEMA.COLLECTIONS.SERIES, seriesId, 'episodes'),
                orderBy('episodeNumber', 'asc')
            );
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error('ContentService Error [getEpisodes]:', error);
            return [];
        }
    },

    async searchItems(type, term, limitCount = 12) {
        if (!term) {
            return [];
        }
        const collName = this._getCollection(type);
        try {
            const q = query(collection(db, collName), orderBy('createdAt', 'desc'), limit(100));
            const snap = await getDocs(q);
            const normalizedTerm = term.toLowerCase().trim();
            const results = snap.docs
                .map(d => ({ id: d.id, ...d.data(), type }))
                .filter(item =>
                    (item.title && item.title.toLowerCase().includes(normalizedTerm)) ||
                    (item.category && item.category.toLowerCase().includes(normalizedTerm)) ||
                    (item.description && item.description.toLowerCase().includes(normalizedTerm))
                );
            return results.slice(0, limitCount);
        } catch (error) {
            console.error('ContentService Error [searchItems]:', error);
            return [];
        }
    },

    async fetchItemsByCategory(collections, categoryInput, options = {}) {
        const { pageSize = 12, lastDoc = null, sortBy = 'createdAt', direction = 'desc', isAllCategories = false } = options;
        const collectionsArray = Array.isArray(collections) ? collections : [collections];

        if (collectionsArray.length === 1) {
            const type = collectionsArray[0];
            const collName = this._getCollection(type);
            try {
                let q = collection(db, collName);
                if (!isAllCategories) {
                    if (Array.isArray(categoryInput)) {
                        q = query(q, where('category', 'in', categoryInput));
                    } else {
                        q = query(q, where('category', '==', categoryInput));
                    }
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
                console.error(`ContentService Error [fetchItemsByCategory] for ${collName}:`, error);
                throw error;
            }
        } else {
            try {
                const promises = collectionsArray.map(async (type) => {
                    const collName = this._getCollection(type);
                    let q = collection(db, collName);
                    if (!isAllCategories) {
                        if (Array.isArray(categoryInput)) {
                            q = query(q, where('category', 'in', categoryInput));
                        } else {
                            q = query(q, where('category', '==', categoryInput));
                        }
                    }
                    const orderQ = query(q, orderBy(sortBy, direction), limit(100));
                    const snap = await getDocs(orderQ);
                    return snap.docs.map(d => ({ id: d.id, ...d.data(), type }));
                });
                const results = await Promise.all(promises);
                const merged = results.flat();
                merged.sort((a, b) => {
                    let valA = a[sortBy];
                    let valB = b[sortBy];
                    if (valA && typeof valA.toDate === 'function') {
                        valA = valA.toDate();
                    }
                    if (valB && typeof valB.toDate === 'function') {
                        valB = valB.toDate();
                    }
                    if (valA < valB) {
                        return direction === 'asc' ? -1 : 1;
                    }
                    if (valA > valB) {
                        return direction === 'asc' ? 1 : -1;
                    }
                    return 0;
                });
                let startIndex = 0;
                if (lastDoc) {
                    const idx = merged.findIndex(item => item.id === lastDoc);
                    if (idx !== -1) {
                        startIndex = idx + 1;
                    }
                }
                const paginatedItems = merged.slice(startIndex, startIndex + pageSize);
                const nextLastDoc = paginatedItems.length > 0 ? paginatedItems[paginatedItems.length - 1] : null;
                return {
                    items: paginatedItems,
                    lastDoc: nextLastDoc,
                    empty: paginatedItems.length === 0
                };
            } catch (error) {
                console.error('ContentService Error [fetchItemsByCategory] merged:', error);
                throw error;
            }
        }
    },

    _getCollection(type) {
        if (!type) {
            throw new Error('Invalid content type: Type is null or undefined.');
        }
        return type === 'series' ? SCHEMA.COLLECTIONS.SERIES : SCHEMA.COLLECTIONS.MOVIES;
    }
};



