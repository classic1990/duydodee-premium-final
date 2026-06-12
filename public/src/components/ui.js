/**
 * 🎨 DUYดูDEE UI CORE ENGINE
 * Clean, modular, and high-performance UI components.
 */
import { auth, onAuthStateChanged, db, doc, getDoc, SCHEMA } from '../services/firebase.js';

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
        const authArea = document.getElementById('user-auth-area');
        if (!authArea) return;

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userSnap = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, user.uid));
                    const userData = userSnap.exists() ? userSnap.data() : {};
                    
                    authArea.innerHTML = `
                        <div class="flex items-center gap-4">
                            <a href="/profile.html" class="flex items-center gap-3 group">
                                <div class="w-10 h-10 rounded-xl border border-white/10 overflow-hidden group-hover:border-brand-primary transition-colors">
                                    <img src="${userData.photoURL || '/assets/logo/DUYDODEE.png'}" class="w-full h-full object-cover">
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

    showToast: (message, type = 'success') => {
        const container = document.getElementById('toast-container') || (() => {
            const c = document.createElement('div');
            c.id = 'toast-container';
            c.className = 'fixed bottom-8 right-8 z-[2000] flex flex-col gap-3';
            document.body.appendChild(c);
            return c;
        })();

        const toast = document.createElement('div');
        const styles = {
            success: 'bg-green-500/10 border-green-500/50 text-green-500',
            error: 'bg-red-500/10 border-red-500/50 text-red-500',
            info: 'bg-blue-500/10 border-blue-500/50 text-blue-500'
        };

        toast.className = `flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl animate-fade-left ${styles[type] || styles.success}`;
        toast.innerHTML = `<span class="text-xs font-bold">${message}</span>`;
        
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-x-full');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    createCard: (item) => {
        const title = item.title || 'Untitled';
        const poster = item.poster || '/assets/logo/DUYDODEE.png';
        const type = item.type || 'movie';
        const id = item.id;
        const watchUrl = type === 'series' ? `/watch-series.html?id=${id}` : `/watch-movie.html?id=${id}`;

        return `
            <div class="group relative aspect-[2/3] rounded-2xl overflow-hidden bg-brand-obsidian border border-white/5 cursor-pointer" 
                 onclick="window.location.href='${watchUrl}'">
                <img src="${poster}" alt="${title}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy">
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
    }
};

window.UI = UI;
