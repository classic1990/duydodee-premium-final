import { db, collection, getDocs, doc, getDoc, query, limit, orderBy, startAfter, setDoc, deleteDoc, serverTimestamp, SCHEMA } from '/src/services/firebase.js';

export const ContentService = {
    _getCollection: (type) => {
        if (!type) {
            throw new Error('Invalid content type: Type is null or undefined.');
        }
        if (type === 'movie') return 'movies';
        if (type === 'series') return 'series';
        return type;
    },
    fetchRecentArrivals: async (count) => {
        const [moviesSnap, seriesSnap] = await Promise.all([
            getDocs(query(collection(db, 'movies'), orderBy('createdAt', 'desc'), limit(count))),
            getDocs(query(collection(db, 'series'), orderBy('createdAt', 'desc'), limit(count)))
        ]);

        const movies = moviesSnap.docs.map(d => ({ ...d.data(), id: d.id, type: 'movie' }));
        const series = seriesSnap.docs.map(d => ({ ...d.data(), id: d.id, type: 'series' }));

        // รวมและเรียงตามวันที่สร้างล่าสุด
        return [...movies, ...series]
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
            .slice(0, count)
            .map(item => ({ ...item, title: item.title || '', poster: item.poster || '' }));
    },
    fetchTrending: async (count, lastVisible = null) => {
        let q = query(collection(db, 'movies'), orderBy('views', 'desc'), limit(count));
        if (lastVisible) {
            q = query(q, startAfter(lastVisible));
        }
        const snap = await getDocs(q);
        const lastVisibleDoc = snap.docs[snap.docs.length - 1];
        return {
            items: snap.docs.map(d => ({ ...d.data(), id: d.id, title: d.title || '', poster: d.poster || '', type: 'movie' })),
            lastVisible: lastVisibleDoc
        };
    },
    fetchItemsByCategory: async (category, count, lastVisible = null) => {
        let q = query(collection(db, 'movies'), orderBy('title'), limit(count));

        if (lastVisible) {
            q = query(q, startAfter(lastVisible));
        }
        const snap = await getDocs(q);
        const lastVisibleDoc = snap.docs[snap.docs.length - 1];
        return {
            items: snap.docs.map(d => ({ ...d.data(), id: d.id, title: d.title || '', poster: d.poster || '', type: 'movie' })),
            lastVisible: lastVisibleDoc
        };
    },
    fetchItemById: async (type, id) => {
        const snap = await getDoc(doc(db, type, id));
        return snap.exists() ? { ...snap.data(), id: snap.id, title: snap.title || '', poster: snap.poster || '' } : null;
    },
    searchContent: async (queryText, typeFilter = 'all', yearFilter = '') => {
        let results = [];

        const fetchMovies = async () => {
            const snap = await getDocs(collection(db, 'movies'));
            return snap.docs.map(d => ({ ...d.data(), id: d.id, type: 'movie' }));
        };

        const fetchSeries = async () => {
            const snap = await getDocs(collection(db, 'series'));
            return snap.docs.map(d => ({ ...d.data(), id: d.id, type: 'series' }));
        };

        if (typeFilter === 'movie') results = await fetchMovies();
        else if (typeFilter === 'series') results = await fetchSeries();
        else {
            const [m, s] = await Promise.all([fetchMovies(), fetchSeries()]);
            results = [...m, ...s];
        }

        return results
            .map(i => ({ ...i, title: i.title || '', poster: i.poster || '' }))
            .filter(i => {
                const matchTitle = i.title.toLowerCase().includes(queryText.toLowerCase());
                const matchYear = yearFilter ? (i.year == yearFilter || i.releaseYear == yearFilter) : true;
                return matchTitle && matchYear;
            });
    },
    fetchEpisodes: async (seriesId) => {
        // Fetch episodes from the series document
        const seriesSnap = await getDoc(doc(db, 'series', seriesId));
        if (!seriesSnap.exists()) return [];

        const data = seriesSnap.data();
        return data.episodes || [];
    },
    // ─── Watchlist / My List System ───────────────────────────────────────────
    toggleWatchlist: async (uid, item) => {
        const favRef = doc(db, SCHEMA.COLLECTIONS.USERS, uid, 'bookmarks', item.id);
        const snap = await getDoc(favRef);

        if (snap.exists()) {
            await deleteDoc(favRef);
            return { status: 'removed', message: 'ลบออกจากรายการโปรดแล้ว' };
        } else {
            await setDoc(favRef, {
                id: item.id,
                title: item.title,
                poster: item.poster,
                type: item.type || 'movie',
                addedAt: serverTimestamp()
            });
            return { status: 'added', message: 'บันทึกลงรายการโปรดแล้ว' };
        }
    },
    checkIsFavorite: async (uid, itemId) => {
        if (!uid) return false;
        const favRef = doc(db, SCHEMA.COLLECTIONS.USERS, uid, 'bookmarks', itemId);
        const snap = await getDoc(favRef);
        return snap.exists();
    },
    fetchWatchlist: async (uid) => {
        const watchlistRef = collection(db, SCHEMA.COLLECTIONS.USERS, uid, 'bookmarks');
        const q = query(watchlistRef, orderBy('addedAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({
            ...d.data(),
            id: d.id
        }));
    },
    // ─── History / Continue Watching System ──────────────────────────────────
    saveHistory: async (uid, item, epIndex = null) => {
        if (!uid || !item.id) return;
        const historyRef = doc(db, SCHEMA.COLLECTIONS.USERS, uid, 'history', item.id);
        await setDoc(historyRef, {
            id: item.id,
            title: item.title,
            poster: item.poster,
            type: item.type || 'movie',
            epIndex: epIndex,
            lastWatched: serverTimestamp()
        }, { merge: true });
    },
    fetchHistory: async (uid, maxItems = 10) => {
        if (!uid) return [];
        const historyRef = collection(db, SCHEMA.COLLECTIONS.USERS, uid, 'history');
        const q = query(historyRef, orderBy('lastWatched', 'desc'), limit(maxItems));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ ...d.data(), id: d.id }));
    },
    deleteHistory: async (uid, itemId) => {
        if (!uid || !itemId) return;
        await deleteDoc(doc(db, SCHEMA.COLLECTIONS.USERS, uid, 'history', itemId));
    }
};
