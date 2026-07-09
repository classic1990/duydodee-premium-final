import { db, auth } from '../services/firebase.js';
import { AuthService } from '../services/auth-service.js';
import { SCHEMA } from '../constants.js';
import { UIUtils } from '../utils/ui-utils.js';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export const UI = {
    ...UIUtils,

    setCounter: (id, count) => {
        const el = document.getElementById(id);
        if (el) {
            // Cinematic counter animation
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
            loader.className = 'fixed inset-0 z-[9999] bg-brand-black/95 backdrop-blur-3xl flex items-center justify-center animate-fade-in';
            loader.innerHTML = '<div class="text-[10px] font-black text-brand-primary uppercase tracking-[0.8em] animate-pulse">กำลังโหลดข้อมูล...</div>';
            document.body.appendChild(loader);
        } else if (!isLoading && loader) {
            loader.remove();
        }
    },

    showToast: (message, type = 'success') => {
        const container = document.getElementById('toast-container') || (() => {
            const c = document.createElement('div'); c.id = 'toast-container'; c.className = 'fixed bottom-8 right-8 z-[1000] flex flex-col gap-3';
            document.body.appendChild(c); return c;
        })();
        const toast = document.createElement('div');
        const colors = { success: 'bg-black/90 border-green-500/50 text-green-500', error: 'bg-black/90 border-red-500/50 text-red-500' };
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
        sidebar.querySelectorAll('nav a').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('nav-link-active', 'bg-brand-primary/10', 'text-white', 'border-r-2', 'border-brand-primary');
            }
        });
    },

    initNavbar: () => {
        const nav = document.getElementById('main-nav');
        if (!nav) {
            return;
        }
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('nav-glass', 'py-3'); nav.classList.remove('py-6');
            } else {
                nav.classList.remove('nav-glass', 'py-3'); nav.classList.add('py-6');
            }
        });
        UI.highlightActiveNav();
        UI.initAuthStatus();
    },

    initAuthStatus: () => {
        const dArea = document.getElementById('user-profile-area');
        AuthService.onStateChanged(async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, user.uid));
                    const userData = userDoc.exists() ? userDoc.data() : {};
                    const isAdmin = await AuthService.checkIsAdmin(user);
                    if (dArea) {
                        dArea.innerHTML = `
                        <div class="flex items-center gap-4">
                            ${isAdmin ? '<a href="/admin/admin-manage.html" class="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"><i data-lucide="layout-dashboard" class="w-3 h-3"></i> Dashboard</a>' : ''}
                            <a href="/profile.html" class="w-10 h-10 rounded-xl border border-white/10 overflow-hidden"><img src="${userData.photoURL || '/assets/DUYDODEE.png'}" class="w-full h-full object-cover"></a>
                        </div>`;
                    }
                } catch (e) {
                    console.error(e);
                }
            } else {
                if (dArea) {
                    dArea.innerHTML = '<a href="/login.html" class="btn-primary py-2 px-6 text-[10px]">เข้าสู่ระบบ</a>';
                }
            }
            UI.refreshIcons();
        });
    },

    setupSidebar: (user = null, isAdmin = false) => {
        const userSection = document.getElementById('sidebar-user-info');
        if (user && userSection) {
            userSection.innerHTML = `
                <div class="flex items-center gap-4 mb-8">
                    <img src="${user.photoURL || '/assets/DUYDODEE.png'}" class="w-12 h-12 rounded-xl border border-brand-primary/30">
                    <div>
                        <p class="text-white font-bold text-sm">${user.displayName || 'Premium User'}</p>
                        <p class="text-gray-500 text-[10px]">${user.email}</p>
                    </div>
                </div>` + (isAdmin ? '<a href="/admin/admin-manage.html" class="flex items-center gap-3 px-6 py-4 bg-red-600/10 border border-red-600/20 rounded-2xl text-xs font-black uppercase text-red-500">Dashboard</a>' : '');
        }
    },

    highlightActiveNav: () => {
        const path = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === path) {
                link.classList.add('text-brand-primary');
            }
        });
    },

    createMovieCard: (item) => {
        return `
            <div class="group relative cursor-pointer" onclick="location.href='${UI.getMediaWatchPath(item.category, item.type, item.id)}'">
                <div class="movie-poster-wrapper !aspect-[2/3] shadow-2xl scale-[1.05] group-hover:scale-[1.1] transition-transform duration-500">
                    <img src="${UI.getSafePoster(item.poster || item.posterURL)}" class="movie-poster-img" loading="lazy">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                </div>
                <div class="mt-3 px-1">
                    <h4 class="text-sm md:text-md font-black text-white Thai-font leading-tight line-clamp-2 group-hover:text-brand-primary transition-colors">
                        ${UI.escapeHTML(item.title)}
                    </h4>
                    <p class="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">${item.category || 'VOD'}</p>
                </div>
            </div>`;
    },

    createTrendingCard: (movie, rank) => {
        const watchUrl = UI.getMediaWatchPath(movie.category, movie.type, movie.id);
        return `
            <div class="min-w-[280px] md:min-w-[450px] snap-start group animate-fade-in cursor-pointer" onclick="location.href='${watchUrl}'">
                <div class="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-brand-surface shadow-2xl">
                    <img src="${UI.getSafePoster(movie.poster || movie.posterURL)}" class="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" loading="lazy" alt="${UI.escapeHTML(movie.title)}" onerror="this.src='/assets/logo/DUYDODEE.png';">
                    <div class="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/20 to-transparent opacity-90"></div>
                    <div class="absolute top-4 left-4 w-12 h-12 rounded-xl bg-brand-primary text-black font-black text-2xl italic flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.5)] z-10 Thai-font">
                        ${rank}
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
                        <div class="space-y-1 md:space-y-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                            <span class="text-[10px] md:text-xs font-black text-brand-primary uppercase tracking-[0.3em] Thai-font block drop-shadow-md">${movie.category || 'Trending Now'}</span>
                            <h4 class="text-xl md:text-3xl font-black text-white Thai-font line-clamp-1 drop-shadow-lg">${UI.escapeHTML(movie.title)}</h4>
                        </div>
                    </div>
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/20 backdrop-blur-[1px]">
                        <div class="w-16 h-16 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-500">
                            <i data-lucide="play" class="w-8 h-8 fill-current"></i>
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
                <div class="movie-poster-wrapper !rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative aspect-[2/3] max-w-[180px] mx-auto">
                    <img src="${safePoster}" onerror="this.onerror=null;this.src='/assets/logo/DUYDODEE.png';" class="movie-poster-img w-full h-full object-cover" loading="lazy">
                    <div class="absolute top-3 left-3 px-2 py-0.5 bg-brand-black/90 backdrop-blur-md rounded-lg text-[7px] font-black text-brand-primary border border-white/10 uppercase tracking-widest z-40">
                        ${typeLabel}
                    </div>
                    <div class="movie-card-overlay flex flex-row justify-center items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-brand-black/70 backdrop-blur-[3px]">
                         <button onclick="window.open('${watchUrl}', '_blank')" class="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 text-black haptic-btn" title="ดูตัวอย่างเนื้อหา">
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
        const watchUrl = UI.getMediaWatchPath(item.category, item.type, item.id);
        const poster = UI.getSafePoster(item.poster || item.posterURL);
        // สุ่มความก้าวหน้า (Mock progress for visual appeal if not stored)
        const progress = item.progress || Math.floor(Math.random() * 60) + 20;

        return `
            <div class="min-w-[280px] md:min-w-[360px] group cursor-pointer animate-fade-in snap-start" onclick="location.href='${watchUrl}'">
                <div class="relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-brand-obsidian shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-brand-primary/30">
                    <!-- Image with subtle zoom -->
                    <img src="${poster}" class="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-[3s]" onerror="this.onerror=null;this.src='/assets/logo/DUYDODEE.png';">
                    
                    <!-- Premium Overlays -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                    <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>

                    <!-- Content Info -->
                    <div class="absolute bottom-0 left-0 right-0 p-5 space-y-2">
                        <div class="flex items-center gap-2">
                             <span class="px-2 py-0.5 bg-brand-primary text-black text-[8px] font-black uppercase rounded shadow-lg Thai-font">รับชมค้างไว้</span>
                             <span class="text-[9px] font-bold text-white/50 uppercase tracking-widest">${item.category || 'Premium'}</span>
                        </div>
                        <h4 class="text-sm md:text-base font-black text-white Thai-font line-clamp-1 group-hover:text-brand-primary transition-colors">${UI.escapeHTML(item.title)}</h4>
                        
                        <!-- Progress Bar -->
                        <div class="pt-2">
                            <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div class="h-full bg-brand-primary shadow-[0_0_10px_#fbbf24] transition-all duration-1000" style="width: ${progress}%"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Hover Play Icon -->
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-brand-black/20 backdrop-blur-[2px]">
                        <div class="w-14 h-14 rounded-full bg-brand-primary/90 flex items-center justify-center text-black scale-75 group-hover:scale-100 transition-transform duration-500 shadow-[0_0_30px_rgba(251,191,36,0.4)]">
                            <i data-lucide="play" class="w-7 h-7 fill-current ml-1"></i>
                        </div>
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

    renderSkeleton: (container, count, type = 'poster') => {
        if (!container) {
            return;
        }
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="animate-fade-in">
                    <div class="${type === 'poster' ? 'aspect-[2/3]' : 'aspect-video'} skeleton-shimmer mb-4"></div>
                    <div class="h-4 w-3/4 skeleton-shimmer mb-2 rounded-lg"></div>
                    <div class="h-3 w-1/2 skeleton-shimmer rounded-lg"></div>
                </div>`;
        }
        container.innerHTML = html;
    },

    injectStarfield: () => {
        if (document.querySelector('.star-field')) {
            return;
        }
        const field = document.createElement('div');
        field.className = 'star-field';
        field.innerHTML = '<div class="star-layer"></div><div class="mesh-gradient-bg"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>';
        document.body.prepend(field);
    },

    updateMeta: (data) => {
        const title = data.title ? `${data.title} - DUYดูDEE PREMIUM` : 'DUYดูDEE PREMIUM - สตรีมมิ่งความบันเทิงระดับโลก';
        document.title = title;
        const desc = data.description || 'รับชมภาพยนตร์และซีรีส์คุณภาพระดับ 4K HDR บน DUYดูDEE';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', desc);
        }
    },

    showErrorPage: (message = 'ขออภัย ไม่พบหน้าที่คุณต้องการ') => {
        const container = document.getElementById('watch-container') || document.querySelector('main');
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
            container.innerHTML = '<div class="col-span-full py-10 text-center text-gray-500">ไม่พบรายการแนะนำ</div>';
            return;
        }
        container.innerHTML = items.map(item => UI.createMovieCard({ ...item, type })).join('');
        UI.refreshIcons();
    },

    renderiPhonePlayer: (data, episodes = [], activeIndex = 0, isSeries = false) => {
        const container = document.getElementById('watch-container');
        if (!container) {
            return;
        }

        UI.injectStarfield();

        const currentEp = isSeries ? episodes[activeIndex] : data;
        const embedUrl = currentEp?.embedURL || currentEp?.videoUrl || currentEp?.url || '';
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
            return;
        }

        const title = UI.escapeHTML(data.title);
        const desc = UI.escapeHTML(data.description || 'สตรีมมิ่งคุณภาพระดับ 4K HDR ที่ออกแบบมาเพื่อประสบการณ์การรับชมที่ดีที่สุดของคุณบน DUYดูDEE PREMIUM');
        const isVertical = data.category && (data.category.includes('แนวตั้ง') || data.category.includes('Vertical'));
        const frameClass = isVertical ? '' : 'landscape';

        container.innerHTML = `
            <div class="animate-fade-in relative max-w-7xl mx-auto px-4 py-4 md:py-8">
                <!-- 📽️ CINEMATIC PLAYER STAGE -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
                    
                    <!-- Player Area -->
                    <div class="lg:col-span-8 w-full order-1">
                        <div id="device-wrapper" class="device-frame ${frameClass} shadow-2xl group">
                            <div class="device-chassis"></div>
                            <div class="device-screen bg-black">
                                <iframe src="${UI.escapeHTML(embedUrl)}" 
                                        class="w-full h-full" 
                                        allowfullscreen 
                                        frameborder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>

                                <!-- Edge Lighting Effect -->
                                <div class="absolute inset-0 pointer-events-none border border-white/10 rounded-[inherit] z-20"></div>
                            </div>
                            ${isVertical ? '<div class="device-island"></div>' : ''}
                            <div class="device-home-bar"></div>
                        </div>
                    </div>

                    <!-- Metadata Area -->
                    <div class="lg:col-span-4 space-y-6 order-2">
                        <div class="space-y-3">
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="px-2 py-0.5 bg-brand-primary text-black text-[9px] font-black uppercase rounded shadow-lg Thai-font">Premium HDR</span>
                                <span class="px-1.5 text-[9px] font-bold text-white/40 uppercase Thai-font">${data.category || 'VOD'}</span>
                            </div>
                            <h1 class="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic Thai-font leading-none">
                                ${title}
                            </h1>
                            ${isSeries ? `
                                <p class="text-xs font-bold text-brand-primary uppercase tracking-[0.1em] Thai-font">
                                    กำลังรับชม: ${UI.escapeHTML(currentEp.title)}
                                </p>
                            ` : ''}
                        </div>

                        <!-- Action Bar -->
                        <div class="flex items-center gap-3">
                            <button class="flex-1 py-3 px-6 bg-brand-primary text-black text-[10px] font-black uppercase rounded-xl hover:scale-[1.02] transition-transform Thai-font" onclick="UI.handleShare('${title}')">
                                แชร์
                            </button>
                            <button class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all" onclick="UI.showToast('เพิ่มในรายการโปรดแล้ว', 'success')">
                                <i data-lucide="heart" class="w-5 h-5"></i>
                            </button>
                        </div>

                        <div class="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                            <h3 class="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] Thai-font">เรื่องย่อ</h3>
                            <p class="text-xs leading-relaxed text-gray-400 font-medium">${desc}</p>
                        </div>
                    </div>
                </div>

                <!-- 🎞️ EPISODE SELECTOR -->
                ${isSeries ? UI._buildEpSelector(episodes, data.id, activeIndex) : ''}

                <!-- 🎬 RELATED CONTENT -->
                <div class="mt-12 pt-8 border-t border-white/5">
                    <h3 class="text-lg font-black text-white uppercase italic tracking-tighter Thai-font mb-6">
                        รายการ <span class="text-brand-primary">แนะนำ</span>
                    </h3>
                    <div id="related-grid" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    </div>
                </div>
            </div>`;

        UI.refreshIcons();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    _buildEpSelector: (episodes, seriesId, activeIndex) => {
        return `
            <div class="mt-16 space-y-8 animate-slide-up">
                <div class="flex items-center gap-4">
                    <h3 class="text-xl font-black text-white uppercase tracking-widest Thai-font">เลือกตอนรับชม</h3>
                    <div class="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
                    <span class="text-[10px] font-black text-gray-600 uppercase tracking-widest Thai-font">${episodes.length} EPISODES</span>
                </div>
                
                <div class="flex overflow-x-auto gap-4 pb-6 scrollbar-hide snap-x">
                    ${episodes.map((ep, i) => {
        const isActive = i === activeIndex;
        return `
                            <button onclick="location.href='/watch-series.html?id=${seriesId}&ep=${i}'" 
                                    class="min-w-[160px] md:min-w-[200px] p-5 rounded-[1.5rem] border transition-all snap-start text-left group
                                    ${isActive ? 'bg-brand-primary border-brand-primary shadow-[0_0_30px_rgba(251,191,36,0.3)]' : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}">
                                <p class="text-[9px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-black/60' : 'text-gray-500 group-hover:text-brand-primary'}">Episode ${i + 1}</p>
                                <h4 class="text-xs md:text-sm font-black Thai-font line-clamp-1 ${isActive ? 'text-black' : 'text-white'}">${UI.escapeHTML(ep.title)}</h4>
                            </button>`;
    }).join('')}
                </div>
            </div>`;
    },

    renderVIPUpgradeModal: async () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4';
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
            const settingsSnap = await getDoc(doc(db, 'site_settings', 'payment_info'));
            const data = settingsSnap.exists() ? settingsSnap.data() : { wallet: '097-193-7338', name: 'DUYดูDEE' };
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
    }
};

window.UI = UI;



