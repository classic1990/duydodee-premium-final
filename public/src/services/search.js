import { ContentService } from '../../services/content-service.js';
import { UI } from '../../components/ui.js';

/**
 * 🔍 DUYดูDEE SEARCH ENGINE - Domain-Refactored
 */
document.addEventListener('DOMContentLoaded', () => {
    UI.injectStarfield();
    UI.initNavbar();

    const searchInput = document.getElementById('search-input');
    const resultsGrid = document.getElementById('search-results');
    let debounceTimer;

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.trim();
            clearTimeout(debounceTimer);

            if (keyword.length < 2) {
                resultsGrid.innerHTML = '';
                return;
            }

            debounceTimer = setTimeout(() => performSearch(keyword), 300);
        });
    }
});

async function performSearch(keyword) {
    const grid = document.getElementById('search-results');
    UI.renderSkeleton(grid, 6);

    try {
        // ดึงข้อมูลผ่าน ContentService ตาม AI GUIDELINES - ค้นหาทั้ง movies และ series
        const movieResults = await ContentService.searchItems('movie', keyword, 12);
        const seriesResults = await ContentService.searchItems('series', keyword, 12);

        // รวมผลลัพธ์และเรียงตาม relevance
        const allResults = [...movieResults, ...seriesResults];

        grid.innerHTML = '';

        if (allResults.length === 0) {
            UI.renderEmptyState(grid, `ไม่พบผลลัพธ์สำหรับ "${keyword}"`);
            return;
        }

        grid.innerHTML = allResults.map(item => UI.createMovieCard(item)).join('');
        UI.refreshIcons();

    } catch (error) {
        console.error('Search Error:', error);
        UI.showToast('การค้นหาขัดข้อง กรุณาลองใหม่', 'error');
    }
}
