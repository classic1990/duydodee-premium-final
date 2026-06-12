import { UI } from '/src/components/ui.js';
import { ContentService } from '/src/services/content-service.js';
import { UserFooter } from '/src/components/user-footer.js';

/**
 * 📺 DUYดูDEE SERIES WATCH ENGINE
 */
async function init() {
    UI.injectStarfield();
    UI.initNavbar();
    UserFooter.render();

    const params = new URLSearchParams(window.location.search);
    const seriesId = params.get('id');
    const epIndex = parseInt(params.get('ep') || '0');

    if (!seriesId) {
        UI.showToast('ไม่พบ ID ซีรีส์', 'error');
        setTimeout(() => window.location.href = '/', 2000);
        return;
    }

    const watchContainer = document.getElementById('watch-container');

    try {
        const series = await ContentService.fetchItemById('series', seriesId);
        if (series) {
            // ดึงรายชื่อตอนทั้งหมด
            const episodes = await ContentService.fetchEpisodes(seriesId);
            // เรนเดอร์ Player และรายละเอียด
            UI.renderiPhonePlayer(series, episodes, epIndex, true);

            // อัปเดต Title ของเบราว์เซอร์
            document.title = `${series.title} ตอนที่ ${epIndex + 1} | DUYดูDEE`;
        } else {
            UI.showToast('ไม่พบซีรีส์นี้ในระบบ', 'error');
            if (watchContainer) watchContainer.innerHTML = '<p class="text-center py-20 text-gray-500">ไม่พบข้อมูลซีรีส์</p>';
        }
    } catch (err) {
        console.error('Series Watch Error:', err);
        UI.showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    }

    // ระบบตรวจจับการเปลี่ยนโหมด Fullscreen (สำหรับปรับ UI บนมือถือ)
    document.addEventListener('fullscreenchange', () => {
        document.body.classList.toggle('theater-mode-active', !!document.fullscreenElement);
    });
}

document.addEventListener('DOMContentLoaded', init);