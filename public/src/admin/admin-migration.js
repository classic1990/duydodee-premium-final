import { checkAdminAccess } from '/src/middleware/auth-guard.js';
import { migrateThaiToEnglishFields } from './data-migration.js';

async function init() {
    try {
        // 1. ตรวจสอบสิทธิ์ Admin ก่อนเริ่มใช้งาน
        await checkAdminAccess();

        const btn = document.getElementById('run-migration-btn');
        const statusBox = document.getElementById('migration-status');

        btn.addEventListener('click', async () => {
            if (!confirm('คุณต้องการเริ่มกระบวนการ Migration ข้อมูลใช่หรือไม่?')) return;

            btn.disabled = true;
            btn.textContent = 'กำลังดำเนินการ...';
            statusBox.classList.remove('hidden');
            statusBox.innerHTML = '<p class="text-yellow-500">>> กำลังเริ่มงาน...</p>';

            try {
                // เรียกใช้ Migration Logic
                const count = await migrateThaiToEnglishFields();

                statusBox.innerHTML += `<p class="text-green-500 mt-2">>> สำเร็จ! อัปเดตไปทั้งหมด ${count} รายการ</p>`;
                btn.textContent = 'ดำเนินการเสร็จสิ้น';
                btn.classList.replace('bg-yellow-500', 'bg-green-500');
            } catch (err) {
                statusBox.innerHTML += `<p class="text-red-500 mt-2">>> เกิดข้อผิดพลาด: ${err.message}</p>`;
                btn.disabled = false;
                btn.textContent = 'ลองอีกครั้ง';
            }
        });

    } catch (err) {
        console.error('Unauthorized access');
        window.location.replace('/login.html');
    }
}

document.addEventListener('DOMContentLoaded', init);