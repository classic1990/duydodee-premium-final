import { ContentService } from './services/content-service.js';
import { AuthService } from './services/auth-service.js';
import { UI } from './components/ui.js';

let isRendering = false;

document.addEventListener('DOMContentLoaded', async () => {
    if (window.WATCH_JS_INITIALIZED) return;
    window.WATCH_JS_INITIALIZED = true;

    UI.initNavbar();
    
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('id');

    if (!movieId) {
        UI.showErrorPage('ไม่พบรหัสภาพยนตร์');
        return;
    }

    if (isRendering) return;
    isRendering = true;

    try {
        const movie = await ContentService.getItemById('movie', movieId);
        
        if (movie) {
            UI.updateMeta(movie);

            // Clear container
            const container = document.getElementById('watch-container');
            if (container) container.innerHTML = '';

            // 1. Render Player
            UI.renderiPhonePlayer(movie, [], 0, false);

            // 2. Increment View Count
            ContentService.incrementViewCount('movie', movieId);

            // 3. Save History
            AuthService.onStateChanged(user => {
                if (user) AuthService.saveWatchHistory(user.uid, { ...movie, type: 'movie' });
            });

            // 4. Load Related
            loadRelated(movie.category, movieId);
        } else {
            // Fallback to series check
            const series = await ContentService.getItemById('series', movieId);
            if (series) {
                window.location.href = `/watch-series.html?id=${movieId}`;
            } else {
                UI.showErrorPage('ไม่พบข้อมูลภาพยนตร์ที่คุณต้องการ');
            }
        }
    } catch (e) {
        console.error('Watch Page Error:', e);
        UI.showErrorPage('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
        isRendering = false;
    }
});

async function loadRelated(category, currentId) {
    const grid = document.getElementById('related-grid');
    if (!grid) return;
    try {
        const related = await ContentService.getRelatedItems('movie', category, currentId, 6);
        UI.renderRelatedGrid(grid, related, 'movie');
    } catch (err) {
        console.error('Related Error:', err);
    }
}


