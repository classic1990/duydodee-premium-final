/**
 * 🛰️ Sidebar Dynamic Injection Engine
 * ทำหน้าที่โหลดไฟล์ sidebar.html และจัดการสถานะเมนู
 */
export async function injectAdminSidebar() {
    const sidebarContainer = document.getElementById('sidebar');
    const overlay = document.getElementById('admin-overlay');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');

    if (!sidebarContainer) {
        return;
    }

    try {
        // 1. ดึงไฟล์ Template
        const response = await fetch('/admin/components/sidebar.html');
        if (!response.ok) {
            throw new Error('Sidebar template not found');
        }
        const html = await response.text();

        // 2. ฉีด HTML เข้าไปใน Container
        sidebarContainer.innerHTML = html;

        // 3. จัดการสถานะเมนูที่กำลังใช้งานอยู่ (Active Link)
        const currentPath = window.location.pathname;
        const links = sidebarContainer.querySelectorAll('.nav-link');

        links.forEach(link => {
            const href = link.getAttribute('href');
            // เช็คว่า path ตรงกันหรือไม่ (รองรับทั้งแบบเต็มและแบบสั้น)
            if (href === currentPath || (currentPath === '/admin/' && href.includes('admin-manage'))) {
                link.classList.add('bg-brand-primary/10', 'text-white', 'border-r-2', 'border-brand-primary');
                const icon = link.querySelector('i');
                if (icon) {
                    icon.classList.add('text-brand-primary');
                }
            }
        });

        // 4. ตั้งค่า Mobile Toggle (ถ้ามีปุ่มและ Overlay ในหน้านั้น)
        if (toggleBtn && overlay) {
            toggleBtn.onclick = () => {
                sidebarContainer.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
            };
            overlay.onclick = () => {
                sidebarContainer.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
            };
        }

        // 5. สั่งให้ Lucide สร้าง Icon ใหม่หลังจากฉีด HTML
        if (window.lucide) {
            window.lucide.createIcons();
        }

    } catch (error) {
        console.error('Failed to inject sidebar:', error);
    }
}
