import { db, auth, onAuthStateChanged, collection, getDocs } from '../services/firebase.js';
import { UI } from '../components/ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    UI.initNavbar();

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            loadWatchlist(user.uid);
        } else {
            window.location.href = '/login.html';
        }
    });
});

async function loadWatchlist(uid) {
    const grid = document.getElementById('watchlist-grid');
    const emptyState = document.getElementById('empty-state');
    if (!grid) {
        return;
    }

    UI.renderSkeleton(grid, 6);

    try {
        const snap = await getDocs(collection(db, 'users', uid, 'bookmarks'));

        // Remove skeletons
        grid.innerHTML = '';

        if (snap.empty) {
            emptyState.classList.remove('hidden');
            return;
        }

        const items = snap.docs.map(d => d.data());
        grid.innerHTML = items.map(item => UI.createMovieCard(item)).join('');
        UI.refreshIcons();
    } catch (err) {
        console.error('Watchlist Load Error:', err);
        UI.showToast('เกิดข้อผิดพลาดในการโหลดรายการโปรด', 'error');
    }
}
