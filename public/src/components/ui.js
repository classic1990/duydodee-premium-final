/* global YT */
import {
    db,
    auth,
    onSnapshot,
    query,
    collection,
    where,
    orderBy,
    checkIsAdmin,
    onAuthStateChanged
} from '../services/firebase.js';
import { SCHEMA } from '../constants.js';
import { UIUtils } from '../utils/ui-utils.js';
import {
    doc,
    getDoc,
    addDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export const UI = {
    ...UIUtils,

    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    setCounter: (id, count) => {
        const el = document.getElementById(id);
        if (el) {
            let current = 0;
            const target = parseInt(count);
            const step = Math.ceil(target / 20);
            const interval = setInterval(() => {
                current += step;
                if (current >= target) {
                    el.innerText = target.toLocaleString();
                    clearInterval(interval);
                } else {
                    el.innerText = current.toLocaleString();
                }
            }, 50);
        }
    },

    setLoading: (isLoading) => {
        let loader = document.getElementById('global-loader');
        if (isLoading && !loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.className =
        'fixed inset-0 z-[9999] bg-brand-black/95 backdrop-blur-3xl flex items-center justify-center animate-fade-in';
            loader.innerHTML =
        '<div class="text-[10px] font-black text-brand-primary uppercase tracking-[0.8em] animate-pulse">กำลังโหลดข้อมูล...</div>';
            document.body.appendChild(loader);
        } else if (!isLoading && loader) {
            loader.remove();
        }
    },

    showToast: (message, type = 'success') => {
        const container =
      document.getElementById('toast-container') ||
      (() => {
          const c = document.createElement('div');
          c.id = 'toast-container';
          c.className = 'fixed bottom-8 right-8 z-[1000] flex flex-col gap-3';
          document.body.appendChild(c);
          return c;
      })();
        const toast = document.createElement('div');
        const colors = {
            success: 'bg-black/90 border-green-500/50 text-green-500',
            error: 'bg-black/90 border-red-500/50 text-red-500'
        };
        toast.className = `flex items-center gap-3 px-6 py-4 rounded-xl border shadow-2xl animate-fade-left ${colors[type] || colors.success}`;
        toast.innerHTML = `<span class="text-xs font-bold">${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    refreshIcons: () => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    initAdminSidebar: () => {
        const toggleBtn = document.getElementById('sidebar-toggle-btn');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('admin-overlay');
        if (!toggleBtn || !sidebar) {
            return;
        }
        const toggle = () => {
            sidebar.classList.toggle('-translate-x-full');
            overlay?.classList.toggle('hidden');
            document.body.classList.toggle('overflow-hidden');
        };
        toggleBtn.onclick = toggle;
        overlay.onclick = toggle;
        const currentPath = window.location.pathname;
        sidebar.querySelectorAll('nav a').forEach((link) => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add(
                    'nav-link-active',
                    'bg-brand-primary/10',
                    'text-white',
                    'border-r-2',
                    'border-brand-primary'
                );
            }
        });

    // Remove ticket notifications from here - they should only be on admin pages
    // This prevents Firestore index errors on non-admin pages
    },

    showImageLightbox: (url) => {
        const lightbox = document.createElement('div');
        lightbox.className =
      'fixed inset-0 z-[10000] bg-brand-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10 animate-fade-in cursor-zoom-out';
        lightbox.innerHTML = `
            <div class="relative max-w-5xl w-full h-full flex items-center justify-center animate-zoom-in">
                <button class="absolute top-0 right-0 m-4 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-10">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
                <img src="${url}" class="max-w-full max-h-full object-contain rounded-2xl shadow-2xl shadow-black/50">
            </div>`;
        lightbox.onclick = (e) => {
            if (e.target.closest('button') || e.target === lightbox) {
                lightbox.remove();
            }
        };
        document.body.appendChild(lightbox);
        UI.refreshIcons();
    },

    initTheme: () => {
        const saved = localStorage.getItem('duydee-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
        UI.updateThemeIcons(saved);
    },

    toggleTheme: () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('duydee-theme', next);
        UI.updateThemeIcons(next);
        UI.showToast(`สลับเป็นโหมด${next === 'dark' ? 'มืด' : 'สว่าง'}`, 'success');
    },

    updateThemeIcons: (theme) => {
        const btn = document.getElementById('theme-toggle-btn');
        if (btn) {
            btn.innerHTML = `<i data-lucide="${theme === 'dark' ? 'moon' : 'sun'}" class="w-5 h-5"></i>`;
            UI.refreshIcons();
        }
    },

    initNavbar: () => {
        const nav = document.getElementById('main-nav');
        if (!nav) {
            return;
        }
        UI.initTheme();
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('nav-glass', 'py-3');
                nav.classList.remove('py-6');
            } else {
                nav.classList.remove('nav-glass', 'py-3');
                nav.classList.add('py-6');
            }
        }, { passive: true });
        UI.highlightActiveNav();
        UI.initAuthStatus();
    },

    initAuthStatus: () => {
        const dArea = document.getElementById('user-profile-area');
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(
                        doc(db, SCHEMA.COLLECTIONS.USERS, user.uid)
                    );
                    const userData = userDoc.exists() ? userDoc.data() : {};
                    const isAdmin = await checkIsAdmin(user);
                    if (dArea) {
                        dArea.innerHTML = `
                        <div class="flex items-center gap-4">
                            ${isAdmin ? '<a href="/admin/admin-manage.html" class="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"><i data-lucide="layout-dashboard" class="w-3 h-3"></i> Dashboard</a>' : ''}
                            <a href="/profile.html" class="w-10 h-10 rounded-xl border border-white/10 overflow-hidden"><img src="${userData.photoURL || '/assets/logo/DUYDODEE.png'}" class="w-full h-full object-cover"></a>
                        </div>`;
                    }
                } catch (e) {
                    console.error(e);
                }
            } else {
                if (dArea) {
                    dArea.innerHTML =
            '<a href="/login.html" class="btn-primary py-2 px-6 text-[10px]">เข้าสู่ระบบ</a>';
                }
            }
            UI.refreshIcons();
        });
    },

    setupSidebar: (user = null, isAdmin = false) => {
        const userSection = document.getElementById('sidebar-user-info');
        if (user && userSection) {
            userSection.innerHTML =
        `
                <div class="flex items-center gap-4 mb-8">
                    <img src="${user.photoURL || '/assets/logo/DUYDODEE.png'}" class="w-12 h-12 rounded-xl border border-brand-primary/30">
                    <div>
                        <p class="text-white font-bold text-sm">${user.displayName || 'Premium User'}</p>
                        <p class="text-gray-500 text-[10px]">${user.email}</p>
                    </div>
                </div>` +
        (isAdmin
            ? '<a href="/admin/admin-manage.html" class="flex items-center gap-3 px-6 py-4 bg-red-600/10 border border-red-600/20 rounded-2xl text-xs font-black uppercase text-red-500">Dashboard</a>'
            : '');
        }

        // Setup ticket notifications only on admin pages
        if (isAdmin) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                const q = query(
                    collection(db, SCHEMA.COLLECTIONS.TICKETS),
                    where('status', '==', 'open')
                );
                const _unsubscribe = onSnapshot(q, (snap) => {
                    const count = snap.size;
                    const ticketLink = sidebar.querySelector('a[href*="admin-tickets"]');
                    if (ticketLink) {
                        let badge = ticketLink.querySelector('.ticket-notif-badge');
                        if (count > 0) {
                            if (!badge) {
                                badge = document.createElement('span');
                                badge.className =
                  'ticket-notif-badge ml-auto px-2 py-0.5 rounded-full bg-red-500 text-white text-[8px] font-black animate-pulse';
                                ticketLink.appendChild(badge);
                            }
                            badge.innerText = count;
                        } else if (badge) {
                            badge.remove();
                        }
                    }
                }, (error) => {
                    console.error('Ticket notifications error:', error);
                });
            }
        }
    },

    highlightActiveNav: () => {
        const path = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach((link) => {
            if (link.getAttribute('href') === path) {
                link.classList.add('text-brand-primary');
            }
        });
    },

    createMovieCard: (item, isHighRes = false) => {
        const id = item.id || '';
        const title = UI.escapeHTML(item.title || '');
        const category = item.category || 'VOD';
        const type = item.type || 'movie';
        const watchUrl = UI.getMediaWatchPath(category, type, id);

        let posterUrl = item.poster || item.posterURL;
        if (item.videoUrl && item.videoUrl.includes('youtube.com')) {
            const videoId =
        item.videoUrl.split('v=')[1]?.split('&')[0] ||
        item.videoUrl.split('/').pop();
            const quality = isHighRes ? 'maxresdefault' : 'mqdefault';
            posterUrl = `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
        }

        return `
            <div class="movie-card poster-glow group relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-[#0b0b0d] border border-white/5 cursor-pointer shadow-2xl"
                 onclick="window.location.href='${watchUrl}'">
                <img src="${posterUrl}" alt="${title}" loading="lazy" decoding="async"
                     class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                     onerror="this.src='/assets/logo/DUYDODEE.png'">
                <div class="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div class="shine-effect"></div>
                </div>
                <div class="absolute bottom-0 inset-x-0 p-4 z-30 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div class="p-3 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
                        <h3 class="text-white font-bold text-sm line-clamp-1 mb-1 Thai-font">${title}</h3>
                        <div class="flex items-center gap-2 text-[10px] text-brand-primary font-black uppercase tracking-widest">
                            <i data-lucide="play" class="w-3 h-3 fill-current"></i> รับชมเลย
                        </div>
                    </div>
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-[#0b0b0d] via-transparent to-transparent opacity-80"></div>
                
                <!-- 🎬 Enhanced Play Button Overlay -->
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-brand-black/30 backdrop-blur-[2px] pointer-events-none group-hover:pointer-events-auto z-40">
                    <div class="relative w-16 h-16 rounded-full bg-brand-primary/95 flex items-center justify-center text-white scale-75 group-hover:scale-110 transition-all duration-500 shadow-[0_0_40px_rgba(229,9,20,0.6)] hover:shadow-[0_0_60px_rgba(229,9,20,0.8)] border-2 border-white/20 cursor-pointer hover:bg-brand-primary play-button-container pointer-events-auto">
                        <!-- Ripple Effect -->
                        <div class="absolute inset-0 rounded-full border-2 border-white/30 opacity-0 group-hover:animate-ping"></div>
                        
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="ml-1 transition-transform duration-300">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                    </div>
                </div>
            </div>`;
    },

    createTrendingCard: (movie, rank) => {
        const watchUrl = UI.getMediaWatchPath(movie.category, movie.type, movie.id);
        return `
            <div class="min-w-[280px] md:min-w-[450px] snap-start group animate-fade-in cursor-pointer" onclick="location.href='${watchUrl}'">
                <div class="poster-glow relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-brand-surface shadow-2xl">
                    <img src="${UI.getSafePoster(movie.poster || movie.posterURL)}" class="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" loading="lazy" alt="${UI.escapeHTML(movie.title)}" onerror="this.src='/assets/logo/DUYDODEE.png';">
                    <div class="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/20 to-transparent opacity-90"></div>
                    <div class="absolute top-4 left-4 w-12 h-12 rounded-xl bg-brand-primary text-white font-black text-2xl italic flex items-center justify-center shadow-[0_0_20px_rgba(229,9,20,0.5)] z-10 Thai-font">
                        ${rank}
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
                        <div class="space-y-1 md:space-y-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                            <span class="text-[10px] md:text-xs font-black text-brand-primary uppercase tracking-[0.3em] Thai-font block drop-shadow-md">${movie.category || 'Trending Now'}</span>
                            <h4 class="text-xl md:text-3xl font-black text-white Thai-font line-clamp-1 drop-shadow-lg">${UI.escapeHTML(movie.title)}</h4>
                        </div>
                    </div>
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-brand-black/40 backdrop-blur-[3px] pointer-events-none group-hover:pointer-events-auto z-40">
                        <div class="relative w-20 h-20 rounded-full bg-brand-primary/95 flex items-center justify-center text-white scale-75 group-hover:scale-110 transition-all duration-500 shadow-[0_0_50px_rgba(229,9,20,0.7)] hover:shadow-[0_0_70px_rgba(229,9,20,0.9)] border-3 border-white/30 hover:border-white/50 cursor-pointer hover:bg-brand-primary play-button-container pointer-events-auto">
                            <!-- Ripple Effect -->
                            <div class="absolute inset-0 rounded-full border-2 border-white/40 opacity-0 group-hover:animate-ping"></div>
                            
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="ml-2 transition-transform duration-300 group-hover:scale-110">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>`;
    },

    createAdminAssetCard: (data) => {
        const safeTitle = UI.escapeHTML(data.title);
        const watchUrl = UI.getMediaWatchPath(data.category, data.type, data.id);
        const editUrl = `/admin/admin-edit-${data.type}.html?id=${data.id}`;
        const typeLabel = data.type === 'movie' ? 'ภาพยนตร์' : 'ซีรีส์';
        const safePoster = UI.getSafePoster(data.poster || data.posterURL);

        return `
            <div class="movie-card group animate-fade-in">
                <div class="movie-poster-wrapper poster-glow !rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative aspect-[2/3] max-w-[180px] mx-auto">
                    <img src="${safePoster}" onerror="this.onerror=null;this.src='/assets/logo/DUYDODEE.png';" class="movie-poster-img w-full h-full object-cover" loading="lazy">
                    <div class="absolute top-3 left-3 px-2 py-0.5 bg-brand-black/90 backdrop-blur-md rounded-lg text-[7px] font-black text-brand-primary border border-white/10 uppercase tracking-widest z-40">
                        ${typeLabel}
                    </div>
                    <div class="movie-card-overlay flex flex-row justify-center items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-brand-black/70 backdrop-blur-[3px]">
                         <button onclick="window.open('${watchUrl}', '_blank')" class="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 text-white haptic-btn" title="ดูตัวอย่างเนื้อหา">
                            <i data-lucide="external-link" class="w-5 h-5"></i>
                         </button>
                         <button onclick="location.href='${editUrl}'" class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl hover:bg-white hover:text-black transition-all duration-300 haptic-btn" title="แก้ไขข้อมูล">
                            <i data-lucide="edit-3" class="w-5 h-5"></i>
                         </button>
                    </div>
                </div>
                <div class="mt-4 space-y-1.5 text-center max-w-[180px] mx-auto">
                    <h4 class="text-[11px] font-black text-white group-hover:text-brand-primary transition-colors line-clamp-1 Thai-font uppercase tracking-tighter">${safeTitle}</h4>
                    <div class="flex items-center justify-center gap-2">
                        <span class="text-[8px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">${data.category || 'พรีเมียม'}</span>
                    </div>
                </div>
            </div>`;
    },

    createHistoryCard: (item) => {
    // Validate required fields
        if (!item || !item.id) {
            return '';
        }

        const type = item.type || 'movie';
        const category = item.category || 'Premium';
        const watchUrl = UI.getMediaWatchPath(category, type, item.id);
        const poster = UI.getSafePoster(item.poster || item.posterURL);
        const progress = item.progress || 0;
        const title = item.title || 'Unknown Title';

        return `
            <div class="group cursor-pointer animate-fade-in">
                <div class="poster-glow relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 bg-brand-obsidian shadow-2xl" onclick="location.href='${watchUrl}'">
                    <img src="${poster}" class="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-[3s]" onerror="this.onerror=null;this.src='/assets/logo/DUYDODEE.png';">

                    <!-- Removed gradient overlays -->

                    <div class="absolute bottom-0 left-0 right-0 p-4 space-y-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <div class="flex items-center gap-2">
                             <span class="px-2 py-0.5 bg-brand-primary text-white text-[8px] font-black uppercase rounded shadow-lg Thai-font">รับชมค้างไว้</span>
                             <span class="text-[9px] font-bold text-white/50 uppercase tracking-widest">${UI.escapeHTML(category)}</span>
                        </div>
                        <h4 class="text-sm md:text-base font-black text-white Thai-font line-clamp-1 group-hover:text-brand-primary transition-colors">${UI.escapeHTML(title)}</h4>

                        <div class="pt-2">
                            <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div class="h-full bg-brand-primary shadow-[0_0_10px_#E50914] transition-all duration-1000" style="width: ${progress}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-brand-black/40 backdrop-blur-[3px] pointer-events-none group-hover:pointer-events-auto z-40">
                        <!-- Progress Indicator for History Cards -->
                        ${progress > 0 ? `
                            <div class="absolute inset-0 flex flex-col items-center justify-center space-y-3 pointer-events-auto">
                                <div class="relative w-16 h-16">
                                    <svg class="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
                                        <path class="text-brand-black/40" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="2"/>
                                        <path class="text-brand-primary" stroke-dasharray="${progress}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="2"/>
                                    </svg>
                                    <div class="absolute inset-0 flex items-center justify-center">
                                        <span class="text-[10px] font-black text-white">${Math.round(progress)}%</span>
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <!-- Normal Play Button -->
                            <div class="relative w-20 h-20 rounded-full bg-brand-primary/95 flex items-center justify-center text-white scale-75 group-hover:scale-110 transition-all duration-500 shadow-[0_0_50px_rgba(229,9,20,0.7)] hover:shadow-[0_0_70px_rgba(229,9,20,0.9)] border-3 border-white/30 hover:border-white/50 cursor-pointer hover:bg-brand-primary play-button-container pointer-events-auto">
                                <!-- Ripple Effect -->
                                <div class="absolute inset-0 rounded-full border-2 border-white/40 opacity-0 group-hover:animate-ping"></div>
                                
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="ml-2 transition-transform duration-300 group-hover:scale-110">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                            </div>
                        `}
                    </div>
                </div>
            </div>`;
    },

    renderEmptyState: (container, message) => {
        if (!container) {
            return;
        }
        container.innerHTML = `
            <div class="col-span-full py-20 text-center animate-fade-in">
                <div class="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                    <i data-lucide="ghost" class="w-8 h-8 text-gray-600"></i>
                </div>
                <p class="text-gray-500 Thai-font tracking-wide">${message}</p>
            </div>`;
        UI.refreshIcons();
    },

    renderSkeleton: (container, count, type = 'poster', append = false) => {
        if (!container) {
            return;
        }
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="animate-fade-in skeleton-item">
                    <div class="${type === 'poster' ? 'aspect-[2/3]' : 'aspect-video'} skeleton-shimmer mb-4"></div>
                    <div class="h-4 w-3/4 skeleton-shimmer mb-2 rounded-lg"></div>
                    <div class="h-3 w-1/2 skeleton-shimmer rounded-lg"></div>
                </div>`;
        }
        if (append) {
            container.insertAdjacentHTML('beforeend', html);
        } else {
            container.innerHTML = html;
        }
    },

    injectStarfield: () => {
        if (document.querySelector('.star-field')) {
            return;
        }
        const field = document.createElement('div');
        field.className = 'star-field';
        field.innerHTML =
      '<div class="star-layer"></div><div class="mesh-gradient-bg"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>';
        document.body.prepend(field);
    },

    updateMeta: (data) => {
        const title = data.title
            ? `${data.title} - DUYดูDEE PREMIUM`
            : 'DUYดูDEE PREMIUM - สตรีมมิ่งความบันเทิงระดับโลก';
        document.title = title;

        const description = data.description || 'รับชมภาพยนตร์และซีรีส์คุณภาพระดับ 4K HDR บน DUYดูDEE';
        const image = data.poster || data.posterURL || '/assets/logo/DUYDODEE.png';
        const url = window.location.href;

        const setMeta = (name, content) => {
            let el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(name.includes('og:') ? 'property' : 'name', name);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        setMeta('description', description);
        setMeta('og:title', title);
        setMeta('og:description', description);
        setMeta('og:image', image);
        setMeta('og:url', url);
    },

    showErrorPage: (message = 'ขออภัย ไม่พบหน้าที่คุณต้องการ') => {
        const container =
      document.getElementById('watch-container') ||
      document.querySelector('main');
        if (!container) {
            return;
        }

        UI.injectStarfield();
        container.innerHTML = `
            <div class="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
                <div class="relative mb-12">
                    <div class="absolute inset-0 bg-brand-primary/20 blur-[100px] rounded-full"></div>
                    <div class="w-32 h-32 rounded-[2.5rem] bg-brand-obsidian border border-white/10 flex items-center justify-center relative z-10">
                        <i data-lucide="ghost" class="w-16 h-16 text-brand-primary"></i>
                    </div>
                </div>
                <h1 class="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter Thai-font mb-4">
                    CONTENT <span class="text-brand-primary text-glow">NOT FOUND</span>
                </h1>
                <p class="text-gray-400 Thai-font text-lg max-w-md mx-auto mb-10 leading-relaxed">
                    ${UI.escapeHTML(message)}
                </p>
                <div class="flex flex-col sm:flex-row gap-4">
                    <a href="/index.html" class="btn-primary px-10 py-4 text-xs font-black uppercase tracking-widest">
                        กลับสู่หน้าหลัก
                    </a>
                    <button onclick="location.reload()" class="px-10 py-4 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                        ลองใหม่อีกครั้ง
                    </button>
                </div>
            </div>`;
        UI.refreshIcons();
    },

    renderRelatedGrid: (container, items, type) => {
        if (!container) {
            return;
        }
        if (!items || items.length === 0) {
            container.innerHTML =
        '<div class="col-span-full py-10 text-center text-gray-500">ไม่พบรายการแนะนำ</div>';
            return;
        }
        container.innerHTML = items
            .map((item) => UI.createMovieCard({ ...item, type }))
            .join('');
        UI.refreshIcons();
    },

    renderiPhonePlayer: (data, episodes = [], activeIndex = 0, isSeries = false) => {
        return new Promise((resolve) => {
            const container = document.getElementById('watch-container');
            if (!container) {
                return resolve(null);
            }

            UI.injectStarfield();

            const currentEp = isSeries ? episodes[activeIndex] : data;
            const embedUrl = currentEp?.embedURL || currentEp?.videoUrl || currentEp?.url || '';
            const videoId = UI.extractYouTubeId(embedUrl);

            if (!embedUrl) {
                container.innerHTML = `
                    <div class="p-20 text-center animate-fade-in">
                        <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i data-lucide="alert-triangle" class="w-10 h-10 text-brand-primary"></i>
                        </div>
                        <h2 class="text-white text-xl font-bold Thai-font mb-2">ไม่พบไฟล์วิดีโอ</h2>
                        <p class="text-gray-500 Thai-font">ขออภัย สตรีมมิ่งไฟล์นี้อาจถูกลบหรือย้ายที่อยู่</p>
                    </div>`;
                UI.refreshIcons();
                return resolve(null);
            }

            const title = UI.escapeHTML(data.title);
            const isVertical = data.category && (data.category.includes('แนวตั้ง') || data.category.includes('Vertical'));
            const frameClass = isVertical ? '' : 'landscape';

            container.innerHTML = `
                <div class="animate-fade-in relative max-w-7xl mx-auto px-4 py-4 md:py-8">
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
                        <div class="lg:col-span-8 w-full order-1">
                            <div id="device-wrapper" class="device-frame ${frameClass} shadow-2xl group relative">
                                <div class="device-chassis"></div>
                                <div class="device-screen bg-black relative">
                                    <div id="player-api-node" class="w-full h-full"></div>
                                    <div class="absolute inset-0 pointer-events-none border border-brand-primary/20 rounded-[inherit] z-20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    
                                    <!-- Netflix-style glow effect -->
                                    <div class="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[0_0_40px_rgba(229,9,20,0.3)] z-10 opacity-50"></div>
                                </div>
                                ${isVertical ? '<div class="device-island"></div>' : ''}
                                <div class="device-home-bar"></div>
                            </div>
                        </div>
                        <div class="lg:col-span-4 space-y-6 order-2">
                            <div class="glass-premium p-6 rounded-2xl">
                                <h1 class="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic Thai-font leading-none mb-4">${title}</h1>
                                <div class="flex items-center gap-3 mb-4">
                                    <span class="px-3 py-1 bg-brand-primary/20 text-brand-primary text-[9px] font-black uppercase rounded-lg border border-brand-primary/30">HD 720p</span>
                                    <span class="px-3 py-1 bg-white/5 text-gray-400 text-[9px] font-black uppercase rounded-lg border border-white/10">${data.category || 'Premium'}</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <button class="flex-1 py-3 px-6 bg-brand-primary text-white text-[10px] font-black uppercase rounded-xl hover:bg-brand-primary/90 transition-all shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:shadow-[0_0_30px_rgba(229,9,20,0.5)]" onclick="UI.handleShare('${title}')">
                                        <i data-lucide="share-2" class="w-4 h-4 inline mr-2"></i>แชร์
                                    </button>
                                    <button id="bookmark-btn" class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all">
                                        <i data-lucide="heart" id="bookmark-icon" class="w-5 h-5"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

            UI.refreshIcons();

            // Initialize YouTube Player
            if (videoId) {
                const initPlayer = () => {
                    const player = new YT.Player('player-api-node', {
                        videoId: videoId,
                        playerVars: {
                            'autoplay': 1,
                            'controls': 1,
                            'origin': window.location.origin
                        },
                        events: {
                            onReady: () => resolve(player)
                        }
                    });
                };

                if (!window.YT) {
                    const tag = document.createElement('script');
                    tag.src = 'https://www.youtube.com/iframe_api';
                    const firstScriptTag = document.getElementsByTagName('script')[0];
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                    window.onYouTubeIframeAPIReady = initPlayer;
                } else {
                    initPlayer();
                }
            } else {
                resolve(null);
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },

    _buildEpSelector: (episodes, seriesId, activeIndex) => {
        return `
            <div class="mt-16 space-y-8 animate-slide-up">
                <div class="flex items-center gap-4">
                    <h3 class="text-xl font-black text-white uppercase tracking-widest Thai-font">เลือกตอนรับชม</h3>
                    <div class="flex-1 h-px bg-gradient-to-r from-brand-primary/50 to-transparent"></div>
                    <span class="text-[10px] font-black text-brand-primary uppercase tracking-widest Thai-font">${episodes.length} EPISODES</span>
                </div>
                
                <div class="flex overflow-x-auto gap-4 pb-6 scrollbar-hide snap-x">
                    ${episodes
        .map((ep, i) => {
            const isActive = i === activeIndex;
            return `
                            <button onclick="location.href='/watch-series.html?id=${seriesId}&ep=${i}'" 
                                    class="min-w-[160px] md:min-w-[200px] p-5 rounded-[1.5rem] border transition-all duration-300 snap-start text-left group backdrop-blur-xl
                                    hover:scale-105 hover:shadow-[0_0_30px_rgba(229,9,20,0.4)] hover:border-brand-primary/50
                                    ${isActive ? 'bg-brand-primary/90 border-brand-primary shadow-[0_0_40px_rgba(229,9,20,0.4)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}">
                                <p class="text-[9px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-white/60' : 'text-gray-500 group-hover:text-brand-primary'}">ตอนที่ ${i + 1}</p>
                                <h4 class="text-xs md:text-sm font-black Thai-font line-clamp-1 ${isActive ? 'text-white' : 'text-white'}">${UI.escapeHTML(ep.title)}</h4>
                            </button>`;
        })
        .join('')}
                </div>
            </div>`;
    },

    renderVIPUpgradeModal: async () => {
        const modal = document.createElement('div');
        modal.className =
      'fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4';
        modal.innerHTML = `
            <div class="glass-premium border border-brand-primary/20 rounded-[2rem] p-8 max-w-sm w-full relative">
                <button onclick="this.closest('.fixed').remove()" class="absolute top-6 right-6 text-gray-500"><i data-lucide="x"></i></button>
                <div class="text-center space-y-6">
                    <h2 class="text-h2">สมัครสมาชิก VIP</h2>
                    <div id="payment-details" class="bg-black/40 p-6 rounded-2xl">
                        <p class="text-label">โหลดข้อมูลบัญชี...</p>
                    </div>
                    <form id="vip-form" class="space-y-3 text-left">
                        <input type="text" id="senderName" placeholder="ชื่อผู้โอน" required class="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-xs text-white">
                        <input type="number" id="transferAmount" placeholder="จำนวนเงิน" required class="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-xs text-white">
                        <input type="text" id="transferTime" placeholder="เวลาที่โอน (12:00)" required class="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-xs text-white">
                    </form>
                    <button id="submit-payment" class="btn-primary w-full">ยืนยันการชำระเงิน</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        UI.refreshIcons();

        try {
            const settingsSnap = await getDoc(
                doc(db, 'site_settings', 'payment_info')
            );
            const data = settingsSnap.exists()
                ? settingsSnap.data()
                : { wallet: '097-193-7338', name: 'DUYดูDEE' };
            document.getElementById('payment-details').innerHTML = `
                <p class="text-label">โอนเงินผ่าน Wallet</p>
                <div class="text-2xl font-black text-white">${data.wallet}</div>
                <p class="text-[10px] text-gray-500">ชื่อบัญชี: ${data.name}</p>
            `;

            document.getElementById('submit-payment').onclick = async () => {
                const name = document.getElementById('senderName').value;
                const amount = document.getElementById('transferAmount').value;
                const time = document.getElementById('transferTime').value;
                if (!name || !amount || !time) {
                    return UI.showToast('กรุณากรอกให้ครบ', 'error');
                }

                await addDoc(collection(db, 'vip_payments'), {
                    senderName: name,
                    amount: parseFloat(amount),
                    transferTime: time,
                    status: 'pending',
                    createdAt: serverTimestamp(),
                    userId: auth.currentUser?.uid || 'guest'
                });
                UI.showToast('ส่งข้อมูลเรียบร้อย');
                modal.remove();
            };
        } catch (e) {
            UI.showToast('โหลดข้อมูลบัญชีไม่ได้', 'error');
        }
    },

    renderTicketModal: async () => {
        if (!auth.currentUser) {
            return UI.showToast('กรุณาเข้าสู่ระบบก่อนแจ้งปัญหา', 'error');
        }

        const modal = document.createElement('div');
        modal.className =
      'fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-fade-in';
        modal.innerHTML = `
            <div class="glass-premium border border-white/10 rounded-[2rem] p-8 max-w-md w-full relative animate-zoom-in">
                <button onclick="this.closest('.fixed').remove()" class="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"><i data-lucide="x"></i></button>
                <div class="space-y-6">
                    <div class="text-center">
                        <h2 class="text-2xl font-black text-white Thai-font uppercase italic">HELP & <span class="text-brand-primary">SUPPORT</span></h2>
                        <p class="text-[10px] text-gray-500 uppercase tracking-widest mt-1">แจ้งปัญหาหรือสอบถามเจ้าหน้าที่</p>
                    </div>
                    <form id="ticket-form" class="space-y-4">
                        <div class="space-y-1">
                            <label class="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">หัวข้อปัญหา</label>
                            <input type="text" id="ticket-subject" placeholder="เช่น รับชมไม่ได้, ปัญหาการชำระเงิน" required class="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-brand-primary outline-none transition-all Thai-font">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">รายละเอียด</label>
                            <textarea id="ticket-message" placeholder="ระบุรายละเอียดปัญหาของคุณ..." required class="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white h-32 resize-none focus:border-brand-primary outline-none transition-all Thai-font"></textarea>
                        </div>
                        <button type="submit" id="submit-ticket" class="btn-primary w-full !py-4 shadow-lg shadow-brand-primary/10">ส่งเรื่องแจ้งปัญหา</button>
                    </form>
                </div>
            </div>`;
        document.body.appendChild(modal);
        UI.refreshIcons();

        document.getElementById('ticket-form').onsubmit = async (e) => {
            e.preventDefault();
            UI.setLoading(true);
            try {
                const userDoc = await getDoc(
                    doc(db, SCHEMA.COLLECTIONS.USERS, auth.currentUser.uid)
                );
                const isVIP = userDoc.data()?.role === 'vip';

                await addDoc(collection(db, SCHEMA.COLLECTIONS.TICKETS), {
                    userId: auth.currentUser.uid,
                    userName: auth.currentUser.displayName || 'Member',
                    userEmail: auth.currentUser.email,
                    subject: document.getElementById('ticket-subject').value,
                    message: document.getElementById('ticket-message').value,
                    status: 'open',
                    priority: isVIP ? 'high' : 'normal',
                    createdAt: serverTimestamp(),
                    replies: []
                });
                UI.showToast(
                    'ส่งเรื่องแจ้งปัญหาเรียบร้อยแล้ว เจ้าหน้าที่จะตอบกลับโดยเร็วที่สุด',
                    'success'
                );
                modal.remove();
            } catch (err) {
                UI.showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
            } finally {
                UI.setLoading(false);
            }
        };
    }
};

window.UI = UI;
