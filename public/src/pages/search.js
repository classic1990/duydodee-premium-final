import { UI } from '../components/ui.js';
import { ContentService } from '../services/content-service.js';

/**
 * 🔍 DUYดูDEE SEARCH ENGINE - Unified Master Edition
 * Searches across Movies and Series using ContentService
 */
document.addEventListener('DOMContentLoaded', () => {
    UI.injectStarfield();
    UI.initNavbar();

    const searchInput = document.getElementById('search-input');
    const resultsGrid = document.getElementById('search-results');
    let debounceTimer;

    // Check for initial query in URL
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    if (initialQuery && searchInput) {
        searchInput.value = initialQuery;
        performSearch(initialQuery);
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.trim();
            clearTimeout(debounceTimer);

            if (keyword.length < 2) {
                if (resultsGrid) {
                    resultsGrid.innerHTML = '';
                }
                return;
            }

            // ⏲️ Debounce 400ms เพื่อประหยัด Firestore/Function Calls
            debounceTimer = setTimeout(() => performSearch(keyword), 400);
        });
    }
});

async function performSearch(keyword) {
    const grid = document.getElementById('search-results');
    if (!grid) {
        return;
    }

    UI.renderSkeleton(grid, 8);

    try {
        // Use ContentService which handles hybrid Function/Firestore search
        const results = await ContentService.searchItems(keyword, 20);

        // results structure: { movies: [], series: [] } OR just flat array if function returns it
        // Our fallback returns { movies, series }, let's normalize
        let allResults = [];
        if (Array.isArray(results)) {
            allResults = results;
        } else {
            allResults = [...(results.movies || []), ...(results.series || [])];
        }

        grid.innerHTML = '';

        if (allResults.length === 0) {
            UI.renderEmptyState(grid, `ไม่พบผลลัพธ์สำหรับ "${keyword}"`);
            return;
        }

        // Sort by title for consistency
        allResults.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

        grid.innerHTML = allResults.map(item => UI.createMovieCard(item)).join('');
        UI.refreshIcons();

    } catch (error) {
        console.error('Search Error:', error);
        UI.showToast('การค้นหาขัดข้อง กรุณาลองใหม่', 'error');
        grid.innerHTML = '<div class="col-span-full py-20 text-center text-red-500 Thai-font">ระบบค้นหาขัดข้องชั่วคราว</div>';
    }
}
