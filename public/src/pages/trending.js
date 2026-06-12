import { ContentService } from '/src/services/content-service.js';
import { auth } from '/src/services/firebase.js';
import { UI } from '/src/components/ui.js';
import { UserFooter } from '/src/components/user-footer.js';

let allItems = [];
let activeFilter = 'all';

async function init() {
    UI.initNavbar();
    UserFooter.render();
    UI.injectStarfield();

    const grid = document.getElementById('trending-grid');
    UI.renderSkeleton(grid, 12);

    try {
        // ดึงข้อมูลมาใหม่ล่าสุด 24 รายการ
        allItems = await ContentService.fetchRecentArrivals(24);
        renderContent();
        setupFilters();
    } catch (err) {
        console.error('Trending Load Error:', err);
        grid.innerHTML = '<p class="text-red-500 text-center col-span-full">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
    }
}

async function renderContent() {
    const grid = document.getElementById('trending-grid');
    const emptyState = document.getElementById('empty-state');

    const favorites = auth.currentUser
        ? await ContentService.fetchWatchlist(auth.currentUser.uid)
        : [];
    const favIds = new Set(favorites.map(f => f.id));

    const filteredItems = activeFilter === 'all'
        ? allItems
        : allItems.filter(item => item.type === activeFilter);

    if (filteredItems.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        grid.innerHTML = filteredItems.map(item => UI.createCard(item, favIds.has(item.id))).join('');
        if (window.lucide) window.lucide.createIcons();
    }
}

function setupFilters() {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('bg-brand-primary', 'text-black'));
            btns.forEach(b => b.classList.add('bg-white/5', 'text-gray-400'));

            btn.classList.replace('bg-white/5', 'bg-brand-primary');
            btn.classList.replace('text-gray-400', 'text-black');

            activeFilter = btn.dataset.filter;
            renderContent();
        });
    });
}

document.addEventListener('DOMContentLoaded', init);