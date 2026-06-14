import { ContentService } from '../../services/content-service.js';
import { AuthService } from '../../services/auth-service.js';
import { UI } from '../../components/ui.js';

let isRendering = false;
let progressInterval = null; // 🧹 Store interval ID for cleanup
let viewCountIncremented = false; // 📝 Track if view count already incremented
let historySaved = false; // 📝 Track if history already saved

document.addEventListener('DOMContentLoaded', async () => {
    if (window.WATCH_JS_INITIALIZED) {
        return;
    }
    window.WATCH_JS_INITIALIZED = true;

    UI.initNavbar();

    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('id');

    if (!movieId) {
        UI.showErrorPage('ไม่พบรหัสภาพยนตร์');
        return;
    }

    if (isRendering) {
        return;
    }
    isRendering = true;

    try {
        const movie = await ContentService.getItemById('movie', movieId);

        if (movie) {
            UI.updateMeta(movie);

            // Clear container
            const container = document.getElementById('watch-container');
            if (container) {
                container.innerHTML = '';
            }

            // 1. Render Player
            const player = await UI.renderiPhonePlayer(movie, [], 0, false);

            // 2. Single auth state change handler for all auth-dependent operations
            AuthService.onStateChanged(user => {
                if (user) {
                    // Setup periodic progress saving (every 15s)
                    if (player && typeof player.getCurrentTime === 'function') {
                        // 🧹 Clear existing interval if any to prevent multiple intervals
                        if (progressInterval) {
                            clearInterval(progressInterval);
                        }

                        // 🧹 Create new interval and store ID
                        progressInterval = setInterval(async () => {
                            if (typeof player.getCurrentTime === 'function' && typeof player.getDuration === 'function') {
                                const currentTime = player.getCurrentTime();
                                const duration = player.getDuration();
                                const progress = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
                                AuthService.saveWatchHistory(user.uid, { ...movie, type: 'movie' }, progress);
                            }
                        }, 15000);
                    }

                    // Increment View Count (only once per page load)
                    if (!viewCountIncremented) {
                        ContentService.incrementViewCount('movie', movieId);
                        viewCountIncremented = true;
                    }

                    // Save History (initial entry, only once)
                    if (!historySaved) {
                        AuthService.saveWatchHistory(user.uid, { ...movie, type: 'movie' }, 0);
                        historySaved = true;
                    }
                }
            });

            // 4. Bookmark Button Handler
            const bookmarkBtn = document.getElementById('bookmark-btn');
            const bookmarkIcon = document.getElementById('bookmark-icon');
            if (bookmarkBtn) {
                bookmarkBtn.onclick = async () => {
                    const status = await ContentService.toggleWatchlist(movieId, movie, 'movie');
                    if (status.status === 'added') {
                        UI.showToast('เพิ่มลงในรายการรับชมแล้ว', 'success');
                        bookmarkIcon.classList.add('fill-brand-primary', 'text-brand-primary');
                    } else if (status.status === 'removed') {
                        UI.showToast('ลบออกจากรายการรับชมแล้ว', 'info');
                        bookmarkIcon.classList.remove('fill-brand-primary', 'text-brand-primary');
                    }
                };
            }

            // 5. Load Related
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
    if (!grid) {
        return;
    }
    try {
        const related = await ContentService.getRelatedItems('movie', category, currentId, 6);
        UI.renderRelatedGrid(grid, related, 'movie');
    } catch (err) {
        console.error('Related Error:', err);
    }
}

// 🧹 Cleanup function to prevent memory leaks
function cleanup() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

// Add cleanup on page unload
window.addEventListener('beforeunload', cleanup);

// Also cleanup on history navigation
window.addEventListener('popstate', cleanup);

