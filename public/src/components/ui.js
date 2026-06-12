/**
 * 🎨 DUYดูDEE UI CORE ENGINE
 * Clean, modular, and high-performance UI components.
 */
import { auth, onAuthStateChanged, db, doc, getDoc, SCHEMA } from '/src/services/firebase.js';
import { ContentService } from '/src/services/content-service.js';

export const UI = {
    initNavbar: () => {
        const nav = document.getElementById('main-nav');
        if (!nav) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                nav.classList.add('bg-brand-black/90', 'backdrop-blur-xl');
            } else {
                nav.classList.remove('bg-brand-black/90', 'backdrop-blur-xl');
            }
        }, { passive: true });

        UI.updateAuthStatus();
    },

    updateAuthStatus: () => {
        const authAreas = [document.getElementById('user-auth-area'), document.getElementById('user-auth-area-mobile')].filter(Boolean);
        if (authAreas.length === 0) return;

        onAuthStateChanged(auth, async (user) => {
            authAreas.forEach(async (authArea) => {
                if (user) {
                    try {
                        const userSnap = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, user.uid));
                        const userData = userSnap.exists() ? userSnap.data() : {};

                        authArea.innerHTML = `
                            <div class="flex items-center gap-4">
                                <a href="/profile.html" class="flex items-center gap-3 group" aria-label="ไปที่หน้าโปรไฟล์ของคุณ">
                                    <div class="w-10 h-10 rounded-xl border border-white/10 overflow-hidden group-hover:border-brand-primary transition-colors">
                                        <img src="${userData.photoURL || '/assets/logo/DUYDODEE.png'}" class="w-full h-full object-cover" alt="รูปโปรไฟล์ของคุณ">
                                    </div>
                                </a>
                            </div>
                        `;
                    } catch (err) {
                        console.error('UI Auth Error:', err);
                    }
                } else {
                    authArea.innerHTML = `
                        <a href="/login.html" class="bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl hover:scale-105 transition-transform">
                            เข้าสู่ระบบ
                        </a>
                    `;
                }
            });
        });
    },

    injectStarfield: () => {
        if (document.querySelector('.star-field')) return;
        const field = document.createElement('div');
        field.className = 'star-field fixed inset-0 z-0 pointer-events-none';
        field.innerHTML = `
            <div class="star-layer"></div>
            <div class="mesh-gradient-bg"></div>
        `;
        document.body.prepend(field);
    },

    showToast: (message, type = 'success', title = '') => {
        const container = document.getElementById('toast-container') || (() => {
            const c = document.createElement('div');
            c.id = 'toast-container';
            c.className = 'fixed bottom-8 right-8 z-[2000] flex flex-col gap-3';
            document.body.appendChild(c);
            return c;
        })();

        const toast = document.createElement('div');
        const styles = {
            success: { class: 'bg-green-500/10 border-green-500/50 text-green-500', icon: 'check-circle' },
            error: { class: 'bg-red-500/10 border-red-500/50 text-red-500', icon: 'x-circle' },
            info: { class: 'bg-blue-500/10 border-blue-500/50 text-blue-500', icon: 'info' },
            warning: { class: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500', icon: 'alert-triangle' }
        };

        const toastStyle = styles[type] || styles.success;
        const iconHtml = `<i data-lucide="${toastStyle.icon}" class="w-5 h-5"></i>`;
        const titleHtml = title ? `<p class="text-sm font-bold">${title}</p>` : '';
        const messageHtml = `<p class="text-xs">${message}</p>`;

        toast.className = `flex items-start gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl animate-fade-left ${toastStyle.class}`;
        toast.innerHTML = `
            ${iconHtml}
            <div>
                ${titleHtml}
                ${messageHtml}
            </div>
        `;

        container.appendChild(toast);
        // Re-render Lucide icons for the newly added toast
        if (window.lucide) {
            window.lucide.createIcons();
        }

        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-x-full');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    // Placeholder for setLoading, as it's used in other files but not defined here.
    // This should ideally be a more robust loading indicator.
    setLoading: (isLoading) => {
        const loadingOverlay = document.getElementById('loading-overlay') || document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.className = 'fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center text-white text-xl hidden';
        loadingOverlay.innerHTML = '<div class="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>';
        if (!document.getElementById('loading-overlay')) document.body.appendChild(loadingOverlay);

        if (isLoading) loadingOverlay.classList.remove('hidden');
        else loadingOverlay.classList.add('hidden');
    },

    createCard: (item, isFavorite = false) => {
        const title = item.title || 'Untitled';
        const poster = item.poster || '/assets/logo/DUYDODEE.png';
        const type = item.type || 'movie';
        const id = item.id;
        const watchUrl = type === 'series' ? `/watch-series.html?id=${id}` : `/watch-movie.html?id=${id}`;
        const favClass = isFavorite ? 'text-red-500 fill-red-500' : 'text-white';

        return `
            <div class="group relative aspect-[2/3] rounded-2xl overflow-hidden bg-brand-obsidian border border-white/5 cursor-pointer" 
                 onclick="window.location.href='${watchUrl}'">
                <img src="${poster}" alt="${title}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy">
                
                <!-- Favorite Button -->
                <button onclick="event.stopPropagation(); window.UI.toggleFavorite('${id}', '${type}', this)" aria-label="บันทึกเรื่องนี้ลงรายการโปรด"
                        class="absolute top-3 right-3 z-10 w-9 h-9 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-brand-primary hover:text-black transition-all shadow-lg">
                    <i data-lucide="heart" class="w-4 h-4 ${favClass}"></i>
                </button>

                <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                
                <div class="absolute bottom-0 inset-x-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 class="text-white font-bold text-xs md:text-sm line-clamp-1 mb-1">${title}</h3>
                    <div class="flex items-center gap-2 text-[10px] text-brand-primary font-black uppercase tracking-widest">
                        <span class="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse"></span>
                        รับชมเลย
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * ❤️ Toggle Favorite Action
     */
    toggleFavorite: async (itemId, type, btn) => {
        const user = auth.currentUser;
        if (!user) {
            UI.showToast('กรุณาเข้าสู่ระบบเพื่อบันทึกรายการโปรด', 'info');
            return;
        }

        try {
            const result = await ContentService.toggleWatchlist(user.uid, { id: itemId, type });
            const svg = btn.querySelector('svg'); // Lucide replaces <i> with <svg>

            UI.showToast(result.message, 'success');

            if (result.status === 'added') {
                svg?.classList.add('text-red-500', 'fill-red-500');
                svg?.classList.remove('text-white');
            } else {
                svg?.classList.remove('text-red-500', 'fill-red-500');
                svg?.classList.add('text-white');
            }

        } catch (err) {
            UI.showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
        }
    },

    renderSkeleton: (container, count = 8) => {
        if (!container) return;
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="aspect-[2/3] bg-white/5 rounded-2xl animate-pulse flex flex-col p-4 justify-end gap-2">
                    <div class="h-3 w-3/4 bg-white/10 rounded-full"></div>
                    <div class="h-2 w-1/2 bg-white/10 rounded-full"></div>
                </div>
            `;
        }
        container.innerHTML = html;
    },

    /**
     * 🔢 Pagination Component
     * @param {HTMLElement} container - เป้าหมายที่จะแสดง Pagination
     * @param {number} totalItems - จำนวนรายการทั้งหมด
     * @param {number} pageSize - จำนวนต่อหน้า
     * @param {number} currentPage - หน้าปัจจุบัน
     * @param {Function} onPageChange - Callback เมื่อเปลี่ยนหน้า
     */
    renderPagination: (container, totalItems, pageSize, currentPage, onPageChange) => {
        if (!container) return;
        const totalPages = Math.ceil(totalItems / pageSize);
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '<div class="flex items-center justify-center gap-2 mt-12">';

        // ปุ่มก่อนหน้า
        html += `
            <button ${currentPage === 1 ? 'disabled' : ''} onclick="window.handlePageChange(${currentPage - 1})" 
                class="w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 text-white'}">
                <i data-lucide="chevron-left" class="w-4 h-4"></i>
            </button>
        `;

        // ตัวเลขหน้า
        for (let i = 1; i <= totalPages; i++) {
            const isActive = i === currentPage;
            html += `
                <button onclick="window.handlePageChange(${i})" 
                    class="w-10 h-10 rounded-xl text-xs font-black transition-all ${isActive ? 'bg-brand-primary text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}">
                    ${i}
                </button>
            `;
        }

        // ปุ่มถัดไป
        html += `
            <button ${currentPage === totalPages ? 'disabled' : ''} onclick="window.handlePageChange(${currentPage + 1})" 
                class="w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 text-white'}">
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </button>
        </div>`;

        container.innerHTML = html;
        window.handlePageChange = onPageChange;
        if (window.lucide) window.lucide.createIcons();
    },

    renderiPhonePlayer: async (item, episodes = [], epIndex = 0, isSeries = false) => {
        const container = document.getElementById('watch-container');
        if (!container) return;

        // Get video URL and poster
        const videoUrl = item.videoUrl || item.video_url || '';
        const poster = item.poster || item['โปสเตอร์'] || '';
        const title = item.title || item['ชื่อ'] || '';

        // Determine current episode video URL
        let currentVideoUrl = videoUrl;
        if (isSeries && episodes.length > 0 && episodes[epIndex]) {
            currentVideoUrl = episodes[epIndex].videoUrl || episodes[epIndex].video_url || videoUrl;
        }

        // Save to Continue Watching history
        if (auth.currentUser) {
            ContentService.saveHistory(auth.currentUser.uid, item, isSeries ? epIndex : null);
        }

        // Build player HTML
        const playerHTML = `
            <div class="w-full"> <!-- Player container now takes full width -->
                <!-- Video Player Container -->
                <div class="relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-brand-primary/10">
                    <div class="absolute inset-0 flex items-center justify-center bg-brand-obsidian">
                        <div class="text-center space-y-4">
                            <div class="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                <i data-lucide="play" class="w-8 h-8 text-white"></i>
                            </div>
                            <p class="text-white text-sm font-bold">${isSeries ? `ตอนที่ ${epIndex + 1}` : 'เล่นวิดีโอ'}</p>
                        </div>
                    </div>

                    <!-- Video Embed (iframe for YouTube) -->
                    ${currentVideoUrl ? `
                        <iframe
                            id="main-video-player"
                            class="absolute inset-0 w-full h-full"
                            src="${currentVideoUrl}"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen>
                        </iframe>
                    ` : ''}
                </div>

                <!-- Video Info -->
                <div class="max-w-4xl mx-auto mt-6 space-y-4 px-6 md:px-0"> <!-- Info section is max-width and centered -->
                    <h1 class="text-2xl font-black text-white">${title}</h1>
                    ${item.description || item['เรื่องย่อ'] ? `
                        <p class="text-gray-400 text-sm leading-relaxed">${item.description || item['เรื่องย่อ']}</p>
                    ` : ''}
                    ${item.category || item['หมวดหมู่'] ? `
                        <div class="flex gap-2">
                            <span class="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-black rounded-full">
                                ${item.category || item['หมวดหมู่']}
                            </span>
                        </div>
                    ` : ''}
                </div>
                ${isSeries ? UI._buildEpSelector(episodes, item.id, epIndex) : ''}
            </div>
        `;

        container.innerHTML = playerHTML;

        // Re-initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    },

    _buildEpSelector: (episodes, seriesId, currentIndex) => {
        if (!episodes || episodes.length === 0) return '';

        let html = `
            <div class="max-w-4xl mx-auto mt-8">
                <h3 class="text-lg font-black text-white mb-4">เลือกตอน</h3>
                <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        `;

        episodes.forEach((ep, index) => {
            const isActive = index === currentIndex;
            html += `
                <a href="/watch-series?id=${seriesId}&ep=${index}"
                   class="py-3 px-2 rounded-xl text-center font-bold text-xs transition-all
                          ${isActive
                    ? 'bg-brand-primary text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}">
                    ${index + 1}
                </a>
            `;
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }
};

window.UI = UI;
