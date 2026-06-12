import { UI } from '/src/components/ui.js';
import { ContentService } from '/src/services/content-service.js';
import { auth, onAuthStateChanged } from '/src/services/firebase.js';
import { UserFooter } from '/src/components/user-footer.js'; // Assuming UserFooter is used

async function init() {
    UI.injectStarfield();
    UI.initNavbar(); // Initialize Navbar
    UserFooter.render(); // Render Footer

    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('id');

    if (!movieId) {
        UI.showToast('ไม่พบ ID ภาพยนตร์', 'error');
        // Redirect or show an error message
        return;
    }

    const watchContainer = document.getElementById('watch-container');
    if (!watchContainer) return;

    // Show loading skeleton or spinner
    watchContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center py-40 space-y-8 animate-pulse">
            <div class="w-20 h-20 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin shadow-[0_0_30px_#fbbf24]"></div>
            <div class="space-y-2 text-center">
                <p class="text-white font-black text-xl uppercase tracking-tighter Thai-font">กำลังเตรียมข้อมูลภาพยนตร์</p>
                <p class="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em]">Initializing Cinematic Stream...</p>
            </div>
        </div>
    `;

    try {
        const movie = await ContentService.fetchItemById('movies', movieId);
        if (movie) {
            UI.renderiPhonePlayer(movie);
        } else {
            UI.showToast('ไม่พบภาพยนตร์นี้', 'error');
            watchContainer.innerHTML = '<p class="text-red-500 text-center py-20">ไม่พบภาพยนตร์ที่ระบุ</p>';
        }
    } catch (err) {
        console.error('Error loading movie:', err);
        UI.showToast('เกิดข้อผิดพลาดในการโหลดภาพยนตร์', 'error');
        watchContainer.innerHTML = '<p class="text-red-500 text-center py-20">เกิดข้อผิดพลาดในการโหลดภาพยนตร์</p>';
    }

    // Fullscreen change listener for better mobile experience
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            document.body.classList.add('theater-mode-active');
        } else {
            document.body.classList.remove('theater-mode-active');
        }
    });
}

document.addEventListener('DOMContentLoaded', init);