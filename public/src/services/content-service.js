import { db, collection, getDocs, doc, getDoc, query, limit, orderBy, startAfter } from './firebase.js';

export const ContentService = {
    fetchTrending: async (count, lastVisible = null) => {
        let q = query(collection(db, 'movies'), orderBy('มุมมอง', 'desc'), limit(count));
        if (lastVisible) {
            q = query(q, startAfter(lastVisible));
        }
        const snap = await getDocs(q);
        const lastVisibleDoc = snap.docs[snap.docs.length - 1];
        return { 
            items: snap.docs.map(d => ({ ...d.data(), id: d.id, title: d.data()['ชื่อ'], poster: d.data()['โปสเตอร์'], type: 'movie' })),
            lastVisible: lastVisibleDoc 
        };
    },
    fetchItemsByCategory: async (category, count, lastVisible = null) => {
        let q = query(collection(db, 'movies'), orderBy('ชื่อ'), limit(count));
        
        if (lastVisible) {
            q = query(q, startAfter(lastVisible));
        }
        const snap = await getDocs(q);
        const lastVisibleDoc = snap.docs[snap.docs.length - 1];
        return { 
            items: snap.docs.map(d => ({ ...d.data(), id: d.id, title: d.data()['ชื่อ'], poster: d.data()['โปสเตอร์'], type: 'movie' })),
            lastVisible: lastVisibleDoc 
        };
    },
    fetchItemById: async (type, id) => {
        const snap = await getDoc(doc(db, type, id));
        return snap.exists() ? { ...snap.data(), id: snap.id, title: snap.data()['ชื่อ'], poster: snap.data()['โปสเตอร์'] } : null;
    },
    searchContent: async (queryText) => {
        const snap = await getDocs(collection(db, 'movies'));
        return snap.docs.map(d => ({ ...d.data(), id: d.id, title: d.data()['ชื่อ'], poster: d.data()['โปสเตอร์'] })).filter(i => i.title?.toLowerCase().includes(queryText.toLowerCase()));
    }
};
