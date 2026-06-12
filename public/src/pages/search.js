import { UI } from '../components/ui.js';
import { auth } from '../services/firebase.js';
import { ContentService } from '../services/content-service.js';

/**
 * 🔍 DUYดูDEE SEARCH ENGINE
 * Master Edition - Fast & Responsive
 */
document.addEventListener('DOMContentLoaded', () => {
    UI.injectStarfield();
    UI.initNavbar();

    const searchInput = document.getElementById('search-input');
    const yearFilter = document.getElementById('year-filter');
    const typeFilter = document.getElementById('type-filter'); // New: Get type filter element

    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 500));
    }
    if (yearFilter) {
        yearFilter.addEventListener('change', () => handleSearch({ target: searchInput }));
    }
    if (typeFilter) { // New: Add event listener for type filter
        typeFilter.addEventListener('change', () => handleSearch({ target: searchInput }));
    }
});

async function handleSearch(e) {
    const query = e.target.value.trim();
    const year = document.getElementById('year-filter')?.value || '';
    const type = document.getElementById('type-filter')?.value || 'all';
    const grid = document.getElementById('search-grid');

    if (query.length < 2 && !year) {
        grid.innerHTML = '';
        return;
    }

    UI.renderSkeleton(grid, 6);

    try {
        const [results, favorites] = await Promise.all([
            ContentService.searchContent(query, type, year),
            auth.currentUser ? ContentService.fetchWatchlist(auth.currentUser.uid) : Promise.resolve([])
        ]);

        const favIds = new Set(favorites.map(f => f.id));

        if (results.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-20 uppercase tracking-widest font-black">ไม่พบผลลัพธ์ที่ค้นหา</p>';
            return;
        }

        grid.innerHTML = results.map(item => UI.createCard(item, favIds.has(item.id))).join('');
        if (window.lucide) window.lucide.createIcons();
    } catch (err) {
        console.error('Search Error:', err);
        UI.showToast('เกิดข้อผิดพลาดในการค้นหา', 'error');
    }
}

function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}
