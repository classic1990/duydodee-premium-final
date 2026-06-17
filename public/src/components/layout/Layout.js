import {
    db,
    auth,
    onSnapshot,
    query,
    collection,
    where,
    checkIsAdmin,
    onAuthStateChanged,
    getDoc,
    doc,
    SCHEMA
} from '../../services/firebase.js';

export const Layout = {
    initNavbar: (UI) => {
        const nav = document.getElementById('main-nav');
        if (!nav) {
            return;
        }

        UI.initTheme();

        // Add theme toggle button to navbar
        const themeToggleContainer = document.getElementById('theme-toggle-container');
        if (themeToggleContainer) {
            themeToggleContainer.innerHTML = UI.createButton();
            UI.refreshIcons();
        }

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
        Layout.initAuthStatus(UI);
    },

    initAuthStatus: (UI) => {
        const dArea = document.getElementById('user-profile-area');
        const mArea = document.getElementById('user-profile-area-mobile');

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(
                        doc(db, SCHEMA.COLLECTIONS.USERS, user.uid)
                    );
                    const userData = userDoc.exists() ? userDoc.data() : {};
                    const isAdmin = await checkIsAdmin(user);

                    const profileHTML = `
                        <div class="flex items-center gap-4">
                            ${isAdmin ? '<a href="/admin/admin-manage.html" class="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"><i data-lucide="layout-dashboard" class="w-3 h-3"></i> Dashboard</a>' : ''}
                            <a href="/profile.html" class="w-10 h-10 rounded-xl border border-white/10 overflow-hidden"><img src="${userData.photoURL || '/assets/logo/DUYDODEE.png'}" class="w-full h-full object-cover"></a>
                        </div>`;

                    const mobileProfileHTML = `
                        <a href="/profile.html" class="flex flex-col items-center gap-1 p-2 text-brand-primary transition-all duration-300 group relative">
                            <div class="w-6 h-6 rounded-lg border border-brand-primary/30 overflow-hidden group-hover:scale-110 transition-transform">
                                <img src="${userData.photoURL || '/assets/logo/DUYDODEE.png'}" class="w-full h-full object-cover">
                            </div>
                            <span class="text-[9px] font-black Thai-font uppercase tracking-tighter">โปรไฟล์</span>
                            <span class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-primary rounded-full"></span>
                        </a>`;

                    if (dArea) {
                        dArea.innerHTML = profileHTML;
                    }
                    if (mArea) {
                        mArea.innerHTML = mobileProfileHTML;
                    }
                } catch (e) {
                    console.error('Auth Status Init Error:', e);
                }
            } else {
                const loginHTML = '<a href="/login.html" class="btn-primary py-2 px-6 text-[10px]">เข้าสู่ระบบ</a>';
                const mobileLoginHTML = `
                    <a href="/login.html" class="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-brand-primary transition-all duration-300 group">
                        <i data-lucide="user" class="w-5 h-5 group-hover:scale-110 transition-transform"></i>
                        <span class="text-[9px] font-bold Thai-font">เข้าสู่ระบบ</span>
                    </a>`;

                if (dArea) {
                    dArea.innerHTML = loginHTML;
                }
                if (mArea) {
                    mArea.innerHTML = mobileLoginHTML;
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

        if (isAdmin) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                const q = query(
                    collection(db, SCHEMA.COLLECTIONS.TICKETS),
                    where('status', '==', 'open')
                );
                onSnapshot(q, (snap) => {
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
    },

    highlightActiveNav: () => {
        const path = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach((link) => {
            if (link.getAttribute('href') === path) {
                link.classList.add('text-brand-primary');
            }
        });
    }
};
