import { UI } from '../../components/ui.js';
import { ContentService } from '../../services/content-service.js';

/**
 * 🎥 DUYดูDEE SERIES WATCH ENGINE
 * Master Edition - Episode Selection & Player
 */
document.addEventListener('DOMContentLoaded', async () => {
    UI.injectStarfield();
    UI.initNavbar();

    const params = new URLSearchParams(window.location.search);
    const seriesId = params.get('id');
    const epIndex = parseInt(params.get('ep')) || 0;

    if (!seriesId) {
        window.location.href = '/';
        return;
    }

    loadSeriesContent(seriesId, epIndex);
});

async function loadSeriesContent(id, epIndex) {
    try {
        const series = await ContentService.fetchItemById('series', id);
        
        if (!series) {
            UI.showToast('ไม่พบข้อมูลซีรีส์', 'error');
            setTimeout(() => window.location.href = '/', 2000);
            return;
        }

        // Fetch episodes
        const episodes = await ContentService.fetchEpisodes(id);

        // Render Premium Player with Episode Selector
        await UI.renderiPhonePlayer(series, episodes, epIndex, true);
        
        // Inject Episode Selector below player
        const watchContainer = document.getElementById('watch-container');
        if (watchContainer && episodes.length > 0) {
            watchContainer.insertAdjacentHTML('beforeend', UI._buildEpSelector(episodes, id, epIndex));
        }

        // Update Metadata
        document.title = `${series.title} - ตอนที่ ${epIndex + 1} | DUYดูDEE PREMIUM`;

    } catch (err) {
        console.error('Watch Series Error:', err);
        UI.showToast('เกิดข้อผิดพลาดในการโหลดเนื้อหา', 'error');
    }
}
