import { auth, onAuthStateChanged, db, SCHEMA, collection, getDocs, query, orderBy } from '../services/firebase.js';
import { UI } from '../components/ui.js';

document.addEventListener('DOMContentLoaded', () => {
    UI.injectStarfield();
    UI.initNavbar();

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = '/login.html';
            return;
        }
        loadWatchlist(user.uid);
    });
});

async function loadWatchlist(uid) {
    const grid = document.getElementById('watchlist-grid');
    if (!grid) return;

    UI.renderSkeleton(grid, 6);

    try {
        const watchlistRef = collection(db, SCHEMA.COLLECTIONS.USERS, uid, 'bookmarks');
        const q = query(watchlistRef, orderBy('addedAt', 'desc'));
        const snap = await getDocs(q);

        if (snap.empty) {
            grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-20 uppercase tracking-widest font-black">คุณยังไม่มีรายการที่บันทึกไว้</p>';
            return;
        }

        grid.innerHTML = snap.docs.map(doc => UI.createCard({ ...doc.data(), id: doc.id })).join('');
    } catch (err) {
        console.error('Watchlist Load Error:', err);
    }
}
