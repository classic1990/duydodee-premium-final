import { ContentService } from '../../services/content-service.js';
import { AuthService } from '../../services/auth-service.js';
import { UI } from '../../components/ui.js';

let isRendering = false;

document.addEventListener('DOMContentLoaded', async () => {
    if (window.WATCH_JS_INITIALIZED) return;
    window.WATCH_JS_INITIALIZED = true;

    UI.initNavbar();

    const params = new URLSearchParams(window.location.search);
    const seriesId = params.get('id');
    const epIndex = parseInt(params.get('ep')) || 0;

    if (!seriesId) {
        UI.showErrorPage('ไม่พบรหัสซีรีส์');
        return;
    }

    if (isRendering) return;
    isRendering = true;

    try {
        const series = await ContentService.getItemById('series', seriesId);

        if (series) {
            const episodes = await ContentService.getEpisodes(seriesId);

            if (episodes.length === 0) {
                UI.showErrorPage('ยังไม่มีตอนในซีรีส์ชุดนี้');
                return;
            }

            const currentEp = episodes[epIndex] || episodes[0];
            UI.updateMeta({
                ...series,
                title: `${series.title} : ${currentEp.title}`
            });

            const container = document.getElementById('watch-container');
            if (container) container.innerHTML = '';

            // 1. Render Player
            const player = await UI.renderiPhonePlayer(series, episodes, epIndex, true);

            // Setup periodic progress saving (every 15s)
            if (player) {
                AuthService.onStateChanged(user => {
                    if (user) {
                        setInterval(async () => {
                            if (typeof player.getCurrentTime === 'function' && typeof player.getDuration === 'function') {
                                const currentTime = player.getCurrentTime();
                                const duration = player.getDuration();
                                const progress = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
                                AuthService.saveWatchHistory(user.uid, { ...series, type: 'series', epIndex: epIndex }, progress);
                            }
                        }, 15000);
                    }
                });
            }

            // 2. Increment View Count
            ContentService.incrementViewCount('series', seriesId);

            // 3. Save History (initial entry)
            AuthService.onStateChanged(user => {
                if (user) AuthService.saveWatchHistory(user.uid, { ...series, type: 'series', epIndex: epIndex }, 0);
            });

            // 4. Load Related
            loadRelated(series.category, seriesId);
        } else {
            UI.showErrorPage('ไม่พบข้อมูลซีรีส์ที่คุณต้องการ');
        }
    } catch (e) {
        console.error('Watch Series Error:', e);
        UI.showErrorPage('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
        isRendering = false;
    }
});

async function loadRelated(category, currentId) {
    const grid = document.getElementById('related-grid');
    if (!grid) return;
    try {
        const related = await ContentService.getRelatedItems('series', category, currentId, 6);
        UI.renderRelatedGrid(grid, related, 'series');
    } catch (err) {
        console.error('Related Error:', err);
    }
}



