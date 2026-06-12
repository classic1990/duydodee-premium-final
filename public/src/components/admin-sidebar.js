// 💠 Admin Sidebar Component - admin-sidebar.js
import { auth, signOut, logActivity } from '/src/services/firebase.js';

export const AdminSidebar = {
    /**
     * Render the sidebar HTML and initialize its logic
     * @param {Object} user - The authenticated Firebase user object
     */
    render: (user) => {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) {
            console.error('[AdminSidebar] Container #sidebar not found');
            return;
        }

        const menuItems = [
            { label: 'แดชบอร์ด', icon: 'layout-dashboard', path: '/admin/admin-manage.html' },
            { label: 'จัดการหนัง', icon: 'film', path: '/admin/admin-manage-movies.html' },
            { label: 'จัดการซีรีส์', icon: 'tv', path: '/admin/admin-manage-series.html' },
            { label: 'สไลเดอร์หน้าแรก', icon: 'images', path: '/admin/admin-hero-slider.html' },
            { label: 'จัดการสมาชิก', icon: 'users', path: '/admin/admin-users.html' },
            { label: 'ตั้งค่าระบบ', icon: 'settings', path: '/admin/admin-system.html' },
            { label: 'Migration ข้อมูล', icon: 'database-zap', path: '/admin/admin-migration.html' }
        ];

        const currentPath = window.location.pathname;
        const avatar = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'A')}&background=FBBF24&color=000`;

        sidebar.innerHTML = `
            <div class="flex flex-col h-full bg-[#0A0A0A] border-r border-white/5">
                <!-- Profile -->
                <div class="p-6 border-b border-white/5">
                    <div id="admin-sidebar-profile" class="flex items-center gap-3">
                        <img src="${avatar}" class="w-10 h-10 rounded-xl object-cover border border-brand-primary/20">
                        <div class="overflow-hidden">
                            <p class="text-xs font-black text-white truncate Thai-font">${user.displayName || 'แอดมิน'}</p>
                            <p class="text-[9px] font-bold text-brand-primary uppercase tracking-widest">ADMIN</p>
                        </div>
                    </div>
                </div>

                <!-- Nav -->
                <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
                    ${menuItems.map(item => {
            const isActive = currentPath.includes(item.path);
            return `
                        <a href="${item.path}" class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${isActive ? 'bg-brand-primary text-black' : 'text-gray-400 hover:bg-white/5 hover:text-brand-primary'}">
                            <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-black/10' : 'bg-white/5 group-hover:bg-brand-primary/10'}">
                                <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                            </div>
                            <span class="text-sm font-bold Thai-font">${item.label}</span>
                        </a>`;
        }).join('')}
                </nav>

                <!-- Logout -->
                <div class="p-4 border-t border-white/5">
                    <button id="admin-logout-btn" class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all group">
                        <div class="w-8 h-8 rounded-lg bg-red-500/5 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                            <i data-lucide="log-out" class="w-4 h-4"></i>
                        </div>
                        <span class="text-sm font-bold Thai-font">ออกจากระบบ</span>
                    </button>
                </div>
            </div>
        `;

        AdminSidebar.initEvents(user);
    },

    initEvents: (user) => {
        if (window.lucide) window.lucide.createIcons();

        // Toggle Logic for Mobile/Viewport
        const toggleBtn = document.getElementById('sidebar-toggle-btn');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('admin-overlay');

        const close = () => {
            sidebar?.classList.add('-translate-x-full');
            overlay?.classList.add('hidden');
        };

        const open = () => {
            sidebar?.classList.remove('-translate-x-full');
            overlay?.classList.remove('hidden');
        };

        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar?.classList.contains('-translate-x-full') ? open() : close();
        });

        overlay?.addEventListener('click', close);

        // Global Logout Action
        document.getElementById('admin-logout-btn')?.addEventListener('click', async () => {
            if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
                await logActivity('ADMIN_LOGOUT', { email: user.email });
                await signOut(auth);
                window.location.replace('/login.html');
            }
        });
    }
};