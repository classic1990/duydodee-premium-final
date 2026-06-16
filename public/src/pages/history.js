import { db, auth, onAuthStateChanged, collection, getDocs, query, orderBy } from '../services/firebase.js';
import { UI } from '../components/ui.js';
import { SCHEMA } from '../constants.js';

document.addEventListener('DOMContentLoaded', async () => {
    UI.initNavbar();

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            loadHistory(user.uid);
        } else {
            window.location.href = '/login.html';
        }
    });
});

async function loadHistory(uid) {
    const grid = document.getElementById('history-grid');
    const emptyState = document.getElementById('empty-state');
    if (!grid) {
        return;
    }

    UI.renderSkeleton(grid, 6);

    try {
        const historyQuery = query(
            collection(db, SCHEMA.COLLECTIONS.USERS, uid, 'history'),
            orderBy('lastViewedAt', 'desc')
        );
        const snap = await getDocs(historyQuery);

        grid.innerHTML = '';

        if (snap.empty) {
            emptyState.classList.remove('hidden');
            return;
        }

        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        grid.innerHTML = items.map(item => UI.createMovieCard(item)).join('');
        UI.refreshIcons();
    } catch (err) {
        console.error('History Load Error:', err);
        UI.showToast('เกิดข้อผิดพลาดในการโหลดประวัติ', 'error');
    }
}
