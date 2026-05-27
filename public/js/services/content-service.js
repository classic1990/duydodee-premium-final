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
        if (!videoUrl) return { exists: false };
        const videoId = UI.extractYouTubeId(videoUrl);
        if (!videoId) return { exists: false };

        const normalizedEmbedUrl = `https://www.youtube.com/embed/${videoId}`;

        try {
            // 1. Check Movies (via normalized embedURL)
            const mQuery = query(collection(db, SCHEMA.COLLECTIONS.MOVIES), where('embedURL', '==', normalizedEmbedUrl), limit(1));
            const mSnap = await getDocs(mQuery);
            if (!mSnap.empty) return { exists: true, type: 'movie', data: mSnap.docs[0].data() };

            // 2. Check Series Episodes (via normalized embedURL)
            const eQuery = query(collectionGroup(db, 'episodes'), where('embedURL', '==', normalizedEmbedUrl), limit(1));
            const eSnap = await getDocs(eQuery);
            if (!eSnap.empty) return { exists: true, type: 'series', data: eSnap.docs[0].data() };

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
            if (lastDoc) q = query(q, startAfter(lastDoc));

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

    _getCollection(type) {
        if (!type) {
            throw new Error('Invalid content type: Type is null or undefined.');
        }
        return type === 'series' ? SCHEMA.COLLECTIONS.SERIES : SCHEMA.COLLECTIONS.MOVIES;
    }
};

