/**
 * 🎨 DUYดูDEE UI ENGINE (Refactored)
 * A lightweight facade for decomposed UI modules.
 */

import { UIUtils } from '../utils/ui-utils.js';
import { MovieCards } from './cards/MovieCards.js';
import { Layout } from './layout/Layout.js';
import { HeroSlider } from './layout/HeroSlider.js';
import { VideoPlayer } from './player/VideoPlayer.js';
import { Modals } from './modals/Modals.js';

export const UI = {
    // Utilities from UIUtils
    ...UIUtils,

    // Core Modules
    ...MovieCards,
    ...Layout,
    ...HeroSlider,
    ...VideoPlayer,
    ...Modals,

    // UI Orchestration Helpers
    refreshIcons: () => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    setCounter: (id, count) => {
        const el = document.getElementById(id);
        if (el) {
            // Clear existing interval if it exists
            if (el.dataset.intervalId) {
                clearInterval(parseInt(el.dataset.intervalId));
            }

            let current = 0;
            const target = parseInt(count);
            const step = Math.ceil(target / 20);
            const interval = setInterval(() => {
                current += step;
                if (current >= target) {
                    el.innerText = target.toLocaleString();
                    clearInterval(interval);
                    delete el.dataset.intervalId; // Clean up
                } else {
                    el.innerText = current.toLocaleString();
                }
            }, 50);
            el.dataset.intervalId = interval;
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

    showImageLightbox: (url) => {
        const lightbox = document.createElement('div');
        lightbox.className = 'fixed inset-0 z-[10000] bg-brand-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10 animate-fade-in cursor-zoom-out';
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

    renderEmptyState: (container, message) => {
        if (!container) {
            return;
        }
        container.innerHTML = `
            <div class="col-span-full py-12 sm:py-16 text-center animate-fade-in">
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
        field.innerHTML = '<div class="star-layer"></div><div class="mesh-gradient-bg"><div class="blob blob-1"></div><div class="blob blob-2"></div></div>';
        document.body.prepend(field);
    },

    updateMeta: (data) => {
        const title = data.title ? `${data.title} - DUYดูDEE PREMIUM` : 'DUYดูDEE PREMIUM - สตรีมมิ่งความบันเทิงระดับโลก';
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
                    <a href="/index.html" class="btn-primary px-10 py-4 text-xs font-black uppercase tracking-widest">กลับสู่หน้าหลัก</a>
                    <button onclick="location.reload()" class="px-10 py-4 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">ลองใหม่อีกครั้ง</button>
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
        container.innerHTML = items.map((item) => UI.createMovieCard({ ...item, type })).join('');
        UI.refreshIcons();
    },

    // Method wrappers that pass 'this' as UI to modules
    initNavbar: function() {
        return Layout.initNavbar(this);
    },
    loadHeroSlides: function(id) {
        return HeroSlider.loadHeroSlides(id, this);
    },
    renderiPhonePlayer: function(d, ep, idx, isS) {
        return VideoPlayer.renderiPhonePlayer(d, ep, idx, isS, this);
    },
    renderVIPUpgradeModal: function() {
        return Modals.renderVIPUpgradeModal(this);
    },
    renderTicketModal: function() {
        return Modals.renderTicketModal(this);
    }
};

window.UI = UI;
