import { auth, onAuthStateChanged } from '/src/services/firebase.js';
import { UI } from '/src/components/ui.js';
import { ContentService } from '/src/services/content-service.js';

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
        const items = await ContentService.fetchWatchlist(uid);

        if (items.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-20 uppercase tracking-widest font-black">คุณยังไม่มีรายการที่บันทึกไว้</p>';
            return;
        }

        grid.innerHTML = items.map(item => UI.createCard(item, true)).join('');
        if (window.lucide) window.lucide.createIcons();
    } catch (err) {
        console.error('Watchlist Load Error:', err);
        grid.innerHTML = '<p class="col-span-full text-center text-red-500 py-20">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
    }
}
